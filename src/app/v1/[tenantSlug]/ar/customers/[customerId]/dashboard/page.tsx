import { db } from "@/lib/prisma";
import { ARService } from "@/service/ar.service";
import Link from "next/link";

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; customerId: string }>;
}) {
  const { tenantSlug, customerId } = await params;
  const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return <div style={styles.error}>Tenant not found.</div>;

  const customer = await db.customer.findUnique({
    where: { id: customerId, tenantId: tenant.id },
  });

  if (!customer) return <div style={styles.error}>Customer not found.</div>;

  const outstanding = await ARService.getCustomerOutstanding(
    tenant.id,
    customerId,
  );
  const creditLimit = customer.creditLimit || 0;
  const availableCredit = Number(creditLimit) - Number(outstanding);

  const recentTransactions = await db.ledgerTransaction.findMany({
    where: { tenantId: tenant.id, customerId },
    orderBy: { date: "desc" },
    take: 5,
  });

  return (
    <div
      style={{
        padding: "24px",
        color: "#f8fafc",
        backgroundColor: "#030712",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            {customer.name} Financial Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            {customer.company || "Individual Account"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href={`/v1/${tenantSlug}/ar/customers/${customerId}/ledger`}
            style={styles.btn}
          >
            View Ledger
          </Link>
          <Link
            href={`/v1/${tenantSlug}/ar/customers/${customerId}/statement`}
            style={styles.btnAlt}
          >
            Monthly Statement
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={styles.card}>
          <span style={styles.cardTitle}>Outstanding Balance</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#f43f5e" }}>
            RM {Number(outstanding).toFixed(2)}
          </span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardTitle}>Credit Limit</span>
          <span style={{ fontSize: "20px", fontWeight: 700 }}>
            RM {Number(creditLimit).toFixed(2)}
          </span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardTitle}>Available Credit</span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>
            RM {availableCredit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Recent Ledger Feed */}
      <div style={styles.card}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>
          Recent Ledger Activity
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #1e293b",
                color: "#94a3b8",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>Type</th>
              <th style={{ padding: "8px" }}>Reference</th>
              <th style={{ padding: "8px" }}>Debit (RM)</th>
              <th style={{ padding: "8px" }}>Credit (RM)</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No ledger transactions found.
                </td>
              </tr>
            ) : (
              recentTransactions.map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #0f172a" }}>
                  <td style={{ padding: "8px" }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px" }}>{tx.type}</td>
                  <td style={{ padding: "8px" }}>{tx.referenceNumber}</td>
                  <td style={{ padding: "8px" }}>
                    {Number(tx.debit) > 0 ? Number(tx.debit).toFixed(2) : "-"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {Number(tx.credit) > 0 ? Number(tx.credit).toFixed(2) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    padding: "16px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  cardTitle: { fontSize: "12px", color: "#94a3b8", fontWeight: 600 },
  btn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
  },
  btnAlt: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #334155",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
  },
  error: {
    padding: "40px",
    color: "#f43f5e",
    backgroundColor: "#030712",
    minHeight: "100vh",
  },
};
