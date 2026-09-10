"use client";
import { useState } from "react";
import { importCustomerRowsAction } from "@/app/actions/import-customers";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function ClientPdfImporter({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("Reading PDF in browser...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      let fullText = "";

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join("\n");
        fullText += "\n" + pageText;
      }

      setStatus("Parsing customer blocks & syncing to database...");

      const customerBlocks = fullText.split(/(?=\b300-[A-Z0-9]+\b)/g);

      // Call server action safely with standard async/await
      const result = await importCustomerRowsAction(tenantId, customerBlocks);

      if (result.success) {
        setStatus(result.message || "Import complete!");
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #334155",
        borderRadius: "8px",
        maxWidth: "450px",
      }}
    >
      <h3>Client-Side PDF Customer Import</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={loading}
        style={{ marginTop: "12px", display: "block" }}
      />
      {status && (
        <p style={{ marginTop: "12px", fontSize: "14px", color: "#38bdf8" }}>
          {status}
        </p>
      )}
    </div>
  );
}
