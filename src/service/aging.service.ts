import { db } from "@/lib/prisma";

export class AgingService {
  static async getTenantAgingSummary(tenantId: string) {
    const invoices = await db.invoice.findMany({
      where: {
        tenantId,
        status: { notIn: ["PAID", "CANCELLED"] },
      },
      include: { customer: true },
    });

    const now = new Date();
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days60Plus = 0;

    invoices.forEach((inv) => {
      const balanceDue = Number(inv.total) - Number(inv.amountPaid);
      if (balanceDue <= 0) return;

      const dueDate = new Date(inv.dueDate || inv.createdAt);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        current += balanceDue;
      } else if (diffDays <= 30) {
        days1_30 += balanceDue;
      } else if (diffDays <= 60) {
        days31_60 += balanceDue;
      } else {
        days60Plus += balanceDue;
      }
    });

    return {
      current,
      days1_30,
      days31_60,
      days60Plus,
      totalOverdue: days1_30 + days31_60 + days60Plus,
    };
  }
}
