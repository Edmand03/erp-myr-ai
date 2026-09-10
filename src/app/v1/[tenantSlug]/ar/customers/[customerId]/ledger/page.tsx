//@ts-nocheck
import { db } from "@/lib/prisma";
import { ARService } from "@/service/ar.service";
import CustomerLedgerClient from "./CustomerLedgerClient";

export default async function CustomerLedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string; customerId: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    type?: string;
  }>;
}) {
  const { tenantSlug, customerId } = await params;
  const query = await searchParams;

  const startDateStr = query.startDate || "";
  const endDateStr = query.endDate || "";
  const typeFilter = query.type || "";

  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return <div style={styles.stateMessage}>Tenant not found.</div>;

  const customer = await db.customer.findUnique({
    where: { id: customerId, tenantId: tenant.id },
  });
  if (!customer)
    return <div style={styles.stateMessage}>Customer not found.</div>;

  const ledgerResult = await ARService.getCustomerLedger(
    tenant.id,
    customerId,
    {
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      type: typeFilter || undefined,
    },
  );

  const transactions = ledgerResult?.transactions || ledgerResult || [];

  return (
    <CustomerLedgerClient
      tenantSlug={tenantSlug}
      customerId={customerId}
      customer={customer}
      transactions={transactions}
      startDateStr={startDateStr}
      endDateStr={endDateStr}
      typeFilter={typeFilter}
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
