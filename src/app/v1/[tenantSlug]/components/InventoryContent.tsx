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

  // =========================================
  // INVENTORY METRICS
  // =========================================

  const totalItemsInStock = products.reduce(
    (acc, product) => acc + product.stockQty,
    0,
  );

  const estimatedStockValue = products.reduce(
    (acc, product) => acc + product.stockQty * Number(product.price || 0),
    0,
  );

  const productsInStock = products.filter(
    (product) => product.stockQty > 0,
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stockQty > 0 && product.stockQty <= 10,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stockQty <= 0,
  ).length;

  // =========================================
  // SERVER ACTION
  // =========================================

  async function registerProduct(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const sku = String(formData.get("sku") || "").trim();
    const price = Number(formData.get("price") || 0);

    if (!name || !sku) return;

    await db.product.create({
      data: {
        name,
        sku,
        price,
        stockQty: 0,
        //@ts-ignore
        tenantId: tenant.id,
      },
    });

    revalidatePath(`/v1/${tenantSlug}/inventory`);
    revalidatePath(`/v1/${tenantSlug}/procurement`);
  }

  return (
    <>
      <style>{`
        .inventory-content-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* =========================================
           METRICS
        ========================================= */

        .inventory-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
        }

        .inventory-metric {
          position: relative;
          min-height: 128px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding: 22px 24px;

          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.9),
              rgba(7, 12, 24, 0.92)
            );

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12);

          overflow: hidden;
        }

        .inventory-metric::after {
          content: "";
          position: absolute;
          right: -35px;
          bottom: -45px;

          width: 120px;
          height: 120px;

          border-radius: 50%;

          background: rgba(56, 189, 248, 0.045);

          filter: blur(20px);
          pointer-events: none;
        }

        .metric-label {
          color: #64748b;

          font-size: 10px;
          font-weight: 750;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .metric-value {
          display: flex;
          align-items: baseline;
          gap: 7px;

          margin-top: 12px;

          font-size: 26px;
          line-height: 1;

          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .metric-unit {
          color: #64748b;

          font-size: 12px;
          font-weight: 500;

          letter-spacing: 0;
        }

        .metric-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-top: 12px;

          color: #475569;

          font-size: 10px;
        }

        /* =========================================
           QUICK ACTIONS
        ========================================= */

        .quick-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          padding: 18px;

          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 15px;

          background: rgba(11, 15, 25, 0.65);
        }

        .quick-actions-copy {
          min-width: 0;
        }

        .quick-actions-title {
          margin: 0;

          color: #cbd5e1;

          font-size: 12px;
          font-weight: 750;
        }

        .quick-actions-subtitle {
          margin: 4px 0 0;

          color: #475569;

          font-size: 10px;
          line-height: 1.45;
        }

        .quick-actions-buttons {
          display: flex;
          align-items: center;

          gap: 10px;

          flex-shrink: 0;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 42px;

          padding: 0 17px;

          border-radius: 10px;

          font-size: 12px;
          font-weight: 700;

          text-decoration: none;

          white-space: nowrap;

          transition:
            transform 160ms ease,
            background 160ms ease,
            border-color 160ms ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
        }

        .action-primary {
          background: #38bdf8;
          color: #030712;

          box-shadow:
            0 5px 18px rgba(56, 189, 248, 0.15);
        }

        .action-primary:hover {
          background: #67d3fa;
        }

        .action-secondary {
          border: 1px solid rgba(148, 163, 184, 0.16);

          background: rgba(15, 23, 42, 0.8);

          color: #e2e8f0;
        }

        .action-secondary:hover {
          background: rgba(30, 41, 59, 0.9);

          border-color: rgba(148, 163, 184, 0.3);
        }

        /* =========================================
           CARD
        ========================================= */

        .inventory-card {
          width: 100%;

          padding: 30px;

          border: 1px solid rgba(148, 163, 184, 0.11);
          border-radius: 17px;

          background:
            linear-gradient(
              145deg,
              rgba(11, 15, 25, 0.96),
              rgba(7, 12, 24, 0.96)
            );

          box-shadow:
            0 14px 40px rgba(0, 0, 0, 0.15);

          overflow: hidden;
        }

        /* =========================================
           CARD HEADER
        ========================================= */

        .inventory-card-header {
          display: flex;
          align-items: flex-start;

          gap: 16px;

          margin-bottom: 28px;
          padding-bottom: 22px;

          border-bottom: 1px solid rgba(148, 163, 184, 0.09);
        }

        .inventory-icon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          border: 1px solid rgba(56, 189, 248, 0.15);
          border-radius: 12px;

          background:
            rgba(56, 189, 248, 0.055);

          color: #38bdf8;

          font-size: 18px;
        }

        .inventory-card-title {
          margin: 0;

          color: #f8fafc;

          font-size: 17px;
          line-height: 1.35;

          font-weight: 750;

          letter-spacing: -0.25px;
        }

        .inventory-card-subtitle {
          max-width: 680px;

          margin: 6px 0 0;

          color: #64748b;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           PRODUCT FORM
        ========================================= */

        .product-form {
          display: flex;
          flex-direction: column;

          gap: 24px;
        }

        .product-form-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;

          gap: 8px;

          min-width: 0;
        }

        .form-label {
          color: #94a3b8;

          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.01em;
        }

        .form-input {
          width: 100%;
          min-height: 46px;

          padding: 0 14px;

          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 10px;

          outline: none;

          background: rgba(15, 23, 42, 0.85);

          color: #f8fafc;

          font-size: 13px;

          transition:
            border-color 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .form-input::placeholder {
          color: #475569;
        }

        .form-input:focus {
          border-color: rgba(56, 189, 248, 0.45);

          background: rgba(15, 23, 42, 1);

          box-shadow:
            0 0 0 3px rgba(56, 189, 248, 0.06);
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 12px;

          padding-top: 4px;
        }

        .submit-button {
          min-height: 44px;

          padding: 0 20px;

          border: 1px solid rgba(52, 211, 153, 0.25);
          border-radius: 10px;

          background:
            rgba(16, 185, 129, 0.12);

          color: #6ee7b7;

          font-size: 12px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background 160ms ease,
            border-color 160ms ease,
            transform 160ms ease;
        }

        .submit-button:hover {
          background:
            rgba(16, 185, 129, 0.18);

          border-color:
            rgba(52, 211, 153, 0.4);

          transform: translateY(-1px);
        }

        /* =========================================
           TABLE HEADER
        ========================================= */

        .table-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
        }

        .table-heading {
          margin: 0;

          color: #f8fafc;

          font-size: 17px;
          font-weight: 750;

          letter-spacing: -0.25px;
        }

        .table-description {
          margin: 5px 0 0;

          color: #475569;

          font-size: 10px;
        }

        .results-count {
          flex: 0 0 auto;

          padding: 7px 10px;

          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 7px;

          background: rgba(15, 23, 42, 0.55);

          color: #64748b;

          font-size: 10px;
        }

        .results-count strong {
          color: #cbd5e1;
        }

        /* =========================================
           TABLE
        ========================================= */

        .table-container {
          width: 100%;

          overflow-x: auto;

          border:
            1px solid rgba(148, 163, 184, 0.09);

          border-radius: 12px;
        }

        .inventory-table {
          width: 100%;

          min-width: 720px;

          border-collapse: separate;
          border-spacing: 0;

          text-align: left;
        }

        .inventory-table thead {
          background:
            rgba(15, 23, 42, 0.72);
        }

        .inventory-table th {
          padding: 15px 18px;

          border-bottom:
            1px solid rgba(148, 163, 184, 0.1);

          color: #64748b;

          font-size: 9px;
          font-weight: 750;

          letter-spacing: 0.07em;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .inventory-table td {
          padding: 17px 18px;

          border-bottom:
            1px solid rgba(148, 163, 184, 0.065);

          color: #cbd5e1;

          font-size: 12px;

          vertical-align: middle;
        }

        .inventory-table tbody tr {
          transition:
            background 140ms ease;
        }

        .inventory-table tbody tr:hover {
          background:
            rgba(30, 41, 59, 0.25);
        }

        .inventory-table tbody tr:last-child td {
          border-bottom: none;
        }

        .sku {
          color: #38bdf8;

          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;

          font-size: 11px;
          font-weight: 700;
        }

        .product-name {
          color: #f1f5f9;

          font-size: 12px;
          font-weight: 650;
        }

        .price {
          color: #94a3b8;

          font-size: 12px;
          font-weight: 550;
        }

        .stock-value {
          color: #f8fafc;

          font-weight: 700;
        }

        .stock-unit {
          margin-left: 4px;

          color: #475569;

          font-size: 10px;
          font-weight: 400;
        }

        /* =========================================
           STATUS BADGES
        ========================================= */

        .status-badge {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          min-height: 27px;

          padding: 0 9px;

          border-radius: 7px;

          font-size: 9px;
          font-weight: 700;

          white-space: nowrap;
        }

        .status-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          flex: 0 0 auto;
        }

        .status-success {
          border: 1px solid rgba(16, 185, 129, 0.18);

          background:
            rgba(16, 185, 129, 0.07);

          color: #6ee7b7;
        }

        .status-success .status-dot {
          background: #34d399;
          box-shadow: 0 0 7px rgba(52, 211, 153, 0.65);
        }

        .status-warning {
          border: 1px solid rgba(245, 158, 11, 0.18);

          background:
            rgba(245, 158, 11, 0.07);

          color: #fbbf24;
        }

        .status-warning .status-dot {
          background: #fbbf24;
          box-shadow: 0 0 7px rgba(251, 191, 36, 0.55);
        }

        .status-danger {
          border: 1px solid rgba(239, 68, 68, 0.18);

          background:
            rgba(239, 68, 68, 0.07);

          color: #fca5a5;
        }

        .status-danger .status-dot {
          background: #f87171;
          box-shadow: 0 0 7px rgba(248, 113, 113, 0.55);
        }

        /* =========================================
           EMPTY STATE
        ========================================= */

        .empty-state {
          padding: 72px 30px;

          text-align: center;

          background:
            rgba(11, 15, 25, 0.45);
        }

        .empty-icon {
          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 16px;

          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 14px;

          background:
            rgba(15, 23, 42, 0.75);

          font-size: 22px;
        }

        .empty-title {
          margin: 0;

          color: #e2e8f0;

          font-size: 14px;
          font-weight: 750;
        }

        .empty-description {
          max-width: 420px;

          margin: 8px auto 0;

          color: #475569;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 900px) {
          .product-form-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .quick-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .quick-actions-buttons {
            width: 100%;
          }

          .action-button {
            flex: 1;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 640px) {
          .inventory-content-root {
            gap: 20px;
          }

          .inventory-metrics {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .inventory-metric {
            min-height: 112px;

            padding: 20px;
          }

          .metric-value {
            font-size: 23px;
          }

          .quick-actions {
            padding: 16px;

            gap: 16px;
          }

          .quick-actions-buttons {
            flex-direction: column;
            gap: 9px;
          }

          .action-button {
            width: 100%;
            flex: none;
          }

          .inventory-card {
            padding: 20px 16px;

            border-radius: 14px;
          }

          .inventory-card-header {
            gap: 12px;

            margin-bottom: 22px;
            padding-bottom: 18px;
          }

          .inventory-icon {
            width: 38px;
            height: 38px;

            border-radius: 10px;

            font-size: 15px;
          }

          .inventory-card-title {
            font-size: 15px;
          }

          .inventory-card-subtitle {
            font-size: 10px;
          }

          .product-form {
            gap: 20px;
          }

          .product-form-grid {
            grid-template-columns: 1fr;

            gap: 16px;
          }

          .form-input {
            min-height: 44px;
          }

          .form-footer {
            justify-content: stretch;
          }

          .submit-button {
            width: 100%;
          }

          .table-section-header {
            align-items: flex-start;

            flex-direction: column;

            gap: 10px;

            margin-bottom: 16px;
          }

          .results-count {
            align-self: flex-start;
          }

          .empty-state {
            padding: 55px 20px;
          }
        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 420px) {
          .inventory-metric {
            padding: 18px;
          }

          .inventory-card {
            padding: 18px 14px;
          }

          .inventory-card-header {
            align-items: flex-start;
          }

          .inventory-icon {
            display: none;
          }

          .table-container {
            margin: 0 -2px;
          }
        }
      `}</style>

      <div className="inventory-content-root">
        {/* =========================================
            METRICS
        ========================================= */}

        <section className="inventory-metrics">
          <div className="inventory-metric">
            <div>
              <div className="metric-label">Total Volume</div>

              <div className="metric-value" style={{ color: "#38bdf8" }}>
                {totalItemsInStock}
                <span className="metric-unit">Units</span>
              </div>
            </div>

            <div className="metric-meta">
              <span>{productsInStock}</span>
              active product lines
            </div>
          </div>

          <div className="inventory-metric">
            <div>
              <div className="metric-label">Stock Value</div>

              <div className="metric-value" style={{ color: "#34d399" }}>
                RM {estimatedStockValue.toFixed(2)}
              </div>
            </div>

            <div className="metric-meta">
              Estimated value based on current selling prices
            </div>
          </div>
        </section>

        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <section className="quick-actions">
          <div className="quick-actions-copy">
            <h3 className="quick-actions-title">Inventory operations</h3>

            <p className="quick-actions-subtitle">
              Adjust stock levels or move directly into your sales workflow.
            </p>
          </div>

          <div className="quick-actions-buttons">
            <Link
              href={`/v1/${tenantSlug}/procurement`}
              className="action-button action-primary"
            >
              + Procure / Adjust Stock
            </Link>

            <Link
              href={`/v1/${tenantSlug}/sales`}
              className="action-button action-secondary"
            >
              Issue Sales Invoice
            </Link>
          </div>
        </section>

        {/* =========================================
            REGISTER PRODUCT
        ========================================= */}

        <section className="inventory-card">
          <div className="inventory-card-header">
            <div className="inventory-icon">+</div>

            <div>
              <h3 className="inventory-card-title">Register New Product</h3>

              <p className="inventory-card-subtitle">
                Create a product profile in your master catalog. Products
                registered here can immediately be used across Procurement and
                Sales.
              </p>
            </div>
          </div>

          <form action={registerProduct} className="product-form">
            <div className="product-form-grid">
              <div className="form-group">
                <label className="form-label">SKU / Product Code</label>

                <input
                  name="sku"
                  required
                  placeholder="e.g. HW-LAP-DELL"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Name</label>

                <input
                  name="name"
                  required
                  placeholder="e.g. Dell Latitude Laptop"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (RM)</label>

                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 3500.00"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="submit-button">
                + Add Product to Stock Master
              </button>
            </div>
          </form>
        </section>

        {/* =========================================
            MASTER STOCK CATALOG
        ========================================= */}

        <section className="inventory-card">
          <div className="table-section-header">
            <div>
              <h3 className="table-heading">Master Stock Catalog</h3>

              <p className="table-description">
                Complete overview of products currently registered in your
                inventory.
              </p>
            </div>

            <div className="results-count">
              Showing <strong>{products.length}</strong> items
            </div>
          </div>

          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Product Name</th>
                  <th>Selling Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <div className="empty-icon">+</div>

                        <h4 className="empty-title">No Products Found</h4>

                        <p className="empty-description">
                          No products are registered in this tenant yet. Use the
                          product form above to create your first inventory
                          item.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isOutOfStock = product.stockQty <= 0;

                    const isLowStock =
                      product.stockQty > 0 && product.stockQty <= 10;

                    return (
                      <tr key={product.id}>
                        <td>
                          <span className="sku">{product.sku}</span>
                        </td>

                        <td>
                          <span className="product-name">{product.name}</span>
                        </td>

                        <td>
                          <span className="price">
                            RM {Number(product.price || 0).toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <span className="stock-value">
                            {product.stockQty}
                          </span>

                          <span className="stock-unit">Units</span>
                        </td>

                        <td>
                          {isOutOfStock ? (
                            <span className="status-badge status-danger">
                              <span className="status-dot" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="status-badge status-warning">
                              <span className="status-dot" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="status-badge status-success">
                              <span className="status-dot" />
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================
            INVENTORY SUMMARY
        ========================================= */}

        {products.length > 0 && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                border: "1px solid rgba(52, 211, 153, 0.12)",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.035)",
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontSize: "9px",
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Healthy Stock
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#6ee7b7",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {productsInStock - lowStockProducts}
              </div>
            </div>

            <div
              style={{
                padding: "16px 18px",
                border: "1px solid rgba(245, 158, 11, 0.12)",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.035)",
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontSize: "9px",
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Low Stock
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#fbbf24",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {lowStockProducts}
              </div>
            </div>

            <div
              style={{
                padding: "16px 18px",
                border: "1px solid rgba(239, 68, 68, 0.12)",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.035)",
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontSize: "9px",
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Out of Stock
              </div>

              <div
                style={{
                  marginTop: "8px",
                  color: "#fca5a5",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {outOfStockProducts}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
