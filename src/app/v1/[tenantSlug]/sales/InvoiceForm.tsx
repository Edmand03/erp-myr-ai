"use client";

import { useState } from "react";

export default function InvoiceForm({
  tenantId,
  slug,
  products,
  customers,
  onCreateInvoice,
}: {
  tenantId: string;
  slug: string;
  products: string;
  customers: string;
  onCreateInvoice: any;
}) {
  const [loading, setLoading] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);

  const [customItems, setCustomItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customerId = formData.get("customerId");
    const invoiceNumber = formData.get("invoiceNumber");
    const dueDate = formData.get("dueDate");

    const lineItems = [
      ...selectedProducts
        .filter((p) => p.productId && p.quantity > 0)
        .map((p) => ({
          productId: p.productId,
          description: null,
          quantity: Number(p.quantity),
          unitPrice: Number(p.unitPrice),
        })),
      ...customItems
        .filter((c) => c.description && c.quantity > 0)
        .map((c) => ({
          productId: null,
          description: c.description,
          quantity: Number(c.quantity),
          unitPrice: Number(c.unitPrice),
        })),
    ];

    if (lineItems.length === 0) {
      alert("Please add at least one product or custom charge.");
      setLoading(false);
      return;
    }

    const result = await onCreateInvoice({
      customerId,
      invoiceNumber,
      dueDate,
      items: lineItems,
    });

    if (result?.error) {
      alert(`Error: ${result.error}`);
    } else {
      alert("Invoice successfully saved!");
      e.target.reset();
      setSelectedProducts([{ productId: "", quantity: 1, unitPrice: 0 }]);
      setCustomItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Invoice Number</label>
        <input
          name="invoiceNumber"
          required
          placeholder="INV-0001"
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Select Client</label>
        <select name="customerId" required style={styles.select}>
          <option value="">-- Choose customer --</option>
          {
            //@ts-ignore
            customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          }
        </select>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Due Date</label>
        <input type="date" name="dueDate" required style={styles.input} />
      </div>

      {/* Catalog Products Section */}
      <div style={styles.sectionBlock}>
        <span style={styles.sectionTitle}>1. Inventory Products</span>

        {/* Column Labels */}
        <div style={styles.rowLabels}>
          <span style={styles.colLabelItem}>Product Item</span>
          <span style={styles.colLabelSmall}>Qty</span>
          <span style={styles.colLabelSmall}>Price (RM)</span>
        </div>

        {selectedProducts.map((item, index) => (
          <div key={index} style={styles.rowItem}>
            <select
              value={item.productId}
              onChange={(e) => {
                const val = e.target.value;
                //@ts-ignore
                const prod = products.find((p) => p.id === val);
                const updated = [...selectedProducts];
                updated[index].productId = val;
                if (prod) updated[index].unitPrice = prod.price;
                setSelectedProducts(updated);
              }}
              style={styles.select}
            >
              <option value="">-- Select product --</option>
              {
                //@ts-ignore
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (RM {p.price})
                  </option>
                ))
              }
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const updated = [...selectedProducts];
                updated[index].quantity = Number(e.target.value);
                setSelectedProducts(updated);
              }}
              style={styles.inputSmall}
              title="Quantity"
            />
            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) => {
                const updated = [...selectedProducts];
                updated[index].unitPrice = Number(e.target.value);
                setSelectedProducts(updated);
              }}
              style={styles.inputSmall}
              title="Unit Price"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setSelectedProducts([
              ...selectedProducts,
              { productId: "", quantity: 1, unitPrice: 0 },
            ])
          }
          style={styles.addBtn}
        >
          + Add Product Row
        </button>
      </div>

      {/* Custom Labor Charges Section */}
      <div style={styles.sectionBlock}>
        <span style={styles.sectionTitle}>2. Labor & Custom Charges</span>

        {/* Column Labels */}
        <div style={styles.rowLabels}>
          <span style={styles.colLabelItem}>Description</span>
          <span style={styles.colLabelSmall}>Qty</span>
          <span style={styles.colLabelSmall}>Rate (RM)</span>
        </div>

        {customItems.map((item, index) => (
          <div key={index} style={styles.rowItem}>
            <input
              type="text"
              placeholder="e.g. Installation / Service Fee"
              value={item.description}
              onChange={(e) => {
                const updated = [...customItems];
                updated[index].description = e.target.value;
                setCustomItems(updated);
              }}
              style={styles.select}
            />
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const updated = [...customItems];
                updated[index].quantity = Number(e.target.value);
                setCustomItems(updated);
              }}
              style={styles.inputSmall}
              title="Quantity"
            />
            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) => {
                const updated = [...customItems];
                updated[index].unitPrice = Number(e.target.value);
                setCustomItems(updated);
              }}
              style={styles.inputSmall}
              title="Rate"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setCustomItems([
              ...customItems,
              { description: "", quantity: 1, unitPrice: 0 },
            ])
          }
          style={styles.addBtn}
        >
          + Add Labor Row
        </button>
      </div>

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? "Saving..." : "Save Invoice"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    padding: "16px",
  },
  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#94a3b8" },
  input: {
    backgroundColor: "#030712",
    color: "#fff",
    border: "1px solid #334155",
    padding: "8px",
    borderRadius: "6px",
  },
  inputSmall: {
    backgroundColor: "#030712",
    color: "#fff",
    border: "1px solid #334155",
    padding: "8px",
    borderRadius: "6px",
    width: "80px",
    textAlign: "center" as const,
  },
  select: {
    backgroundColor: "#030712",
    color: "#fff",
    border: "1px solid #334155",
    padding: "8px",
    borderRadius: "6px",
    flex: 1,
  },
  sectionBlock: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  sectionTitle: { fontSize: "13px", fontWeight: 700, color: "#38bdf8" },
  rowLabels: {
    display: "flex",
    gap: "8px",
    padding: "0 4px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 600,
  },
  colLabelItem: {
    flex: 1,
  },
  colLabelSmall: {
    width: "80px",
    textAlign: "center" as const,
  },
  rowItem: { display: "flex", gap: "8px", alignItems: "center" },
  addBtn: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #334155",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
  },
  submitBtn: {
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
