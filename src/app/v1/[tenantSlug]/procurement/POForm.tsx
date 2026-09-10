"use client";

import { useState } from "react";
import {
  createPurchaseOrderAction,
  createSupplierAction,
} from "@/app/actions/procurement";

interface Product {
  id: string;
  name: string;
  sku: string;
}
interface Supplier {
  id: string;
  name: string;
}

interface POFormProps {
  tenantId: string;
  slug: string;
  products: Product[];
  suppliers: Supplier[];
}

export default function POForm({
  tenantId,
  slug,
  products,
  suppliers: initialSuppliers,
}: POFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierId, setSupplierId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; cost: number }>
  >([{ productId: "", quantity: 1, cost: 0 }]);

  const handleAddLine = () => {
    setItems([...items, { productId: "", quantity: 1, cost: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return alert("Select a Supplier first!");

    const formattedItems = items
      .filter((item) => item.productId !== "")
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.cost),
      }));

    const res = await createPurchaseOrderAction(
      tenantId,
      slug,
      supplierId,
      poNumber,
      formattedItems,
    );

    if (res.error) {
      alert(res.error);
    } else {
      alert("PO Created successfully!");
      setPoNumber("");
      setItems([{ productId: "", quantity: 1, cost: 0 }]);
    }
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + (item.quantity * item.cost || 0),
    0,
  );

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formHeader}>
        <h3 style={styles.formTitle}>Raise Purchase Order</h3>
        <p style={styles.formSubtitle}>
          Select a vendor and itemize goods for inbound fulfillment
        </p>
      </div>

      <div style={styles.sectionBlock}>
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Supplier</label>
            <select
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              style={styles.input}
            >
              <option value="">Choose Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>PO Number</label>
            <input
              required
              placeholder="e.g. PO-998"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.sectionBlock}>
        <div style={styles.lineHeaderContainer}>
          <h4 style={styles.sectionHeading}>Items to Procure</h4>
          <span style={styles.lineSubText}>
            Configure product lines, quantities and unit acquisition costs
          </span>
        </div>

        <div style={styles.itemsWrapper}>
          {items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <div style={{ flex: 3 }}>
                <select
                  required
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={{ flex: 1.5 }}>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Unit Cost"
                  value={item.cost || ""}
                  onChange={(e) =>
                    handleItemChange(index, "cost", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveLine(index)}
                  disabled={items.length === 1}
                  style={styles.removeBtn}
                  title="Remove Item Line"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddLine} style={styles.addBtn}>
          + Add Item Line
        </button>
      </div>

      <div style={styles.summaryBox}>
        <span style={styles.summaryLabel}>Est. Total Outlay:</span>
        <span style={styles.summaryValue}>RM {grandTotal.toFixed(2)}</span>
      </div>

      <button type="submit" style={styles.submitBtn}>
        Generate PO Draft
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    padding: "36px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formTitle: {
    margin: "0 0 6px 0",
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  formSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  sectionBlock: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  group: {
    flex: 1,
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
  divider: {
    borderColor: "#1e293b",
    margin: "32px 0",
    borderWidth: "1px",
    borderStyle: "solid",
  },
  lineHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginBottom: "4px",
  },
  sectionHeading: {
    color: "#f8fafc",
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
  },
  lineSubText: {
    fontSize: "12px",
    color: "#64748b",
  },
  itemsWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },
  itemRow: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  removeBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    transition: "background-color 0.2s ease",
  },
  addBtn: {
    backgroundColor: "transparent",
    color: "#38bdf8",
    border: "1px dashed rgba(56, 189, 248, 0.3)",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
    fontWeight: 600,
    fontSize: "13px",
    marginTop: "6px",
    transition: "all 0.2s ease",
  },
  summaryBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: "20px 24px",
    borderRadius: "12px",
    marginTop: "32px",
    border: "1px solid #1e293b",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  summaryLabel: {
    fontSize: "15px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: "20px",
    color: "#34d399",
    fontWeight: "800",
    letterSpacing: "-0.3px",
  },
  submitBtn: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "700" as const,
    marginTop: "20px",
    fontSize: "15px",
    letterSpacing: "-0.2px",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
};
