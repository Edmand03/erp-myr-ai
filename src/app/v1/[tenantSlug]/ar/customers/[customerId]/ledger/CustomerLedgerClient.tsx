"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerLedgerClient({
  tenantSlug,
  customerId,
  customer,
  transactions,
  startDateStr,
  endDateStr,
  typeFilter,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const type = formData.get("type") as string;

    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (type) params.set("type", type);

    router.push(`?${params.toString()}`);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Non-printing Control Toolbar */}
      <div style={styles.toolbar} className="no-print">
        <Link
          href={`/v1/${tenantSlug}/ar/customers/${customerId}/dashboard`}
          style={styles.backBtn}
        >
          ← Back to Dashboard
        </Link>
        <button onClick={() => window.print()} style={styles.printBtn}>
          🖨️ Print Ledger
        </button>
      </div>

      {/* Ledger Document Sheet */}
      <div style={styles.sheet}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
              CUSTOMER LEDGER ACCOUNT
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Account: {customer.name}{" "}
              {customer.company ? `(${customer.company})` : ""}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
              Asia Electrical ERP
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Workspace: {tenantSlug}
            </p>
          </div>
        </div>

        {/* Filter Toolbar Form */}
        <form
          onSubmit={handleFilterSubmit}
          style={styles.filterBox}
          className="no-print"
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label style={styles.filterLabel}>Start Date</label>
              <input
                type="date"
                name="startDate"
                defaultValue={startDateStr}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.filterLabel}>End Date</label>
              <input
                type="date"
                name="endDate"
                defaultValue={endDateStr}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.filterLabel}>Type</label>
              <select
                name="type"
                defaultValue={typeFilter}
                style={styles.input}
              >
                <option value="">All Types</option>
                <option value="INVOICE">INVOICE</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="CREDIT_NOTE">CREDIT_NOTE</option>
                <option value="DEBIT_NOTE">DEBIT_NOTE</option>
              </select>
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button type="submit" style={styles.filterBtn}>
                Filter Ledger
              </button>
            </div>
          </div>
        </form>

        {/* Ledger Transactions Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Reference No</th>
              <th style={styles.th}>Description</th>
              <th style={styles.thRight}>Debit (RM)</th>
              <th style={styles.thRight}>Credit (RM)</th>
              <th style={styles.thRight}>Balance (RM)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  No ledger transactions found matching the filter criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id || Math.random()} style={styles.tableRow}>
                  <td style={styles.td}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{tx.type}</span>
                  </td>
                  <td style={styles.td}>{tx.referenceNumber || "-"}</td>
                  <td style={styles.td}>{tx.description || "-"}</td>
                  <td style={styles.tdRight}>
                    {Number(tx.debit) > 0 ? Number(tx.debit).toFixed(2) : "-"}
                  </td>
                  <td style={styles.tdRight}>
                    {Number(tx.credit) > 0 ? Number(tx.credit).toFixed(2) : "-"}
                  </td>
                  <td style={styles.tdRight}>
                    {Number(tx.runningBalance || tx.balance || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Note */}
        <div style={styles.footerNote}>
          <p>
            Chronological transaction ledger generated securely via ARService.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  toolbar: {
    width: "100%",
    maxWidth: "950px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  backBtn: {
    color: "#38bdf8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  printBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  sheet: {
    width: "100%",
    maxWidth: "950px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  filterBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "14px",
    borderRadius: "6px",
    marginBottom: "20px",
  },
  filterLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
  },
  input: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  filterBtn: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
  },
  tableHeaderRow: {
    backgroundColor: "#f1f5f9",
    borderBottom: "2px solid #cbd5e1",
    textAlign: "left" as const,
  },
  th: { padding: "10px", fontWeight: 600, color: "#334155" },
  thRight: {
    padding: "10px",
    fontWeight: 600,
    color: "#334155",
    textAlign: "right" as const,
  },
  tableRow: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px", color: "#1e293b" },
  tdRight: { padding: "10px", color: "#1e293b", textAlign: "right" as const },
  badge: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
  },
  footerNote: {
    marginTop: "40px",
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#94a3b8",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "16px",
  },
};
