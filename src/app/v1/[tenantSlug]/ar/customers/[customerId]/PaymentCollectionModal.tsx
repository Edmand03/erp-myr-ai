//@ts-nocheck
"use client";

import { useState } from "react";
import { recordPaymentAndAllocate } from "./actions";

export default function PaymentCollectionModal({
  tenantId,
  tenantSlug,
  customerId,
  openInvoices,
}: {
  tenantId: string;
  tenantSlug: string;
  customerId: string;
  openInvoices: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<{
    [invoiceId: string]: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle allocation inputs tracking
  const handleAllocationChange = (invoiceId: string, val: string) => {
    setAllocations((prev) => ({ ...prev, [invoiceId]: val }));
  };

  // Auto-allocate helper: fills open invoices sequentially until amount is exhausted
  const handleAutoAllocate = () => {
    let remaining = parseFloat(amountReceived) || 0;
    const newAllocations: { [invoiceId: string]: string } = {};

    for (const inv of openInvoices) {
      if (remaining <= 0) break;
      const balanceDue = Number(inv.total) - Number(inv.amountPaid);
      const toAllocate = Math.min(remaining, balanceDue);
      newAllocations[inv.id] = toAllocate.toFixed(2);
      remaining -= toAllocate;
    }
    setAllocations(newAllocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formattedAllocations = Object.entries(allocations)
      .filter(([_, val]) => parseFloat(val) > 0)
      .map(([invoiceId, val]) => ({
        invoiceId,
        allocatedAmount: parseFloat(val),
      }));

    const result = await recordPaymentAndAllocate({
      tenantId,
      customerId,
      tenantSlug,
      amountReceived: parseFloat(amountReceived),
      paymentDate,
      referenceNumber,
      notes,
      allocations: formattedAllocations,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setIsOpen(false);
      window.location.reload();
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={styles.collectBtn}>
        + Collect Payment
      </button>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                Record Payment & Allocate Invoices
              </h2>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Amount Received (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={styles.label}>Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Reference / Cheque No.</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. TRF-981234"
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Notes / Description</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. Direct bank transfer settlement"
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ ...styles.label, marginBottom: 0 }}>
                    Open Invoices Allocation
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoAllocate}
                    style={styles.autoBtn}
                  >
                    Auto-Allocate Funds
                  </button>
                </div>

                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.thRow}>
                        <th style={styles.th}>Invoice #</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.thRight}>Balance Due</th>
                        <th style={styles.thRight}>Allocate (RM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openInvoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              padding: "16px",
                              textAlign: "center",
                              color: "#64748b",
                            }}
                          >
                            No open invoices available for allocation.
                          </td>
                        </tr>
                      ) : (
                        openInvoices.map((inv) => {
                          const balanceDue =
                            Number(inv.total) - Number(inv.amountPaid);
                          return (
                            <tr key={inv.id} style={styles.tr}>
                              <td style={styles.td}>{inv.invoiceNumber}</td>
                              <td style={styles.td}>
                                {new Date(inv.date).toLocaleDateString()}
                              </td>
                              <td style={styles.tdRight}>
                                RM {balanceDue.toFixed(2)}
                              </td>
                              <td style={styles.tdRight}>
                                <input
                                  type="number"
                                  step="0.01"
                                  max={balanceDue}
                                  value={allocations[inv.id] || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(
                                      inv.id,
                                      e.target.value,
                                    )
                                  }
                                  style={styles.allocInput}
                                  placeholder="0.00"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={styles.footerActions}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.submitBtn}
                >
                  {loading ? "Processing..." : "Save & Allocate Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  collectBtn: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    width: "100%",
    maxWidth: "650px",
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    border: "1px solid #334155",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid #334155",
    paddingBottom: "12px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "18px",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#7f1d1d",
    color: "#fca5a5",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
  },
  input: {
    width: "100%",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
  },
  autoBtn: {
    backgroundColor: "transparent",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    cursor: "pointer",
  },
  tableContainer: {
    border: "1px solid #334155",
    borderRadius: "6px",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
  },
  thRow: {
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #334155",
    textAlign: "left" as const,
  },
  th: { padding: "8px 12px", color: "#94a3b8", fontWeight: 600 },
  thRight: {
    padding: "8px 12px",
    color: "#94a3b8",
    fontWeight: 600,
    textAlign: "right" as const,
  },
  tr: { borderBottom: "1px solid #334155" },
  td: { padding: "8px 12px", color: "#f8fafc" },
  tdRight: {
    padding: "8px 12px",
    color: "#f8fafc",
    textAlign: "right" as const,
  },
  allocInput: {
    width: "90px",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "4px 8px",
    borderRadius: "4px",
    textAlign: "right" as const,
    fontSize: "13px",
  },
  footerActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
    borderTop: "1px solid #334155",
    paddingTop: "16px",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
