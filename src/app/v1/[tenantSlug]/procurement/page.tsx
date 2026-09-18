import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import {
  createSupplierAction,
  adjustStockManuallyAction,
  receivePurchaseOrderAction,
} from "@/app/actions/procurement";
import POForm from "./POForm";

interface ProcurementProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function ProcurementPage({ params }: ProcurementProps) {
  const { tenantSlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const accessCheck = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      tenant: { slug: tenantSlug },
    },
    include: {
      tenant: {
        include: {
          products: {
            orderBy: { name: "asc" },
          },
          suppliers: {
            orderBy: { name: "asc" },
          },
          purchaseOrders: {
            orderBy: { createdAt: "desc" },
            include: {
              supplier: true,
              poItems: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!accessCheck) redirect("/dashboard-redirect");

  const tenant = accessCheck.tenant;

  // =========================================================
  // SERVER ACTIONS
  // =========================================================

  const handleAddSupplier = async (formData: FormData) => {
    "use server";

    const name = formData.get("name") as string;
    const contact = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    await createSupplierAction(tenant.id, tenantSlug, {
      name,
      contactName: contact,
      email,
      phone,
    });
  };

  const handleManualAdjustment = async (formData: FormData) => {
    "use server";

    const productId = formData.get("productId") as string;
    const qty = parseInt(formData.get("quantity") as string) || 0;
    const reason =
      (formData.get("reason") as string) || "Manual stock adjustment";

    await adjustStockManuallyAction(
      tenant.id,
      tenantSlug,
      productId,
      qty,
      reason,
    );
  };

  // =========================================================
  // METRICS
  // =========================================================

  const totalProducts = tenant.products.length;

  const totalStockUnits = tenant.products.reduce(
    (total, product) => total + product.stockQty,
    0,
  );

  const totalSuppliers = tenant.suppliers.length;

  const pendingOrders = tenant.purchaseOrders.filter(
    (po) => po.status !== "RECEIVED",
  ).length;

  const receivedOrders = tenant.purchaseOrders.filter(
    (po) => po.status === "RECEIVED",
  ).length;

  const totalProcurementValue = tenant.purchaseOrders.reduce(
    (total, po) => total + Number(po.totalCost || 0),
    0,
  );

  return (
    <div style={styles.container}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="procurement-navbar"
        //@ts-ignore
        style={styles.navbar}
      >
        <div className="procurement-nav-content" style={styles.navContent}>
          <div style={styles.navLeft}>
            <Link href={`/v1/${tenantSlug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span>
              <span>Return to ERP Hub</span>
            </Link>

            <div
              className="procurement-title-wrapper"
              style={styles.titleWrapper}
            >
              <div>
                <h1 className="procurement-title" style={styles.title}>
                  {tenant.name} Procurement Hub
                </h1>

                <p style={styles.titleDescription}>
                  Manage suppliers, purchase orders, and inbound inventory.
                </p>
              </div>

              <span style={styles.badgeSub}>Supply Chain & Inventory Ops</span>
            </div>
          </div>

          <div className="procurement-nav-right" style={styles.navRight}>
            <div style={styles.liveIndicator}>
              <span style={styles.pulseDot} />
              <span>Live Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="procurement-main" style={styles.mainLayout}>
        {/* ===================================================
            METRICS
        =================================================== */}

        <section className="procurement-metrics" style={styles.metricsSection}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>PRODUCTS</div>

            <div style={styles.metricValue}>{totalProducts}</div>

            <div style={styles.metricDescription}>
              Items available in inventory
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>STOCK UNITS</div>

            <div style={styles.metricValue}>
              {totalStockUnits.toLocaleString()}
            </div>

            <div style={styles.metricDescription}>
              Current units across products
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>SUPPLIERS</div>

            <div style={styles.metricValue}>{totalSuppliers}</div>

            <div style={styles.metricDescription}>
              Registered procurement vendors
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>PENDING POs</div>

            <div
              style={{
                ...styles.metricValue,
                color: pendingOrders > 0 ? "#fbbf24" : "#34d399",
              }}
            >
              {pendingOrders}
            </div>

            <div style={styles.metricDescription}>Orders awaiting receipt</div>
          </div>
        </section>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="procurement-summary" style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryDotBlue} />

            <div>
              <span style={styles.summaryLabel}>Procurement Value</span>

              <strong style={styles.summaryValue}>
                RM {totalProcurementValue.toFixed(2)}
              </strong>
            </div>
          </div>

          <div
            className="procurement-summary-divider"
            style={styles.summaryDivider}
          />

          <div style={styles.summaryItem}>
            <span style={styles.summaryDotGreen} />

            <div>
              <span style={styles.summaryLabel}>Received Orders</span>

              <strong style={styles.summaryValue}>{receivedOrders}</strong>
            </div>
          </div>

          <div
            className="procurement-summary-divider"
            style={styles.summaryDivider}
          />

          <div style={styles.summaryItem}>
            <span style={styles.summaryDotAmber} />

            <div>
              <span style={styles.summaryLabel}>Pending Orders</span>

              <strong style={styles.summaryValue}>{pendingOrders}</strong>
            </div>
          </div>
        </section>

        {/* ===================================================
            OPERATIONS
        =================================================== */}

        <div className="procurement-operations" style={styles.operationsGrid}>
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div style={styles.leftCol}>
            {/* =================================================
                MANUAL STOCK
            ================================================= */}

            <section className="procurement-card" style={styles.card}>
              <div
                className="procurement-card-header"
                style={styles.cardHeader}
              >
                <div className="procurement-icon" style={styles.iconBox}>
                  <span>BOX</span>
                </div>

                <div style={styles.cardHeaderContent}>
                  <div style={styles.eyebrow}>INVENTORY CONTROL</div>

                  <h2 style={styles.cardTitle}>Instant Manual Stock Entry</h2>

                  <p style={styles.cardSubtitle}>
                    Adjust inventory directly without creating a purchase order.
                  </p>
                </div>
              </div>

              <form action={handleManualAdjustment} style={styles.formVertical}>
                <div style={styles.group}>
                  <label style={styles.label}>Product</label>

                  <select name="productId" required style={styles.input}>
                    <option value="">Select Product...</option>

                    {tenant.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Current stock: {p.stockQty}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Quantity Change</label>

                  <input
                    name="quantity"
                    type="number"
                    placeholder="e.g. 50 or -10"
                    required
                    style={styles.input}
                  />

                  <span style={styles.fieldHint}>
                    Positive numbers add stock. Negative numbers deduct stock.
                  </span>
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Reason Note</label>

                  <input
                    name="reason"
                    placeholder="e.g. Opening Balance, Damage Correction"
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    backgroundColor: "#38bdf8",
                    color: "#031018",
                  }}
                >
                  Apply Manual Adjustment
                </button>
              </form>
            </section>

            {/* =================================================
                SUPPLIER
            ================================================= */}

            <section className="procurement-card" style={styles.card}>
              <div
                className="procurement-card-header"
                style={styles.cardHeader}
              >
                <div className="procurement-icon" style={styles.iconBox}>
                  <span>SUP</span>
                </div>

                <div style={styles.cardHeaderContent}>
                  <div style={styles.eyebrow}>VENDOR MANAGEMENT</div>

                  <h2 style={styles.cardTitle}>Onboard Supplier</h2>

                  <p style={styles.cardSubtitle}>
                    Register a new vendor for procurement orders.
                  </p>
                </div>
              </div>

              <form action={handleAddSupplier} style={styles.formVertical}>
                <div style={styles.group}>
                  <label style={styles.label}>Company Name</label>

                  <input
                    name="name"
                    placeholder="Supplier Company Name"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Contact Person</label>

                  <input
                    name="contactName"
                    placeholder="Contact Person Name"
                    style={styles.input}
                  />
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Email Address</label>

                  <input
                    name="email"
                    type="email"
                    placeholder="sales@supplier.com"
                    style={styles.input}
                  />
                </div>

                <div style={styles.group}>
                  <label style={styles.label}>Phone Number</label>

                  <input
                    name="phone"
                    placeholder="e.g. +6012-3456789"
                    style={styles.input}
                  />
                </div>

                <button type="submit" style={styles.submitBtn}>
                  Add Supplier
                </button>
              </form>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div style={styles.rightCol}>
            {/* =================================================
                PO FORM
            ================================================= */}

            <section className="procurement-card" style={styles.card}>
              <div style={styles.poHeader}>
                <div>
                  <div style={styles.eyebrow}>PROCUREMENT WORKFLOW</div>

                  <h2 style={styles.cardTitle}>Create Purchase Order</h2>

                  <p style={styles.cardSubtitle}>
                    Build multi-item purchase orders and send inventory into
                    your receiving pipeline.
                  </p>
                </div>

                <div style={styles.poStatus}>
                  <span style={styles.smallPulse} />
                  READY
                </div>
              </div>

              <div style={styles.poFormWrapper}>
                <POForm
                  tenantId={tenant.id}
                  slug={tenantSlug}
                  products={tenant.products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                  }))}
                  suppliers={tenant.suppliers.map((s) => ({
                    id: s.id,
                    name: s.name,
                  }))}
                />
              </div>
            </section>

            {/* =================================================
                PURCHASE ORDER HISTORY
            ================================================= */}

            <section className="procurement-history" style={styles.historyCard}>
              <div
                className="procurement-history-header"
                style={styles.historyHeader}
              >
                <div>
                  <div style={styles.eyebrow}>PROCUREMENT LEDGER</div>

                  <h2 style={styles.historyTitle}>Purchase Order History</h2>

                  <p style={styles.historySubtitle}>
                    Track active pipeline items and fulfillment statuses.
                  </p>
                </div>

                <div style={styles.recordCount}>
                  {tenant.purchaseOrders.length}{" "}
                  {tenant.purchaseOrders.length === 1 ? "RECORD" : "RECORDS"}
                </div>
              </div>

              <div
                className="procurement-table-wrapper"
                style={styles.tableWrapper}
              >
                <table className="procurement-table" style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.cellHead}>PO Number</th>

                      <th style={styles.cellHead}>Supplier</th>

                      <th style={styles.cellHead}>Ordered Items</th>

                      <th style={styles.cellHead}>Total Cost</th>

                      <th style={styles.cellHead}>Status / Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tenant.purchaseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={styles.emptyPrompt}>
                          <div style={styles.emptyIcon}>—</div>

                          <div style={styles.emptyTitle}>
                            No Procurement Records Yet
                          </div>

                          <div style={styles.emptyDesc}>
                            Generate a purchase order above to start tracking
                            your inbound supply chain.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tenant.purchaseOrders.map((po) => (
                        <tr key={po.id} style={styles.trRow}>
                          {/* PO NUMBER */}

                          <td
                            data-label="PO Number"
                            style={{
                              ...styles.cellBody,
                              ...styles.poNumberCell,
                            }}
                          >
                            <div style={styles.poNumber}>{po.poNumber}</div>

                            <div style={styles.poLabel}>PURCHASE ORDER</div>
                          </td>

                          {/* SUPPLIER */}

                          <td data-label="Supplier" style={styles.cellBody}>
                            <div style={styles.supplierName}>
                              {po.supplier.name}
                            </div>

                            <div style={styles.supplierLabel}>SUPPLIER</div>
                          </td>

                          {/* ITEMS */}

                          <td
                            data-label="Ordered Items"
                            style={styles.cellBody}
                          >
                            <div style={styles.itemsSummary}>
                              {po.poItems.map((item) => (
                                <div key={item.id} style={styles.itemTag}>
                                  <div style={styles.itemTagTop}>
                                    <span style={styles.itemName}>
                                      {item.product.name}
                                    </span>

                                    <span style={styles.itemQty}>
                                      ×{item.quantity}
                                    </span>
                                  </div>

                                  <span style={styles.itemCost}>
                                    RM {Number(item.unitCost).toFixed(2)} / unit
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* TOTAL */}

                          <td data-label="Total Cost" style={styles.cellBody}>
                            <div style={styles.totalCost}>
                              RM {Number(po.totalCost).toFixed(2)}
                            </div>

                            <div style={styles.totalLabel}>ORDER VALUE</div>
                          </td>

                          {/* STATUS */}

                          <td data-label="Status" style={styles.cellBody}>
                            {po.status === "RECEIVED" ? (
                              <div style={styles.statusStack}>
                                <span style={styles.badgeSuccess}>
                                  <span>Received</span>
                                  <span>✓</span>
                                </span>

                                <span style={styles.statusDescription}>
                                  Inventory updated
                                </span>
                              </div>
                            ) : (
                              <div style={styles.statusStack}>
                                <span style={styles.badgePending}>
                                  Pending Receipt
                                </span>

                                <form
                                  action={async () => {
                                    "use server";

                                    await receivePurchaseOrderAction(
                                      tenant.id,
                                      tenantSlug,
                                      po.id,
                                    );
                                  }}
                                >
                                  <button
                                    type="submit"
                                    style={styles.actionBtn}
                                  >
                                    Receive Stock
                                  </button>
                                </form>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

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
        select,
        button {
          font: inherit;
        }

        input::placeholder {
          color: #475569;
        }

        select:focus,
        input:focus {
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08) !important;
        }

        button {
          transition:
            background-color 0.2s ease,
            transform 0.15s ease,
            filter 0.2s ease;
        }

        button:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        a {
          transition: color 0.2s ease;
        }

        a:hover {
          color: #cbd5e1 !important;
        }

        .procurement-table-wrapper {
          scrollbar-width: thin;
          scrollbar-color: #26364d transparent;
        }

        /* ===================================================
           LARGE TABLET
        =================================================== */

        @media (max-width: 1200px) {
          .procurement-operations {
            grid-template-columns: 1fr !important;
          }

          .procurement-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 900px) {
          .procurement-nav-content {
            padding: 20px 30px !important;
          }

          .procurement-main {
            padding: 34px 30px 70px !important;
          }

          .procurement-summary {
            grid-template-columns: 1fr 1fr !important;
            gap: 18px !important;
          }

          .procurement-summary-divider {
            display: none !important;
          }

          .procurement-summary > div:last-child {
            grid-column: 1 / -1;
          }
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 700px) {
          .procurement-navbar {
            position: relative !important;
          }

          .procurement-nav-content {
            padding: 18px 20px !important;
            display: block !important;
          }

          .procurement-nav-right {
            display: none !important;
          }

          .procurement-title-wrapper {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }

          .procurement-title {
            font-size: 21px !important;
            line-height: 1.25 !important;
          }

          .procurement-main {
            padding: 26px 20px 55px !important;
          }

          .procurement-metrics {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-bottom: 14px !important;
          }

          .procurement-metrics > div {
            min-height: 118px !important;
            padding: 21px !important;
          }

          .procurement-summary {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 18px !important;
            padding: 20px !important;
          }

          .procurement-summary > div:last-child {
            display: flex !important;
          }

          .procurement-operations {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
          }

          .procurement-card {
            padding: 22px !important;
            border-radius: 14px !important;
          }

          .procurement-card-header {
            gap: 12px !important;
            padding-bottom: 20px !important;
            margin-bottom: 22px !important;
          }

          .procurement-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
          }

          .procurement-card-header h2 {
            font-size: 17px !important;
          }

          .poHeader {
            flex-direction: column !important;
          }

          .procurement-history {
            border-radius: 14px !important;
          }

          .procurement-history-header {
            padding: 22px !important;
            flex-direction: column !important;
            gap: 14px !important;
          }

          .procurement-history-header > div:last-child {
            align-self: flex-start !important;
          }

          /* -------------------------------------------------
             TABLE -> MOBILE CARDS
          ------------------------------------------------- */

          .procurement-table-wrapper {
            overflow-x: visible !important;
          }

          .procurement-table {
            display: block !important;
            width: 100% !important;
          }

          .procurement-table thead {
            display: none !important;
          }

          .procurement-table tbody {
            display: block !important;
            width: 100% !important;
          }

          .procurement-table tbody tr {
            display: block !important;
            width: calc(100% - 24px) !important;
            margin: 12px !important;
            border: 1px solid #172033 !important;
            border-radius: 14px !important;
            background: #0a101c !important;
            overflow: hidden !important;
          }

          .procurement-table tbody tr:hover {
            background: #0a101c !important;
          }

          .procurement-table tbody td {
            display: grid !important;
            grid-template-columns: 105px minmax(0, 1fr) !important;
            gap: 14px !important;
            width: 100% !important;
            min-width: 0 !important;
            padding: 17px 16px !important;
            border-bottom: 1px solid #172033 !important;
            vertical-align: middle !important;
          }

          .procurement-table tbody td:last-child {
            border-bottom: none !important;
          }

          .procurement-table tbody td::before {
            content: attr(data-label);
            color: #475569;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.7px;
            text-transform: uppercase;
            padding-top: 2px;
          }

          .procurement-table tbody td > * {
            min-width: 0;
          }

          .procurement-table tbody td:first-child {
            padding-top: 20px !important;
          }

          .procurement-table tbody td:last-child {
            padding-bottom: 20px !important;
          }

          .itemsSummary {
            min-width: 0 !important;
            width: 100% !important;
          }

          .itemTag {
            width: 100% !important;
          }

          .itemTagTop {
            gap: 8px !important;
          }

          .itemName {
            overflow-wrap: anywhere !important;
          }

          .statusStack {
            min-width: 0 !important;
            align-items: flex-start !important;
          }

          .statusStack form {
            width: 100% !important;
          }

          .actionBtn {
            width: 100% !important;
            min-height: 42px !important;
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
          .procurement-nav-content {
            padding: 16px 14px !important;
          }

          .procurement-main {
            padding: 22px 14px 45px !important;
          }

          .procurement-title {
            font-size: 20px !important;
          }

          .procurement-card {
            padding: 18px !important;
          }

          .procurement-card-header {
            align-items: flex-start !important;
          }

          .procurement-summary {
            padding: 18px !important;
          }

          .metricValue {
            font-size: 25px !important;
          }

          .procurement-table tbody tr {
            width: calc(100% - 16px) !important;
            margin: 8px !important;
          }

          .procurement-table tbody td {
            grid-template-columns: 88px minmax(0, 1fr) !important;
            gap: 10px !important;
            padding: 15px 13px !important;
          }

          .procurement-table tbody td::before {
            font-size: 8px !important;
          }

          .itemTag {
            padding: 9px !important;
          }

          .itemName {
            font-size: 10px !important;
          }

          .itemQty {
            font-size: 10px !important;
          }

          .recordCount {
            font-size: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  // =========================================================
  // HEADER
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
    fontSize: "11px",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    padding: "7px 11px",
    borderRadius: "7px",
    fontWeight: 600,
    border: "1px solid #1e293b",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap" as const,
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    backgroundColor: "rgba(16, 185, 129, 0.07)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    padding: "9px 13px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#34d399",
    letterSpacing: "0.3px",
  },

  pulseDot: {
    width: "7px",
    height: "7px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)",
  },

  // =========================================================
  // MAIN
  // =========================================================

  mainLayout: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "42px 48px 90px",
  },

  metricsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  metricCard: {
    minHeight: "142px",
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "14px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    boxShadow: "0 14px 35px -20px rgba(0,0,0,0.8)",
  },

  metricLabel: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 800,
    letterSpacing: "1.2px",
    marginBottom: "10px",
  },

  metricValue: {
    fontSize: "28px",
    lineHeight: 1,
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.8px",
  },

  metricDescription: {
    marginTop: "10px",
    color: "#475569",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  // =========================================================
  // SUMMARY
  // =========================================================

  summaryBar: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    alignItems: "center",
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "14px",
    padding: "18px 22px",
    marginBottom: "28px",
    gap: "20px",
  },

  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  summaryDotBlue: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    boxShadow: "0 0 10px rgba(56, 189, 248, 0.45)",
    flexShrink: 0,
  },

  summaryDotGreen: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 10px rgba(16, 185, 129, 0.45)",
    flexShrink: 0,
  },

  summaryDotAmber: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    boxShadow: "0 0 10px rgba(245, 158, 11, 0.45)",
    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.6px",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
  },

  summaryValue: {
    display: "block",
    color: "#f8fafc",
    fontSize: "15px",
    fontWeight: 800,
  },

  summaryDivider: {
    width: "1px",
    height: "34px",
    backgroundColor: "#172033",
    justifySelf: "center",
  },

  // =========================================================
  // OPERATIONS
  // =========================================================

  operationsGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 0.82fr) minmax(0, 1.8fr)",
    gap: "28px",
  },

  leftCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "28px",
    minWidth: 0,
  },

  rightCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "28px",
    minWidth: 0,
  },

  // =========================================================
  // CARDS
  // =========================================================

  card: {
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 18px 45px -28px rgba(0,0,0,0.9)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    paddingBottom: "24px",
    marginBottom: "26px",
    borderBottom: "1px solid #172033",
  },

  cardHeaderContent: {
    minWidth: 0,
    flex: 1,
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

  formVertical: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "21px",
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

  fieldHint: {
    color: "#475569",
    fontSize: "11px",
    lineHeight: 1.45,
    marginTop: "-1px",
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

  submitBtn: {
    minHeight: "47px",
    padding: "13px 18px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 750 as const,
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "0 8px 22px -12px rgba(16, 185, 129, 0.7)",
    marginTop: "3px",
  },

  // =========================================================
  // PO
  // =========================================================

  poHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    paddingBottom: "24px",
    marginBottom: "26px",
    borderBottom: "1px solid #172033",
  },

  poStatus: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 10px",
    borderRadius: "7px",
    border: "1px solid rgba(56, 189, 248, 0.18)",
    backgroundColor: "rgba(56, 189, 248, 0.05)",
    color: "#38bdf8",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    flexShrink: 0,
  },

  smallPulse: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    boxShadow: "0 0 8px rgba(56, 189, 248, 0.7)",
  },

  poFormWrapper: {
    minWidth: 0,
    width: "100%",
  },

  // =========================================================
  // HISTORY
  // =========================================================

  historyCard: {
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 18px 45px -28px rgba(0,0,0,0.9)",
  },

  historyHeader: {
    padding: "28px 30px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    borderBottom: "1px solid #172033",
  },

  historyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 750,
    color: "#f8fafc",
    letterSpacing: "-0.35px",
  },

  historySubtitle: {
    margin: "7px 0 0",
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.5,
  },

  recordCount: {
    padding: "7px 10px",
    borderRadius: "7px",
    backgroundColor: "#0d1422",
    border: "1px solid #1d2a3e",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    whiteSpace: "nowrap" as const,
  },

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
    padding: "22px 20px",
    verticalAlign: "top",
    fontSize: "13px",
  },

  // =========================================================
  // TABLE CONTENT
  // =========================================================

  poNumberCell: {
    minWidth: "135px",
  },

  poNumber: {
    color: "#38bdf8",
    fontWeight: 800,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "13px",
  },

  poLabel: {
    marginTop: "6px",
    color: "#475569",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.8px",
  },

  supplierName: {
    color: "#f1f5f9",
    fontWeight: 650,
    lineHeight: 1.4,
    minWidth: "130px",
  },

  supplierLabel: {
    marginTop: "6px",
    color: "#475569",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.8px",
  },

  itemsSummary: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "7px",
    minWidth: "190px",
  },

  itemTag: {
    backgroundColor: "#0d1422",
    color: "#94a3b8",
    padding: "9px 11px",
    borderRadius: "8px",
    border: "1px solid #1b273a",
  },

  itemTagTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  itemName: {
    fontSize: "11px",
    fontWeight: 650,
    color: "#cbd5e1",
  },

  itemQty: {
    color: "#38bdf8",
    fontWeight: 800,
    fontSize: "11px",
    whiteSpace: "nowrap" as const,
  },

  itemCost: {
    display: "block",
    marginTop: "4px",
    color: "#475569",
    fontSize: "9px",
  },

  totalCost: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 800,
    whiteSpace: "nowrap" as const,
  },

  totalLabel: {
    marginTop: "6px",
    color: "#475569",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.7px",
  },

  // =========================================================
  // STATUS
  // =========================================================

  statusStack: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: "9px",
    minWidth: "130px",
  },

  badgeSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 800,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap" as const,
  },

  badgePending: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 800,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap" as const,
  },

  statusDescription: {
    color: "#475569",
    fontSize: "9px",
  },

  actionBtn: {
    minHeight: "36px",
    backgroundColor: "#38bdf8",
    color: "#031018",
    border: "none",
    padding: "8px 13px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 5px 15px -9px rgba(56, 189, 248, 0.8)",
  },

  // =========================================================
  // EMPTY STATE
  // =========================================================

  emptyPrompt: {
    textAlign: "center" as const,
    padding: "72px 30px",
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
    fontWeight: 300,
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
    maxWidth: "350px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
};
