import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> },
) {
  try {
    const { tenantSlug, customerId } = await params;
    const url = new URL(req.url);
    const month =
      url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const customer = await db.customer.findUnique({
      where: { id: customerId, tenantId: tenant.id },
    });
    if (!customer)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const priorTxs = await db.ledgerTransaction.findMany({
      where: { tenantId: tenant.id, customerId, date: { lt: startDate } },
    });

    let openingBalance = new Decimal(0);
    for (const tx of priorTxs) {
      openingBalance = openingBalance.add(tx.debit).sub(tx.credit);
    }

    const periodTxs = await db.ledgerTransaction.findMany({
      where: {
        tenantId: tenant.id,
        customerId,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { date: "asc" },
    });

    let runningBalance = new Decimal(openingBalance);
    const transactionsWithBalance = periodTxs.map((tx) => {
      runningBalance = runningBalance.add(tx.debit).sub(tx.credit);
      return { ...tx, runningBalance: runningBalance.toNumber() };
    });

    const outstandingBalance = await db.invoice.aggregate({
      where: { tenantId: tenant.id, customerId, status: { not: "CANCELLED" } },
      _sum: { total: true, amountPaid: true },
    });

    const totalInvoiced = outstandingBalance._sum.total || 0;
    const totalPaid = outstandingBalance._sum.amountPaid || 0;
    const currentOutstanding = Number(totalInvoiced) - Number(totalPaid);

    return NextResponse.json({
      success: true,
      statementPeriod: month,
      customer,
      openingBalance: openingBalance.toNumber(),
      transactions: transactionsWithBalance,
      closingBalance: runningBalance.toNumber(),
      outstandingBalance: currentOutstanding,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
