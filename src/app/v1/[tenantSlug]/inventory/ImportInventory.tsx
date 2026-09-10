"use server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function ImportInventoryRowsAction(
  tenantId: string,
  inventoryBlocks: string[],
) {
  try {
    if (!tenantId) return { success: false, error: "Tenant ID is required." };

    // 1. Verify tenant exists first
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        success: false,
        error: "Tenant ID does not exist in the database.",
      };
    }

    let importedCount = 0;

    // 2. Map blocks into an array of async database upsert promises
    const upsertPromises = inventoryBlocks.map(async (block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) return;

      const sku = lines[0];
      const name = lines[1] || "Unknown Electrical Part";

      const price = new Decimal(0.0);
      const stockQty = 0;

      // Use native Prisma upsert to safely handle concurrent updates/inserts
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
    });

    // Run database queries concurrently in batches of 20 to protect connection pool
    const chunkSize = 20;
    for (let i = 0; i < upsertPromises.length; i += chunkSize) {
      const chunk = upsertPromises.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} products!`,
    };
  } catch (err: any) {
    console.error("Database Inventory Import Error:", err);
    return {
      success: false,
      error: err.message || "An unknown database error occurred.",
    };
  }
}
