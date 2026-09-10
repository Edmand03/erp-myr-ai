"use client";
import { useState } from "react";

export function ProductCatalog({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [search, setSearch] = useState("");

  const filtered = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search SKU or Name..."
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          backgroundColor: "#09090b",
          border: "1px solid #27272a",
          borderRadius: "6px",
          color: "#fff",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      />

      {/* Table - Reusing your styles */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {/* ... headers same as before ... */}
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #27272a" }}>
              <td style={{ padding: "16px 20px", color: "#a1a1aa" }}>
                {p.sku}
              </td>
              <td style={{ padding: "16px 20px", color: "#fff" }}>{p.name}</td>
              <td style={{ padding: "16px 20px" }}>
                RM {Number(p.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
