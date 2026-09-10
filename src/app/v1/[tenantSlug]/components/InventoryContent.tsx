import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function InventoryContent({
  tenantId,
  tenantSlug,
}: {
  tenantId: string;
  tenantSlug: string;
}) {
  // Fetch tenant products lazily
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      products: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!tenant) return null;
  const products = tenant.products;

  // Calculate high-level stock valuation metrics
  const totalItemsInStock = products.reduce((acc, p) => acc + p.stockQty, 0);
  const estimatedStockValue = products.reduce(
    (acc, p) => acc + p.stockQty * Number(p.price || 0),
    0,
  );

  // --- SERVER ACTION: Adds products directly to the DB ---
  async function registerProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const price = Number(formData.get("price") || 0);

    if (!name || !sku) return;

    await db.product.create({
      data: {
        name,
        sku,
        price,
        stockQty: 0,
        tenantId: tenant?.id || "",
      },
    });

    revalidatePath(`/v1/${tenantSlug}/inventory`);
    revalidatePath(`/v1/${tenantSlug}/procurement`);
  }

  return (
    <>
      {/* Metrics Row injected dynamically */}
      <div style={styles.metricsWrapper}>
        <div style={styles.metricCard}>
          <span style={styles.metricTitle}>Total Volume</span>
          <span style={{ ...styles.metricVal, color: "#38bdf8" }}>
            {totalItemsInStock} <span style={styles.metricUnit}>Units</span>
          </span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricTitle}>Stock Value</span>
          <span style={{ ...styles.metricVal, color: "#34d399" }}>
            RM {estimatedStockValue.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={styles.quickActionsBar}>
        <Link
          href={`/v1/${tenantSlug}/procurement`}
          style={styles.primaryActionBtn}
        >
          ➕ Procure / Adjust Stock
        </Link>
        <Link
          href={`/v1/${tenantSlug}/sales`}
          style={styles.secondaryActionBtn}
        >
          🧾 Issue Sales Invoice
        </Link>
      </div>

      {/* 1. Register Product Form */}
      <div style={styles.addCard}>
        <div style={styles.cardHeader}>
          <div style={styles.iconBox}>📦</div>
          <div>
            <h3 style={styles.cardTitle}>Register New Product to Catalog</h3>
            <p style={styles.cardSubtitle}>
              Create base inventory profiles here so they are instantly ready to
              be bought in Procurement or sold in Sales.
            </p>
          </div>
        </div>

        <form action={registerProduct} style={styles.form}>
          <div style={styles.formInputGrid}>
            <div style={styles.group}>
              <label style={styles.label}>SKU / Product Code</label>
              <input
                name="sku"
                required
                placeholder="e.g. HW-LAP-DELL"
                style={styles.input}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Product Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Dell Latitude Laptop"
                style={styles.input}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Selling Price (RM)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                placeholder="e.g. 3500.00"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formFooter}>
            <button type="submit" style={styles.submitBtn}>
              ＋ Add Product to Stock Master
            </button>
          </div>
        </form>
      </div>

      {/* 2. Master Stock Table */}
      <div style={styles.card}>
        <div style={styles.tableHeaderSection}>
          <h3 style={styles.sectionHeading}>Master Stock Catalog</h3>
          <span style={styles.resultsCount}>
            Showing <strong>{products.length}</strong> items registered
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.cellHead}>Product SKU</th>
                <th style={styles.cellHead}>Product Name</th>
                <th style={styles.cellHead}>Selling Price</th>
                <th style={styles.cellHead}>Current Stock</th>
                <th style={styles.cellHead}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.emptyPrompt}>
                    <div style={styles.emptyIcon}>📂</div>
                    <div style={styles.emptyTitle}>No Products Found</div>
                    <div style={styles.emptyDesc}>
                      No products registered in this tenant yet. Use the form
                      above to add your first product!
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isOutOfStock = p.stockQty <= 0;
                  const isLowStock = p.stockQty > 0 && p.stockQty <= 10;

                  return (
                    <tr key={p.id} style={styles.trRow}>
                      <td
                        style={{
                          ...styles.cellBody,
                          fontWeight: 700,
                          color: "#38bdf8",
                          fontFamily: "monospace",
                        }}
                      >
                        {p.sku}
                      </td>
                      <td
                        style={{
                          ...styles.cellBody,
                          fontWeight: 700,
                          color: "#f8fafc",
                        }}
                      >
                        {p.name}
                      </td>
                      <td
                        style={{
                          ...styles.cellBody,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        RM {Number(p.price || 0).toFixed(2)}
                      </td>
                      <td
                        style={{
                          ...styles.cellBody,
                          fontWeight: 700,
                          color: "#f8fafc",
                        }}
                      >
                        {p.stockQty}{" "}
                        <span
                          style={{
                            color: "#64748b",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        >
                          Units
                        </span>
                      </td>
                      <td style={styles.cellBody}>
                        {isOutOfStock ? (
                          <span style={styles.badgeDanger}>● Out of Stock</span>
                        ) : isLowStock ? (
                          <span style={styles.badgeWarning}>● Low Stock</span>
                        ) : (
                          <span style={styles.badgeSuccess}>● Healthy</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const styles = {
  metricsWrapper: { display: "flex", gap: "12px" },
  metricCard: {
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    padding: "10px 18px",
    borderRadius: "12px",
    minWidth: "150px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  metricTitle: {
    fontSize: "11px",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  metricVal: {
    fontSize: "18px",
    fontWeight: 800,
    marginTop: "2px",
    letterSpacing: "-0.3px",
  },
  metricUnit: { fontSize: "12px", color: "#64748b", fontWeight: 500 },
  quickActionsBar: { display: "flex", gap: "12px", flexWrap: "wrap" as const },
  primaryActionBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    padding: "10px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
  },
  secondaryActionBtn: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "10px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
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
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "24px" },
  formInputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  group: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  label: { fontSize: "13px", color: "#94a3b8", fontWeight: 600 },
  input: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },
  formFooter: { display: "flex", justifyContent: "flex-end" },
  submitBtn: {
    padding: "12px 24px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  tableHeaderSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  sectionHeading: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  resultsCount: { fontSize: "13px", color: "#64748b" },
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
    textTransform: "uppercase" as const,
  },
  trRow: { borderBottom: "1px solid #1e293b" },
  cellBody: { padding: "18px 24px", verticalAlign: "middle", fontSize: "14px" },
  emptyPrompt: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "#0b0f19",
  },
  emptyIcon: { fontSize: "36px", marginBottom: "12px" },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  emptyDesc: {
    fontSize: "13px",
    color: "#64748b",
    maxWidth: "340px",
    margin: "0 auto",
  },
  badgeSuccess: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.25)",
  },
  badgeWarning: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.25)",
  },
  badgeDanger: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
  },
};
