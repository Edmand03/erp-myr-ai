//@ts-nocheck
"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export async function recordPaymentAndAllocate({
  tenantId,
  customerId,
  tenantSlug,
  amountReceived,
  paymentDate,
  referenceNumber,
  notes,
  allocations, // Array of { invoiceId: string, allocatedAmount: number }
}: {
  tenantId: string;
  customerId: string;
  tenantSlug: string;
  amountReceived: number;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  allocations: { invoiceId: string; allocatedAmount: number }[];
}) {
  try {
    await db.$transaction(async (tx) => {
      const paymentTotal = new Decimal(amountReceived);

      // 1. Create the payment record (or ledger entry representing the payment)
      // Note: Adjust table name depending on your Prisma schema (e.g., tx.payment or tx.ledgerTransaction)
      const ledgerEntry = await tx.ledgerTransaction.create({
        data: {
          tenantId,
          customerId,
          date: new Date(paymentDate),
          type: "PAYMENT",
          referenceNumber: referenceNumber || `PAY-${Date.now()}`,
          description: notes || "Customer payment received",
          debit: 0,
          credit: paymentTotal,
        },
      });

      let totalAllocated = new Decimal(0);

      // 2. Loop through allocations and update invoices
      for (const allocation of allocations) {
        if (allocation.allocatedAmount <= 0) continue;

        const allocDecimal = new Decimal(allocation.allocatedAmount);
        totalAllocated = totalAllocated.add(allocDecimal);

        const invoice = await tx.invoice.findUnique({
          where: { id: allocation.invoiceId },
        });

        if (!invoice)
          throw new Error(`Invoice ${allocation.invoiceId} not found`);

        const newAmountPaid = new Decimal(invoice.amountPaid).add(allocDecimal);
        const isPaidInFull = newAmountPaid.gte(invoice.total);

        await tx.invoice.update({
          where: { id: allocation.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status: isPaidInFull ? "PAID" : "PARTIALLY_PAID",
          },
        });
      }

      if (totalAllocated.gt(paymentTotal)) {
        throw new Error(
          "Total allocated amount exceeds the payment amount received.",
        );
      }
    });

    revalidatePath(`/v1/${tenantSlug}/ar/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
