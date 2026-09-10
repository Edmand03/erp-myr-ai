"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProductAction(
  tenantId: string,
  slug: string,
  data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stockQty: number;
  },
) {
  if (!data.sku || !data.name || data.price < 0)
    return { error: "Invalid values" };

  try {
    const skuUpper = data.sku.toUpperCase();
    const existingProduct = await db.product.findUnique({
      where: { tenantId_sku: { tenantId, sku: skuUpper } },
    });

    if (existingProduct) return { error: `SKU "${skuUpper}" already exists.` };

    // Transaction: Register product and seed the initial movement log simultaneously
    await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId,
          sku: skuUpper,
          name: data.name,
          description: data.description,
          price: data.price,
          stockQty: data.stockQty,
        },
      });

      if (data.stockQty > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: data.stockQty,
            type: "INFLOW",
            reason: "Initial baseline stock registry setup",
          },
        });
      }
    });

    revalidatePath(`/v1/${slug}/inventory`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create inventory asset line." };
  }
}

export async function adjustStockAdvanced(
  tenantId: string,
  slug: string,
  productId: string,
  adjustment: number,
  type: "INFLOW" | "OUTFLOW" | "ADJUSTMENT",
  reason: string,
) {
  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId, tenantId },
      });

      if (!product) throw new Error("Product not found");

      const targetQty = product.stockQty + adjustment;
      if (targetQty < 0) throw new Error("Stock count cannot be negative");

      // 1. Update master total count
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: targetQty },
      });

      // 2. Commit transaction log to historical ledger
      await tx.stockMovement.create({
        data: { productId, quantity: adjustment, type, reason },
      });
    });

    revalidatePath(`/v1/${slug}/inventory`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to process ledger movement." };
  }
}
