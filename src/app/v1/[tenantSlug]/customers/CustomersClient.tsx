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

  // ---------------------------------------------------------
  // DELETE STATE
  // ---------------------------------------------------------

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const filtered = tenant.customers.filter((c: any) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    const nameMatch = c.name?.toLowerCase().includes(query) ?? false;

    const emailMatch = c.email?.toLowerCase().includes(query) ?? false;

    const companyMatch = c.company?.toLowerCase().includes(query) ?? false;

    return nameMatch || emailMatch || companyMatch;
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const openDeleteModal = (customer: { id: string; name: string }) => {
    setCustomerToDelete(customer);
    setConfirmNameInput("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setDeleteModalOpen(false);
    setCustomerToDelete(null);
    setConfirmNameInput("");
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    if (confirmNameInput !== customerToDelete.name) {
      return;
    }

    if (!authCheck) {
      alert("You don't have permission to perform this action.");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCustomer(tenant.id, customerToDelete.id);

      if (result.success) {
        closeDeleteModal();
      } else {
        alert(result.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting the customer.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------
  // METRICS
  // ---------------------------------------------------------

  const totalCustomers = tenant.customers.length;

  const companiesCount = tenant.customers.filter(
    (customer: any) => customer.company,
  ).length;

  const customersWithEmail = tenant.customers.filter(
    (customer: any) => customer.email,
  ).length;

  return (
    <div style={styles.container}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="customers-navbar" style={styles.navbar}>
        <div className="customers-nav-content" style={styles.navContent}>
          <div style={styles.navLeft}>
            <Link href={`/v1/${tenant.slug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span>
              <span>Return to ERP Hub</span>
            </Link>

            <div
              className="customers-title-wrapper"
              style={styles.titleWrapper}
            >
              <div>
                <h1 className="customers-title" style={styles.title}>
                  {tenant.name} Customer Directory
                </h1>

                <p style={styles.titleDescription}>
                  Manage customer profiles and keep your client records
                  organized.
                </p>
              </div>

              <span style={styles.badgeSub}>Client CRM & Directory</span>
            </div>
          </div>

          <div className="customers-nav-right" style={styles.navRight}>
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                ...styles.primaryActionBtn,
                backgroundColor: isAdding ? "#111827" : "#38bdf8",
                color: isAdding ? "#94a3b8" : "#030712",
                border: isAdding ? "1px solid #334155" : "none",
              }}
            >
              {isAdding ? "✕ Close Form" : "＋ Register New Customer"}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="customers-main" style={styles.mainContent}>
        {/* ===================================================
            OVERVIEW
        =================================================== */}

        <section className="customers-metrics" style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>TOTAL CLIENTS</div>

            <div style={styles.metricValue}>{totalCustomers}</div>

            <div style={styles.metricDescription}>
              Registered customer profiles
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>COMPANIES</div>

            <div style={styles.metricValue}>{companiesCount}</div>

            <div style={styles.metricDescription}>
              Customers linked to a business
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>CONTACTABLE</div>

            <div style={styles.metricValue}>{customersWithEmail}</div>

            <div style={styles.metricDescription}>
              Profiles with email information
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>DIRECTORY STATUS</div>

            <div
              style={{
                ...styles.metricValue,
                color: "#34d399",
              }}
            >
              LIVE
            </div>

            <div style={styles.metricDescription}>
              Customer database is active
            </div>
          </div>
        </section>

        {/* ===================================================
            ADD CUSTOMER
        =================================================== */}

        {isAdding && (
          <section className="customers-add-card" style={styles.addCard}>
            <div className="customers-card-header" style={styles.cardHeader}>
              <div className="customers-icon" style={styles.iconBox}>
                <span>CRM</span>
              </div>

              <div style={styles.cardHeaderContent}>
                <div style={styles.eyebrow}>CUSTOMER MANAGEMENT</div>

                <h2 style={styles.cardTitle}>Add New Client</h2>

                <p style={styles.cardSubtitle}>
                  Register a customer profile for streamlined invoicing and
                  order tracking.
                </p>
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);

                try {
                  const result = await createCustomer(tenant.id, formData);

                  if (result.success) {
                    setIsAdding(false);
                  } else {
                    alert(result.error || "Failed to create customer.");
                  }
                } catch (error) {
                  console.error(error);
                  alert("Something went wrong while creating the customer.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={styles.form}
            >
              <div className="customers-form-grid" style={styles.formInputGrid}>
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
                  style={{
                    ...styles.submitBtn,
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving Client..." : "Save Customer Profile"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ===================================================
            CUSTOMER DIRECTORY
        =================================================== */}

        <section className="customers-card" style={styles.card}>
          <div
            className="customers-search-container"
            style={styles.searchContainer}
          >
            <div style={styles.searchSection}>
              <div
                className="customers-search-wrapper"
                //@ts-ignore
                style={styles.searchWrapper}
              >
                <span
                  className="customers-search-icon"
                  //@ts-ignore
                  style={styles.searchIcon}
                >
                  ⌕
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
                Showing{" "}
                <strong style={styles.resultsHighlight}>
                  {filtered.length}
                </strong>{" "}
                of {tenant.customers.length} clients
              </div>
            </div>
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="customers-table-wrapper" style={styles.tableWrapper}>
            <table className="customers-table" style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.cellHead}>Name</th>

                  <th style={styles.cellHead}>Company</th>

                  <th style={styles.cellHead}>Email Address</th>

                  {authCheck && (
                    <th
                      style={{
                        ...styles.cellHead,
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={authCheck ? 4 : 3} style={styles.emptyPrompt}>
                      <div style={styles.emptyIcon}>—</div>

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
                      {/* NAME */}

                      <td
                        data-label="Name"
                        style={{
                          ...styles.cellBody,
                          fontWeight: 700,
                          color: "#f8fafc",
                        }}
                      >
                        <div style={styles.customerNameCell}>
                          <div style={styles.avatarMini}>
                            {c.name?.charAt(0).toUpperCase()}
                          </div>

                          <div style={styles.customerName}>{c.name}</div>
                        </div>
                      </td>

                      {/* COMPANY */}

                      <td
                        data-label="Company"
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

                      {/* EMAIL */}

                      <td
                        data-label="Email"
                        style={{
                          ...styles.cellBody,
                          color: "#38bdf8",
                        }}
                      >
                        <span style={styles.emailValue}>{c.email || "—"}</span>
                      </td>

                      {/* ACTIONS */}

                      {authCheck && (
                        <td
                          data-label="Actions"
                          style={{
                            ...styles.cellBody,
                            textAlign: "right",
                          }}
                        >
                          <button
                            onClick={() =>
                              openDeleteModal({
                                id: c.id,
                                name: c.name,
                              })
                            }
                            style={styles.deleteTableBtn}
                            title="Delete customer record"
                          >
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModalOpen && customerToDelete && (
        <div style={styles.modalOverlay}>
          <div className="customers-modal" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>!</div>

              <div style={styles.modalHeaderContent}>
                <div style={styles.modalEyebrow}>DANGEROUS ACTION</div>

                <h3 style={styles.modalTitle}>Delete Customer Profile</h3>

                <p style={styles.modalSubtitle}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div style={styles.warningBox}>
              <p style={styles.modalBodyText}>
                You are about to delete{" "}
                <strong style={styles.customerNameHighlight}>
                  {customerToDelete.name}
                </strong>{" "}
                from your organization database.
              </p>

              <p style={styles.modalInstruction}>
                Type the customer's full name below to confirm deletion.
              </p>
            </div>

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

              <span style={styles.confirmationHint}>
                Confirmation must match the name exactly.
              </span>
            </div>

            <div
              className="customers-modal-actions"
              style={styles.modalActions}
            >
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
                  opacity:
                    confirmNameInput !== customerToDelete.name ? 0.45 : 1,
                  cursor:
                    confirmNameInput !== customerToDelete.name || isDeleting
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

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        input,
        button {
          font: inherit;
        }

        input::placeholder {
          color: #475569;
        }

        input:focus {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08) !important;
        }

        button {
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease,
            filter 0.2s ease;
        }

        button:not(:disabled):hover {
          filter: brightness(1.07);
          transform: translateY(-1px);
        }

        a {
          transition: color 0.2s ease;
        }

        a:hover {
          color: #cbd5e1 !important;
        }

        .customers-table-wrapper {
          scrollbar-width: thin;
          scrollbar-color: #26364d transparent;
        }

        .customers-table tbody tr:hover {
          background: rgba(15, 23, 42, 0.5);
        }

        /* ===================================================
           LARGE TABLET
        =================================================== */

        @media (max-width: 1050px) {
          .customers-nav-content {
            padding: 20px 30px !important;
          }

          .customers-main {
            padding: 34px 30px 70px !important;
          }

          .customers-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .customers-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .customers-form-grid > div:last-child {
            grid-column: 1 / -1;
          }
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 760px) {
          .customers-navbar {
            position: relative !important;
          }

          .customers-nav-content {
            display: block !important;
            padding: 18px 20px !important;
          }

          .customers-nav-right {
            margin-top: 18px;
          }

          .customers-nav-right button {
            width: 100% !important;
            min-height: 45px !important;
          }

          .customers-title-wrapper {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }

          .customers-title {
            font-size: 21px !important;
            line-height: 1.25 !important;
          }

          .customers-main {
            padding: 26px 20px 55px !important;
            gap: 20px !important;
          }

          .customers-metrics {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }

          .customers-metrics > div {
            min-height: 120px !important;
            padding: 20px !important;
          }

          .customers-add-card,
          .customers-card {
            padding: 22px !important;
            border-radius: 14px !important;
          }

          .customers-card-header {
            gap: 12px !important;
          }

          .customers-icon {
            width: 40px !important;
            height: 40px !important;
          }

          .customers-form-grid {
            grid-template-columns: 1fr !important;
            gap: 17px !important;
          }

          .customers-form-grid > div:last-child {
            grid-column: auto !important;
          }

          .customers-search-container {
            margin-bottom: 20px !important;
          }

          .customers-search-wrapper {
            min-width: 0 !important;
            width: 100% !important;
          }

          .customers-search-container {
            display: block !important;
          }

          .customers-results {
            margin-top: 12px !important;
          }

          .customers-table-wrapper {
            overflow-x: visible !important;
          }

          /* -------------------------------------------------
             TABLE -> MOBILE CARDS
          ------------------------------------------------- */

          .customers-table {
            display: block !important;
            width: 100% !important;
          }

          .customers-table thead {
            display: none !important;
          }

          .customers-table tbody {
            display: block !important;
            width: 100% !important;
          }

          .customers-table tbody tr {
            display: block !important;
            width: 100% !important;
            margin: 0 0 12px !important;
            border: 1px solid #172033 !important;
            border-radius: 13px !important;
            background: #0a101c !important;
            overflow: hidden !important;
          }

          .customers-table tbody tr:last-child {
            margin-bottom: 0 !important;
          }

          .customers-table tbody tr:hover {
            background: #0a101c !important;
          }

          .customers-table tbody td {
            display: grid !important;
            grid-template-columns: 80px minmax(0, 1fr) !important;
            gap: 12px !important;
            width: 100% !important;
            min-width: 0 !important;
            padding: 15px !important;
            border-bottom: 1px solid #172033 !important;
            text-align: left !important;
            vertical-align: middle !important;
          }

          .customers-table tbody td:last-child {
            border-bottom: none !important;
          }

          .customers-table tbody td::before {
            content: attr(data-label);
            color: #475569;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.7px;
            text-transform: uppercase;
            padding-top: 3px;
          }

          .customerNameCell {
            min-width: 0 !important;
          }

          .customerName {
            overflow-wrap: anywhere !important;
          }

          .companyTag {
            max-width: 100% !important;
            overflow-wrap: anywhere !important;
          }

          .emailValue {
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .deleteTableBtn {
            width: 100% !important;
            min-height: 40px !important;
          }

          .emptyPrompt {
            display: block !important;
            width: 100% !important;
            padding: 50px 20px !important;
          }

          .emptyPrompt::before {
            display: none !important;
          }
        }

        /* ===================================================
           SMALL PHONES
        =================================================== */

        @media (max-width: 480px) {
          .customers-nav-content {
            padding: 16px 14px !important;
          }

          .customers-main {
            padding: 22px 14px 45px !important;
          }

          .customers-title {
            font-size: 20px !important;
          }

          .customers-metrics {
            grid-template-columns: 1fr !important;
          }

          .customers-metrics > div {
            min-height: 108px !important;
            padding: 18px !important;
          }

          .customers-add-card,
          .customers-card {
            padding: 18px !important;
          }

          .customers-card-header {
            padding-bottom: 18px !important;
            margin-bottom: 20px !important;
          }

          .customers-table tbody td {
            grid-template-columns: 72px minmax(0, 1fr) !important;
            gap: 9px !important;
            padding: 14px 12px !important;
          }

          .avatarMini {
            width: 30px !important;
            height: 30px !important;
          }

          .customers-modal {
            padding: 22px !important;
            border-radius: 14px !important;
          }

          .customers-modal-actions {
            flex-direction: column-reverse !important;
          }

          .customers-modal-actions button {
            width: 100% !important;
            min-height: 44px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // =========================================================
  // BASE
  // =========================================================

  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  // =========================================================
  // NAVBAR
  // =========================================================

  navbar: {
    backgroundColor: "rgba(3, 7, 18, 0.9)",
    borderBottom: "1px solid #172033",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(18px)",
  },

  navContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "22px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
  },

  navLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    minWidth: 0,
  },

  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    width: "fit-content",
  },

  backArrow: {
    fontSize: "15px",
    lineHeight: 1,
  },

  titleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap" as const,
  },

  title: {
    fontSize: "25px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.7px",
    lineHeight: 1.15,
  },

  titleDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  badgeSub: {
    fontSize: "10px",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    padding: "7px 10px",
    borderRadius: "7px",
    fontWeight: 650,
    border: "1px solid #1e293b",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap" as const,
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  primaryActionBtn: {
    minHeight: "44px",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 750,
    fontSize: "12px",
    letterSpacing: "-0.1px",
    boxShadow: "0 6px 18px -10px rgba(56, 189, 248, 0.7)",
    transition: "all 0.2s ease",
  },

  // =========================================================
  // MAIN
  // =========================================================

  mainContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "42px 48px 90px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },

  // =========================================================
  // METRICS
  // =========================================================

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },

  metricCard: {
    minHeight: "130px",
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "14px",
    padding: "23px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    boxShadow: "0 14px 35px -20px rgba(0,0,0,0.8)",
  },

  metricLabel: {
    fontSize: "9px",
    color: "#64748b",
    fontWeight: 800,
    letterSpacing: "1.1px",
    marginBottom: "10px",
  },

  metricValue: {
    fontSize: "27px",
    lineHeight: 1,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.8px",
  },

  metricDescription: {
    marginTop: "10px",
    color: "#475569",
    fontSize: "11px",
    lineHeight: 1.4,
  },

  // =========================================================
  // CARDS
  // =========================================================

  addCard: {
    backgroundColor: "#080d18",
    border: "1px solid rgba(56, 189, 248, 0.24)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 18px 45px -28px rgba(56, 189, 248, 0.22)",
  },

  card: {
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 18px 45px -28px rgba(0,0,0,0.9)",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "26px",
    borderBottom: "1px solid #172033",
    paddingBottom: "23px",
  },

  iconBox: {
    width: "46px",
    height: "46px",
    backgroundColor: "#0d1422",
    border: "1px solid #22304a",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#38bdf8",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.8px",
  },

  cardHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1.1px",
    color: "#38bdf8",
    marginBottom: "7px",
    textTransform: "uppercase" as const,
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.35px",
    lineHeight: 1.3,
  },

  cardSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "7px 0 0",
    lineHeight: 1.55,
  },

  // =========================================================
  // FORMS
  // =========================================================

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },

  formInputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },

  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  label: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: 650,
  },

  input: {
    minHeight: "47px",
    backgroundColor: "#0c1320",
    color: "#f8fafc",
    border: "1px solid #1d2a3e",
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    width: "100%",
    fontSize: "13px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.015)",
  },

  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },

  submitBtn: {
    minHeight: "47px",
    padding: "13px 20px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 750,
    fontSize: "13px",
    boxShadow: "0 8px 22px -12px rgba(16, 185, 129, 0.7)",
  },

  // =========================================================
  // SEARCH
  // =========================================================

  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap" as const,
    gap: "16px",
  },

  searchSection: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
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
    transform: "translateY(-52%)",
    fontSize: "18px",
    color: "#64748b",
    pointerEvents: "none",
    lineHeight: 1,
  },

  searchInput: {
    width: "100%",
    minHeight: "47px",
    backgroundColor: "#0c1320",
    color: "#f8fafc",
    border: "1px solid #1d2a3e",
    padding: "12px 14px 12px 40px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.015)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  resultsCount: {
    fontSize: "12px",
    color: "#64748b",
    whiteSpace: "nowrap" as const,
  },

  resultsHighlight: {
    color: "#f8fafc",
  },

  // =========================================================
  // TABLE
  // =========================================================

  tableWrapper: {
    width: "100%",
    overflowX: "auto" as const,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
  },

  thRow: {
    backgroundColor: "#0b1220",
    borderBottom: "1px solid #172033",
  },

  cellHead: {
    padding: "15px 20px",
    fontSize: "9px",
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "0.9px",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
  },

  trRow: {
    borderBottom: "1px solid #172033",
    transition: "background-color 0.2s ease",
  },

  cellBody: {
    padding: "21px 20px",
    verticalAlign: "middle",
    fontSize: "13px",
  },

  // =========================================================
  // CUSTOMER
  // =========================================================

  customerNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: "160px",
  },

  customerName: {
    overflowWrap: "anywhere" as const,
    lineHeight: 1.4,
  },

  avatarMini: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    backgroundColor: "#0d1422",
    color: "#38bdf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 750,
    fontSize: "12px",
    border: "1px solid #22304a",
    flexShrink: 0,
  },

  companyTag: {
    backgroundColor: "#0d1422",
    color: "#94a3b8",
    padding: "7px 10px",
    borderRadius: "7px",
    border: "1px solid #1d2a3e",
    fontSize: "11px",
    fontWeight: 550,
    display: "inline-block",
    maxWidth: "230px",
    overflowWrap: "anywhere" as const,
  },

  emailValue: {
    overflowWrap: "anywhere" as const,
    wordBreak: "break-word" as const,
  },

  deleteTableBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.07)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.18)",
    minHeight: "36px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 750,
  },

  // =========================================================
  // EMPTY STATE
  // =========================================================

  emptyPrompt: {
    textAlign: "center" as const,
    padding: "70px 24px",
    backgroundColor: "#080d18",
  },

  emptyIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #1d2a3e",
    backgroundColor: "#0d1422",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    color: "#38bdf8",
    fontSize: "18px",
  },

  emptyTitle: {
    fontSize: "15px",
    fontWeight: 750,
    color: "#f1f5f9",
    marginBottom: "7px",
  },

  emptyDesc: {
    fontSize: "12px",
    color: "#64748b",
    maxWidth: "360px",
    margin: "0 auto",
    lineHeight: 1.6,
  },

  // =========================================================
  // DELETE MODAL
  // =========================================================

  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(3, 7, 18, 0.82)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
  },

  modalCard: {
    backgroundColor: "#080d18",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    borderRadius: "16px",
    padding: "30px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 25px 70px -25px rgba(0,0,0,0.9)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "22px",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    borderBottom: "1px solid #172033",
    paddingBottom: "20px",
  },

  modalHeaderContent: {
    minWidth: 0,
    flex: 1,
  },

  modalEyebrow: {
    color: "#f87171",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: "7px",
  },

  modalIconBox: {
    width: "44px",
    height: "44px",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: 800,
    flexShrink: 0,
  },

  modalTitle: {
    fontSize: "18px",
    fontWeight: 750,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.35px",
    lineHeight: 1.3,
  },

  modalSubtitle: {
    fontSize: "12px",
    color: "#f87171",
    margin: "5px 0 0",
    lineHeight: 1.45,
  },

  warningBox: {
    backgroundColor: "rgba(239, 68, 68, 0.045)",
    border: "1px solid rgba(239, 68, 68, 0.12)",
    borderRadius: "10px",
    padding: "15px",
  },

  modalBodyText: {
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.55,
    margin: 0,
  },

  customerNameHighlight: {
    color: "#f8fafc",
  },

  modalInstruction: {
    fontSize: "11px",
    color: "#64748b",
    lineHeight: 1.5,
    margin: "7px 0 0",
  },

  confirmationHint: {
    fontSize: "10px",
    color: "#475569",
    lineHeight: 1.4,
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "2px",
  },

  modalCancelBtn: {
    minHeight: "43px",
    backgroundColor: "#111827",
    color: "#94a3b8",
    border: "1px solid #26364d",
    padding: "10px 18px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: 650,
    cursor: "pointer",
  },

  modalConfirmBtn: {
    minHeight: "43px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: 750,
    boxShadow: "0 7px 20px -10px rgba(239, 68, 68, 0.8)",
  },
};
