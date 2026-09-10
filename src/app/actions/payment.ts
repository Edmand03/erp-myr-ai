"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export async function collectPayment(formData: FormData) {
  try {
    const tenantId = formData.get("tenantId") as string;
    const customerId = formData.get("customerId") as string;
    const invoiceId = formData.get("invoiceId") as string;
    const amountStr = formData.get("amount") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const referenceNo = formData.get("referenceNo") as string;
    const notes = formData.get("notes") as string;

    const paymentAmount = new Decimal(amountStr);

    if (paymentAmount.lte(0)) {
      throw new Error("Payment amount must be greater than zero.");
    }

    // 1. Fetch the target invoice
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new Error("Invoice not found or unauthorized.");
    }

    // Calculate remaining balance using Decimal math
    const invoiceTotal = new Decimal(invoice.total);
    const currentPaid = new Decimal(invoice.amountPaid);
    const remainingBalance = invoiceTotal.sub(currentPaid);

    if (paymentAmount.gt(remainingBalance)) {
      throw new Error(
        `Payment amount (RM ${paymentAmount.toFixed(2)}) exceeds remaining balance (RM ${remainingBalance.toFixed(2)}).`,
      );
    }

    const newAmountPaid = currentPaid.add(paymentAmount);
    // Determine new status
    let newStatus = "PARTIALLY_PAID";
    if (newAmountPaid.equals(invoiceTotal)) {
      newStatus = "PAID";
    }

    // 2. Execute database transaction to record Payment, Allocation, and update Invoice
    await db.$transaction(async (tx) => {
      // Create the main Payment record
      const payment = await tx.payment.create({
        data: {
          tenantId,
          customerId,
          amount: paymentAmount,
          paymentMethod,
          referenceNo: referenceNo || null,
          notes: notes || null,
        },
      });

      // Link payment to invoice via PaymentAllocation
      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          //@ts-ignore
          amount: paymentAmount,
        },
      });

      // Update invoice amountPaid and status
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
      });
    });

    revalidatePath(`/v1/${tenantId}/sales`);
    return { success: true, message: "Payment collected successfully!" };
  } catch (error: any) {
    console.error("Payment collection error:", error);
    return {
      success: false,
      error: error.message || "Failed to process payment.",
    };
  }
}
