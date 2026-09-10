//@ts-nocheck

"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Register a Supplier
export async function createSupplierAction(
  tenantId: string,
  slug: string,
  data: { name: string; contactName?: string; email?: string; phone?: string },
) {
  if (!data.name) return { error: "Supplier name is required." };

  try {
    const supplier = await db.supplier.create({
      data: {
        tenantId,
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
      },
    });

    revalidatePath(`/v1/${slug}/procurement`);
    return { success: true, supplier };
  } catch (error) {
    return { error: "Failed to register supplier." };
  }
}

// 2. Direct Manual Stock Adjustment (Add/Subtract Stock Manually)
export async function adjustStockManuallyAction(
  tenantId: string,
  slug: string,
  productId: string,
  adjustmentQty: number, // positive to add, negative to subtract
  reason: string,
) {
  if (!productId || adjustmentQty === 0) {
    return { error: "Invalid product or quantity." };
  }

  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId, tenantId },
      });

      if (!product) throw new Error("Product not found.");

      const newQty = product.stockQty + adjustmentQty;
      if (newQty < 0)
        throw new Error("Adjustment would result in negative stock.");

      // Update product quantity
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: newQty },
      });
    });

    revalidatePath(`/v1/${slug}/inventory`);
    revalidatePath(`/v1/${slug}/procurement`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to adjust stock." };
  }
}

// 3. Create Multi-Item Purchase Order
export async function createPurchaseOrderAction(
  tenantId: string,
  slug: string,
  supplierId: string,
  poNumber: string,
  items: { productId: string; quantity: number; unitCost: number }[],
) {
  if (!supplierId || !poNumber || items.length === 0) {
    return { error: "Supplier, PO number, and items are required." };
  }

  try {
    const totalCost = items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );

    await db.purchaseOrder.create({
      data: {
        tenantId,
        supplierId,
        poNumber: poNumber.toUpperCase(),
        totalCost,
        status: "DRAFT",
        poItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
    });

    revalidatePath(`/v1/${slug}/procurement`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create Purchase Order." };
  }
}

// 4. Mark Purchase Order as RECEIVED (Automatically triggers stock addition)
export async function receivePurchaseOrderAction(
  tenantId: string,
  slug: string,
  poId: string,
) {
  try {
    await db.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId, tenantId },
        include: { poItems: true },
      });

      if (!po) throw new Error("Purchase Order not found.");
      if (po.status === "RECEIVED")
        throw new Error("Purchase Order is already marked as received.");

      // 1. Update PO Status
      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: "RECEIVED", deliveryDate: new Date() },
      });

      // 2. Increment stock quantities for each line item
      for (const item of po.poItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQty: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    revalidatePath(`/v1/${slug}/procurement`);
    revalidatePath(`/v1/${slug}/inventory`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to receive Purchase Order." };
  }
}
