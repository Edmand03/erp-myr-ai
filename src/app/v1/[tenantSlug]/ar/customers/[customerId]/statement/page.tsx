import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

import StatementClientView from "./StatementClientView";

export default async function CustomerStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string; customerId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { tenantSlug, customerId } = await params;
  const resolvedSearch = await searchParams;
  const month = resolvedSearch.month || new Date().toISOString().slice(0, 7); // YYYY-MM

  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return <div style={styles.stateMessage}>Tenant not found.</div>;

  const customer = await db.customer.findUnique({
    where: { id: customerId, tenantId: tenant.id },
  });
  if (!customer)
    return <div style={styles.stateMessage}>Customer not found.</div>;

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
    return {
      ...tx,
      runningBalance: runningBalance.toNumber(),
      date: tx.date.toISOString(),
    };
  });

  const outstandingBalance = await db.invoice.aggregate({
    where: { tenantId: tenant.id, customerId, status: { not: "CANCELLED" } },
    _sum: { total: true, amountPaid: true },
  });

  const totalInvoiced = outstandingBalance._sum.total || 0;
  const totalPaid = outstandingBalance._sum.amountPaid || 0;
  const currentOutstanding = Number(totalInvoiced) - Number(totalPaid);

  const statementData = {
    statementPeriod: month,
    customer,
    openingBalance: openingBalance.toNumber(),
    transactions: transactionsWithBalance,
    closingBalance: runningBalance.toNumber(),
    outstandingBalance: currentOutstanding,
  };

  return (
    <StatementClientView
      tenantSlug={tenantSlug}
      customerId={customerId}
      initialData={statementData}
      initialMonth={month}
    />
  );
}

const styles = {
  stateMessage: {
    padding: "40px",
    color: "#94a3b8",
    backgroundColor: "#030712",
    minHeight: "100vh",
    textAlign: "center" as const,
  },
};
