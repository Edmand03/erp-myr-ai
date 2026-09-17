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
    <div style={styles.pageWrapper}>
      <style>{`
        /* Global mobile responsiveness lockdown */
        * {
          box-sizing: border-box !important;
        }
        @media (max-width: 768px) {
          .mobile-container {
            padding: 12px !important;
            width: 100% !important;
            overflow-x: hidden !important;
          }
          .mobile-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .mobile-actions {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .mobile-actions a {
            text-align: center !important;
            width: 100% !important;
          }
          .mobile-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="mobile-container" style={styles.innerContainer}>
        {/* Header */}
        <div className="mobile-header" style={styles.header}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={styles.title}>{customer.name}</h1>
            <p style={styles.subtitle}>
              {customer.company || "Individual Account"}
            </p>
          </div>
          <div
            className="mobile-actions"
            style={{ display: "flex", gap: "8px" }}
          >
            <Link
              href={`/v1/${tenantSlug}/ar/customers/${customerId}/ledger`}
              style={styles.btnPrimary}
            >
              View Ledger
            </Link>
            <Link
              href={`/v1/${tenantSlug}/ar/customers/${customerId}/statement`}
              style={styles.btnSecondary}
            >
              Statement
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mobile-kpi-grid" style={styles.kpiGrid}>
          <div style={styles.card}>
            <span style={styles.cardTitle}>Outstanding Balance</span>
            <span
              style={{ fontSize: "20px", fontWeight: 700, color: "#f43f5e" }}
            >
              RM {Number(outstanding).toFixed(2)}
            </span>
          </div>
          <div style={styles.card}>
            <span style={styles.cardTitle}>Credit Limit</span>
            <span
              style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc" }}
            >
              RM {Number(creditLimit).toFixed(2)}
            </span>
          </div>
          <div style={styles.card}>
            <span style={styles.cardTitle}>Available Credit</span>
            <span
              style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}
            >
              RM {availableCredit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Recent Ledger Feed */}
        <div style={styles.card}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#f8fafc",
            }}
          >
            Recent Ledger Activity
          </h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Reference</th>
                  <th style={styles.th}>Debit (RM)</th>
                  <th style={styles.th}>Credit (RM)</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyCell}>
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <tr key={tx.id} style={styles.tr}>
                      <td style={styles.td}>
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>{tx.type}</td>
                      <td style={styles.td}>{tx.referenceNumber}</td>
                      <td style={styles.td}>
                        {Number(tx.debit) > 0
                          ? Number(tx.debit).toFixed(2)
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        {Number(tx.credit) > 0
                          ? Number(tx.credit).toFixed(2)
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#030712",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden" as const,
  },
  innerContainer: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    wordBreak: "break-word" as const,
  },
  subtitle: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    padding: "16px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    width: "100%",
  },
  cardTitle: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  btnPrimary: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  btnSecondary: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #334155",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto" as const,
    WebkitOverflowScrolling: "touch" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
    whiteSpace: "nowrap" as const,
  },
  tableHeaderRow: {
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    textAlign: "left" as const,
  },
  th: {
    padding: "10px 8px",
    fontWeight: 600,
  },
  tr: {
    borderBottom: "1px solid #0f172a",
    color: "#e2e8f0",
  },
  td: {
    padding: "10px 8px",
  },
  emptyCell: {
    padding: "20px",
    textAlign: "center" as const,
    color: "#64748b",
  },
  error: {
    padding: "40px",
    color: "#f43f5e",
    backgroundColor: "#030712",
    minHeight: "100vh",
  },
};
