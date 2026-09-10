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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const accessCheck = await db.tenantMember.findFirst({
    where: { userId: session.user.id, tenant: { slug: tenantSlug } },
    include: {
      tenant: {
        include: {
          products: { orderBy: { name: "asc" } },
          suppliers: { orderBy: { name: "asc" } },
          purchaseOrders: {
            orderBy: { createdAt: "desc" },
            include: {
              supplier: true,
              poItems: { include: { product: true } },
            },
          },
        },
      },
    },
  });

  if (!accessCheck) redirect("/dashboard-redirect");

  const tenant = accessCheck.tenant;

  // Actions
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

  return (
    <div style={styles.container}>
      <header
        //@ts-ignore
        style={styles.navbar}
      >
        <div style={styles.navContent}>
          <div style={styles.navLeft}>
            <Link href={`/v1/${tenantSlug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span> Return to ERP Hub
            </Link>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title}>{tenant.name} Procurement Hub</h1>
              <span style={styles.badgeSub}>Supply Chain & Inventory Ops</span>
            </div>
          </div>
          <div style={styles.navRight}>
            <div style={styles.liveIndicator}>
              <span style={styles.pulseDot}></span>
              <span>Live Engine</span>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.mainLayout}>
        {/* Left Column: Quick Manual Configurations */}
        <div style={styles.leftCol}>
          {/* Quick Manual Inventory Adjustment Form */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>📦</div>
              <div>
                <h3 style={styles.cardTitle}>Instant Manual Stock Entry</h3>
                <p style={styles.cardSubtitle}>
                  Adjust stock levels directly without raising a PO
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
                      {p.name} (Current: {p.stockQty})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Quantity Change</label>
                <input
                  name="quantity"
                  type="number"
                  placeholder="e.g. 50 (add) or -10 (deduct)"
                  required
                  style={styles.input}
                />
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
                style={{ ...styles.submitBtn, backgroundColor: "#38bdf8" }}
              >
                Apply Manual Adjustment
              </button>
            </form>
          </div>

          {/* Create Supplier Form */}
          <div style={{ ...styles.card, marginTop: "32px" }}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>⚡</div>
              <div>
                <h3 style={styles.cardTitle}>Onboard Supplier</h3>
                <p style={styles.cardSubtitle}>
                  Register a new vendor for procurement orders
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
          </div>
        </div>

        {/* Right Column: Multi-Item PO Operations & Orders List */}
        <div style={styles.rightCol}>
          {/* Multi-Line PO Client Component */}
          <div style={styles.card}>
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

          {/* List of Issued POs */}
          <div
            style={{
              ...styles.card,
              marginTop: "32px",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                borderBottom: "1px solid #1e293b",
              }}
            >
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                Purchase Order History
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Track active pipeline items and fulfillment statuses
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
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
                        <div style={styles.emptyIcon}>📂</div>
                        <div style={styles.emptyTitle}>
                          No Procurement Records Yet
                        </div>
                        <div style={styles.emptyDesc}>
                          Generate a purchase order above to start tracking your
                          inbound supply chain.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tenant.purchaseOrders.map((po) => (
                      <tr key={po.id} style={styles.trRow}>
                        <td
                          style={{
                            ...styles.cellBody,
                            fontWeight: 800,
                            color: "#38bdf8",
                            fontFamily: "monospace",
                          }}
                        >
                          {po.poNumber}
                        </td>
                        <td
                          style={{
                            ...styles.cellBody,
                            fontWeight: 600,
                            color: "#f1f5f9",
                          }}
                        >
                          {po.supplier.name}
                        </td>
                        <td style={styles.cellBody}>
                          <div style={styles.itemsSummary}>
                            {po.poItems.map((item) => (
                              <span key={item.id} style={styles.itemTag}>
                                {item.product.name}{" "}
                                <span style={styles.itemQty}>
                                  ×{item.quantity}
                                </span>{" "}
                                (RM {Number(item.unitCost).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td
                          style={{
                            ...styles.cellBody,
                            fontWeight: 800,
                            color: "#f8fafc",
                          }}
                        >
                          RM {Number(po.totalCost).toFixed(2)}
                        </td>
                        <td style={styles.cellBody}>
                          {po.status === "RECEIVED" ? (
                            <span style={styles.badgeSuccess}>Received ✓</span>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                alignItems: "flex-start",
                              }}
                            >
                              <span style={styles.badgePending}>
                                Pending Outbound
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
                                <button type="submit" style={styles.actionBtn}>
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
          </div>
        </div>
      </main>
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
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#34d399",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    boxShadow: "0 0 8px #10b981",
  },
  mainLayout: {
    padding: "40px",
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "32px",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  leftCol: { display: "flex", flexDirection: "column" as const },
  rightCol: { display: "flex", flexDirection: "column" as const },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
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
  formVertical: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
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
  submitBtn: {
    padding: "14px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700" as const,
    cursor: "pointer",
    fontSize: "15px",
    letterSpacing: "-0.2px",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    marginTop: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
  },
  thRow: { backgroundColor: "#111827", borderBottom: "1px solid #1e293b" },
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
  cellBody: { padding: "20px 24px", verticalAlign: "top", fontSize: "14px" },
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
  itemsSummary: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  itemTag: {
    fontSize: "12px",
    backgroundColor: "#111827",
    color: "#94a3b8",
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    fontWeight: 500,
    display: "inline-block",
  },
  itemQty: {
    color: "#38bdf8",
    fontWeight: 700,
  },
  badgeSuccess: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    letterSpacing: "0.2px",
    display: "inline-block",
  },
  badgePending: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    letterSpacing: "0.2px",
    display: "inline-block",
  },
  actionBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 6px rgba(56, 189, 248, 0.2)",
  },
};
