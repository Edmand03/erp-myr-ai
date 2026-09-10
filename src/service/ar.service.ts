import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const ARService = {
  // 1. Calculate Live Outstanding Balance
  async getCustomerOutstanding(tenantId: string, customerId: string) {
    const invoices = await db.invoice.findMany({
      where: { tenantId, customerId, status: { not: "CANCELLED" } },
      select: { total: true, amountPaid: true },
    });

    let totalInvoiced = new Decimal(0);
    let totalPaid = new Decimal(0);

    for (const inv of invoices) {
      totalInvoiced = totalInvoiced.add(inv.total);
      totalPaid = totalPaid.add(inv.amountPaid);
    }

    return totalInvoiced.sub(totalPaid);
  },

  // 2. Chronological Ledger Generator (Running Balance computed on-the-fly)
  async getCustomerLedger(
    tenantId: string,
    customerId: string,
    filters?: { startDate?: Date; endDate?: Date; type?: string },
  ) {
    const whereClause: any = { tenantId, customerId };
    if (filters?.startDate || filters?.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = filters.startDate;
      if (filters.endDate) whereClause.date.lte = filters.endDate;
    }
    if (filters?.type) {
      whereClause.type = filters.type;
    }

    const rawTransactions = await db.ledgerTransaction.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    let runningBalance = new Decimal(0);
    return rawTransactions.map((tx) => {
      const debit = new Decimal(tx.debit);
      const credit = new Decimal(tx.credit);
      runningBalance = runningBalance.add(debit).sub(credit);
      return {
        ...tx,
        runningBalance: runningBalance.toNumber(),
      };
    });
  },

  // 3. Payment Allocation & Ledger Transaction posting inside a Prisma Transaction
  async allocatePayment(
    tenantId: string,
    paymentId: string,
    allocations: Array<{ invoiceId: string; amount: number }>,
  ) {
    return await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId, tenantId },
      });
      if (!payment) throw new Error("Payment not found");

      let totalAllocated = new Decimal(0);

      for (const alloc of allocations) {
        const invoice = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId, tenantId },
        });
        if (!invoice) throw new Error(`Invoice ${alloc.invoiceId} not found`);

        const invoiceTotal = new Decimal(invoice.total);
        const invoicePaid = new Decimal(invoice.amountPaid);
        const invoiceRemaining = invoiceTotal.sub(invoicePaid);
        const allocAmount = new Decimal(alloc.amount);

        if (allocAmount.gt(invoiceRemaining)) {
          throw new Error(
            `Allocation amount exceeds remaining balance on invoice ${invoice.invoiceNumber}`,
          );
        }

        totalAllocated = totalAllocated.add(allocAmount);

        await tx.paymentAllocation.create({
          data: {
            tenantId,
            paymentId,
            invoiceId: invoice.id,
            allocatedAmount: allocAmount,
          },
        });

        const newAmountPaid = invoicePaid.add(allocAmount);
        const newStatus = newAmountPaid.gte(invoiceTotal)
          ? "PAID"
          : "PARTIALLY_PAID";

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newAmountPaid,
            status: newStatus,
          },
        });
      }

      if (totalAllocated.gt(payment.amount)) {
        throw new Error("Total allocated amount exceeds total payment value.");
      }

      await tx.ledgerTransaction.create({
        data: {
          tenantId,
          customerId: payment.customerId,
          type: "PAYMENT",
          referenceId: payment.id,
          referenceNumber: payment.referenceNo || "PAY-REF",
          description: `Payment received (${payment.paymentMethod})`,
          debit: 0,
          credit: totalAllocated,
          paymentId: payment.id,
        },
      });

      return { success: true, totalAllocated: totalAllocated.toNumber() };
    });
  },
};
