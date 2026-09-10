import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> },
) {
  try {
    const { tenantSlug, customerId } = await params;
    const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const unpaidInvoices = await db.invoice.findMany({
      where: {
        tenantId: tenant.id,
        customerId,
        status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] },
      },
    });

    const now = new Date();
    const buckets = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      days90Plus: 0,
    };

    for (const inv of unpaidInvoices) {
      const remaining = new Decimal(inv.total).sub(inv.amountPaid).toNumber();
      const dueDate = new Date(inv.dueDate);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) buckets.current += remaining;
      else if (diffDays <= 30) buckets.days1_30 += remaining;
      else if (diffDays <= 60) buckets.days31_60 += remaining;
      else if (diffDays <= 90) buckets.days61_90 += remaining;
      else buckets.days90Plus += remaining;
    }

    return NextResponse.json({ success: true, ageingBuckets: buckets });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
