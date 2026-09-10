"use client";

import { useState } from "react";
import Link from "next/link";
import { createCustomer, deleteCustomer } from "@/app/actions/customers";

export function CustomersClient({
  tenant,
  authCheck,
}: {
  tenant: any;
  authCheck?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Two-step delete state management
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = tenant.customers.filter((c: any) => {
    const query = search.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(query) ?? false;
    const emailMatch = c.email?.toLowerCase().includes(query) ?? false;
    const companyMatch = c.company?.toLowerCase().includes(query) ?? false;
    return nameMatch || emailMatch || companyMatch;
  });

  const openDeleteModal = (customer: { id: string; name: string }) => {
    setCustomerToDelete(customer);
    setConfirmNameInput("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCustomerToDelete(null);
    setConfirmNameInput("");
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    if (confirmNameInput !== customerToDelete.name) return;
    if (!authCheck) {
      alert("you dont have this action");
      return;
    }

    setIsDeleting(true);
    const result = await deleteCustomer(tenant.id, customerToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      closeDeleteModal();
    } else {
      alert(result.error || "Failed to delete customer");
    }
  };

  return (
    <div style={styles.container}>
      <header
        //@ts-ignore
        style={styles.navbar}
      >
        <div style={styles.navContent}>
          <div style={styles.navLeft}>
            <Link href={`/v1/${tenant.slug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span> Return to ERP Hub
            </Link>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title}>{tenant.name} Customer Directory</h1>
              <span style={styles.badgeSub}>Client CRM & Directory</span>
            </div>
          </div>
          <div style={styles.navRight}>
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                ...styles.primaryActionBtn,
                backgroundColor: isAdding ? "#1e293b" : "#38bdf8",
                color: isAdding ? "#94a3b8" : "#030712",
                border: isAdding ? "1px solid #334155" : "none",
              }}
            >
              {isAdding ? "✕ Close Form" : "＋ Register New Customer"}
            </button>
          </div>
        </div>
      </header>
      <main style={styles.mainContent}>
        {isAdding && (
          <div style={styles.addCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>👤</div>
              <div>
                <h3 style={styles.cardTitle}>Add New Client</h3>
                <p style={styles.cardSubtitle}>
                  Register a customer profile for streamlined invoicing and
                  order tracking
                </p>
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                const result = await createCustomer(tenant.id, formData);
                setIsSubmitting(false);

                if (result.success) {
                  setIsAdding(false);
                } else {
                  alert(result.error);
                }
              }}
              style={styles.form}
            >
              <div style={styles.formInputGrid}>
                <div style={styles.group}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    name="name"
                    placeholder="e.g. Sarah Jenkins"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="sarah@company.com"
                    style={styles.input}
                  />
                </div>
                <div style={styles.group}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    name="company"
                    placeholder="e.g. Apex Industries"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formFooter}>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving Client..." : "Save Customer Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.searchContainer}>
            <div
              //@ts-ignore
              style={styles.searchWrapper}
            >
              <span
                //@ts-ignore
                style={styles.searchIcon}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                style={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={styles.resultsCount}>
              Showing <strong>{filtered.length}</strong> of{" "}
              {tenant.customers.length} clients
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.cellHead}>Name</th>
                  <th style={styles.cellHead}>Company</th>
                  <th style={styles.cellHead}>Email Address</th>
                  <th style={{ ...styles.cellHead, textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.emptyPrompt}>
                      <div style={styles.emptyIcon}>📂</div>
                      <div style={styles.emptyTitle}>No Customers Found</div>
                      <div style={styles.emptyDesc}>
                        {search
                          ? "Try adjusting your search query to find matching profiles."
                          : "Get started by registering your first customer above."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c: any) => (
                    <tr key={c.id} style={styles.trRow}>
                      <td
                        style={{
                          ...styles.cellBody,
                          fontWeight: 700,
                          color: "#f8fafc",
                        }}
                      >
                        <div style={styles.customerNameCell}>
                          <div style={styles.avatarMini}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td
                        style={{
                          ...styles.cellBody,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        {c.company ? (
                          <span style={styles.companyTag}>{c.company}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ ...styles.cellBody, color: "#38bdf8" }}>
                        {c.email || "—"}
                      </td>
                      {authCheck && (
                        <td style={{ ...styles.cellBody, textAlign: "right" }}>
                          <button
                            onClick={() =>
                              openDeleteModal({ id: c.id, name: c.name })
                            }
                            style={styles.deleteTableBtn}
                            title="Delete customer record"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {/* Two-Step Deletion Modal Overlay */}
      {deleteModalOpen && customerToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>⚠️</div>
              <div>
                <h3 style={styles.modalTitle}>Delete Customer Profile</h3>
                <p style={styles.modalSubtitle}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p style={styles.modalBodyText}>
              You are about to delete <strong>{customerToDelete.name}</strong>{" "}
              from your organization database. Please type the full name of the
              customer below to confirm deletion.
            </p>

            <div style={styles.group}>
              <label style={styles.label}>Confirmation Prompt</label>
              <input
                type="text"
                placeholder={`Type "${customerToDelete.name}" to confirm`}
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                style={styles.input}
                autoFocus
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={closeDeleteModal}
                style={styles.modalCancelBtn}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={
                  confirmNameInput !== customerToDelete.name || isDeleting
                }
                style={{
                  ...styles.modalConfirmBtn,
                  opacity: confirmNameInput !== customerToDelete.name ? 0.5 : 1,
                  cursor:
                    confirmNameInput !== customerToDelete.name
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  navbar: {
    backgroundColor: "#0b0f19",
    borderBottom: "1px solid #1e293b",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(8px)",
  },
  navContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.2s ease",
  },
  backArrow: {
    fontSize: "14px",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  badgeSub: {
    fontSize: "12px",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "2px 8px",
    borderRadius: "6px",
    fontWeight: 500,
    border: "1px solid #334155",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
  },
  mainContent: {
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "32px",
  },
  addCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid #38bdf844",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 30px -10px rgba(56, 189, 248, 0.15)",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "28px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "20px",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  formInputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "280px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#111827",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "12px 14px 12px 40px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  resultsCount: {
    fontSize: "13px",
    color: "#64748b",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  primaryActionBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "-0.2px",
    boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
    transition: "background-color 0.2s ease",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
  },
  thRow: {
    backgroundColor: "#111827",
    borderBottom: "1px solid #1e293b",
  },
  cellHead: {
    padding: "16px 24px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  trRow: {
    borderBottom: "1px solid #1e293b",
    transition: "background-color 0.2s ease",
  },
  cellBody: {
    padding: "18px 24px",
    verticalAlign: "middle",
    fontSize: "14px",
  },
  customerNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarMini: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
    border: "1px solid #334155",
  },
  companyTag: {
    backgroundColor: "#111827",
    color: "#94a3b8",
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    fontSize: "12px",
    fontWeight: 500,
    display: "inline-block",
  },
  deleteTableBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s ease",
  },
  emptyPrompt: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "#0b0f19",
  },
  emptyIcon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  emptyDesc: {
    fontSize: "13px",
    color: "#64748b",
    maxWidth: "320px",
    margin: "0 auto",
    lineHeight: "1.4",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(3, 7, 18, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
  },
  modalCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "16px",
  },
  modalIconBox: {
    width: "44px",
    height: "44px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  modalSubtitle: {
    fontSize: "13px",
    color: "#ef4444",
    margin: "4px 0 0 0",
  },
  modalBodyText: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.5",
    margin: 0,
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  modalCancelBtn: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalConfirmBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    transition: "opacity 0.2s ease",
  },
};
