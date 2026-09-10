//@ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StatementClientView({
  tenantSlug,
  customerId,
  initialData,
  initialMonth,
}: any) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const data = initialData;

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    router.push(
      `/v1/${tenantSlug}/ar/customers/${customerId}/statement?month=${newMonth}`,
    );
  };

  const {
    customer,
    statementPeriod,
    openingBalance,
    transactions,
    closingBalance,
    outstandingBalance,
  } = data;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.toolbar} className="no-print">
        <Link
          href={`/v1/${tenantSlug}/ar/customers/${customerId}/dashboard`}
          style={styles.backBtn}
        >
          ← Back to Dashboard
        </Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <label style={{ fontSize: "13px", color: "#94a3b8" }}>
            Statement Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            style={styles.monthInput}
          />
          <button onClick={() => window.print()} style={styles.printBtn}>
            🖨️ Print / Export PDF
          </button>
        </div>
      </div>

      <div style={styles.sheet}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
              STATEMENT OF ACCOUNT
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Period: {statementPeriod}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
              Asia Electrical ERP
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Tenant Workspace: {tenantSlug}
            </p>
          </div>
        </div>

        <div style={styles.infoBox}>
          <div>
            <p style={styles.labelTitle}>Billed To:</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              {customer.name}
            </p>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              {customer.company || "Individual Account"}
            </p>
            <p style={{ fontSize: "13px", color: "#475569" }}>
              {customer.email || "-"}
            </p>
          </div>
          <div
            style={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Opening Balance:{" "}
              </span>
              <span style={{ fontWeight: 600 }}>
                RM {Number(openingBalance).toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Closing Balance:{" "}
              </span>
              <span style={{ fontWeight: 600 }}>
                RM {Number(closingBalance).toFixed(2)}
              </span>
            </div>
            <div
              style={{
                marginTop: "4px",
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
              }}
            >
              <span
                style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}
              >
                Total Outstanding:{" "}
              </span>
              <span
                style={{ fontSize: "15px", fontWeight: 700, color: "#dc2626" }}
              >
                RM {Number(outstandingBalance).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Reference</th>
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
                    padding: "20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  No financial transactions recorded for this period.
                </td>
              </tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{tx.type}</span>
                  </td>
                  <td style={styles.td}>{tx.referenceNumber}</td>
                  <td style={styles.td}>{tx.description}</td>
                  <td style={styles.tdRight}>
                    {Number(tx.debit) > 0 ? Number(tx.debit).toFixed(2) : "-"}
                  </td>
                  <td style={styles.tdRight}>
                    {Number(tx.credit) > 0 ? Number(tx.credit).toFixed(2) : "-"}
                  </td>
                  <td style={styles.tdRight}>
                    {Number(tx.runningBalance).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={styles.footerNote}>
          <p>
            This is a computer-generated statement. No signature is required.
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
    maxWidth: "850px",
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
  monthInput: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "13px",
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
    maxWidth: "850px",
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
  infoBox: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "24px",
  },
  labelTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
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
