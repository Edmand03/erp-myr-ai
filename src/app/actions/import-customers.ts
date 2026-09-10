"use server";
import { db } from "@/lib/prisma";

export async function importCustomerRowsAction(
  tenantId: string,
  customerBlocks: string[],
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

    // 2. Map blocks into an array of async database promises
    const upsertPromises = customerBlocks.map(async (block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      const codeLine = lines[0];
      if (!codeLine || !codeLine.startsWith("300-")) return;

      const emailLine = lines.find(
        (l) =>
          l.includes("@") ||
          l.includes("gmail") ||
          l.includes("yahoo") ||
          l.includes(".com"),
      );
      const email = emailLine ? emailLine.replace(">", ".") : null;

      const phoneLine = lines.find((l) => l.includes("Tel :"));
      let phone = null;
      if (phoneLine) {
        const telPart = phoneLine.split("Tel :")[1]?.split(";")[0]?.trim();
        phone = telPart && telPart !== "-" ? telPart : null;
      }

      let nameIndex = 1;
      if (lines[1] && /^\d{12}$/.test(lines[1])) nameIndex = 2;
      if (lines[2] && lines[2].startsWith("(")) nameIndex = 3;

      const name = lines[nameIndex] || "Unknown Customer";

      // Check existing customer and perform safe upsert
      const existing = await db.customer.findFirst({
        where: { tenantId, name },
      });

      if (existing) {
        await db.customer.update({
          where: { id: existing.id },
          data: { phone, email },
        });
      } else {
        await db.customer.create({
          data: {
            tenantId,
            name,
            phone,
            email,
            creditLimit: 0.0,
          },
        });
      }
      importedCount++;
    });

    // Run database queries concurrently in batches to protect connection pool
    // Splitting into chunks of 20 prevents overwhelming PostgreSQL
    const chunkSize = 20;
    for (let i = 0; i < upsertPromises.length; i += chunkSize) {
      const chunk = upsertPromises.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} customers!`,
    };
  } catch (err: any) {
    console.error("Database Import Error:", err);
    return {
      success: false,
      error: err.message || "An unknown database error occurred.",
    };
  }
}
