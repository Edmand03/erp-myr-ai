"use client";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";

export default function DownloadPdfButton({
  invoice,
  tenantName,
}: {
  invoice: any;
  tenantName: string;
}) {
  return (
    <button
      onClick={() => generateInvoicePdf(invoice, tenantName)}
      style={{
        backgroundColor: "#1e293b",
        color: "#38bdf8",
        border: "1px solid #334155",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      📄 Download PDF
    </button>
  );
}
