"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(tenantId: string, formData: FormData) {
  const sku = formData.get("sku") as string;
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const initialStock = parseInt((formData.get("stockQty") as string) || "0");

  try {
    const product = await db.product.create({
      data: {
        tenantId,
        sku,
        name,
        price,
        stockQty: initialStock,
      },
    });

    // If initial stock > 0, log the movement
    if (initialStock > 0) {
      await db.stockMovement.create({
        data: {
          productId: product.id,
          quantity: initialStock,
          type: "INFLOW",
          reason: "Initial Stock Entry",
        },
      });
    }

    revalidatePath(`/v1/${tenantId}/products`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create product" };
  }
}
