"use server";
import { db } from "@/lib/prisma";
import pdfParse from "pdf-parse";
import { Decimal } from "@prisma/client/runtime/library";

export async function importInventoryRowsAction(
  tenantId: string,
  formData: FormData,
) {
  try {
    if (!tenantId) return { success: false, error: "Tenant ID is required." };

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        success: false,
        error: "Tenant ID does not exist in the database.",
      };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse text from PDF
    const pdfData = await pdfParse(buffer);
    const textLines = pdfData.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (textLines.length === 0) {
      return {
        success: false,
        error: "The uploaded PDF is empty or unreadable.",
      };
    }

    let importedCount = 0;
    const upsertPromises: Promise<any>[] = [];

    // Loop through lines or structure blocks based on your PDF layout format
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];

      // Example pattern matching assumption (adjust based on your exact PDF layout rows/columns)
      // Assuming a pattern where SKU starts with specific prefixes or follows a structured layout
      if (line.length > 0) {
        // You can customize this extraction logic depending on how your inventory PDF looks
        const sku = line.split(/\s+/)[0]; // Example: first token as SKU
        const name = line.substring(sku.length).trim() || "Unknown Item";
        const price = new Decimal(1.0); // Default or parse from line if available
        const stockQty = 0; // Default or parse from line if available

        if (!sku) continue;

        upsertPromises.push(
          (async () => {
            await db.product.upsert({
              where: {
                tenantId_sku: {
                  tenantId,
                  sku,
                },
              },
              update: {
                name,
                price,
                stockQty,
              },
              create: {
                tenantId,
                sku,
                name,
                price,
                stockQty,
              },
            });
            importedCount++;
          })(),
        );
      }
    }

    // Run database queries concurrently in batches of 20
    const chunkSize = 20;
    for (let i = 0; i < upsertPromises.length; i += chunkSize) {
      const chunk = upsertPromises.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} products from PDF!`,
    };
  } catch (err: any) {
    console.error("PDF Inventory Import Error:", err);
    return {
      success: false,
      error: err.message || "An unknown database error occurred.",
    };
  }
}
