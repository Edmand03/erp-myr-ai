"use client";
import { useState } from "react";

export function ProductTable({ products }: { products: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Search Input with a clean border */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="🔍 Search SKU or Name..."
          className="w-full md:w-96 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-indigo-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {p.sku}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  RM {Number(p.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${p.stockQty < 10 ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}
                  >
                    {p.stockQty} Units
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
