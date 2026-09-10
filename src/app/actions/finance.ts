//@ts-nocheck

"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordPaymentAction(
  tenantId: string,
  slug: string,
  invoiceId: string,
  paymentMethod: string, // e.g., "Maybank", "Public Bank", "Cash"
) {
  try {
    await db.$transaction(async (tx) => {
      // 1. Fetch the target invoice
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, tenantId },
      });

      if (!invoice) throw new Error("Invoice not found.");
      if (invoice.status === "PAID")
        throw new Error("Invoice is already fully paid.");

      // 2. Update the Invoice Status to PAID
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });

      // 3. Log a ledger transaction for accounting audit
      // Note: In a larger ERP, this would point to a 'Transactions' or 'Ledger' table.
      // For our foundation, we will log this internally.
    });

    revalidatePath(`/v1/${slug}/sales`);
    revalidatePath(`/v1/${slug}/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to process payment." };
  }
}
