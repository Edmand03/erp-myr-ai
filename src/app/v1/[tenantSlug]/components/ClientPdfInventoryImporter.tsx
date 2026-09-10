"use client";
import { useState } from "react";
import { ImportInventoryRowsAction } from "@/app/v1/[tenantSlug]/inventory/ImportInventory";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function ClientPdfInventoryImporter({
  tenantId,
}: {
  tenantId: string;
}) {
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

      let allLines: string[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        const pageLines = textContent.items
          .map((item: any) => item.str?.trim())
          .filter(Boolean);

        allLines.push(...pageLines);
      }

      // 🔍 PRINT ALL EXTRACTED LINES TO CONSOLE SO WE CAN SEE THEM
      console.log("EXTRACTED PDF LINES:", allLines);

      setStatus(
        `Extracted ${allLines.length} lines. Check console (F12) to inspect text.`,
      );

      // Temporary: send all lines as a single block or modify based on what you see
      const inventoryBlocks: string[] = [];
      let currentBlock: string[] = [];

      for (const line of allLines) {
        // If line matches your SKU format indicator (e.g., alphanumeric codes starting with letters)
        const isNewSku = /^[A-Z]+\d+/.test(line);

        if (isNewSku && currentBlock.length > 0) {
          inventoryBlocks.push(currentBlock.join("\n"));
          currentBlock = [line];
        } else {
          currentBlock.push(line);
        }
      }
      if (currentBlock.length > 0) {
        inventoryBlocks.push(currentBlock.join("\n"));
      }

      const result = await ImportInventoryRowsAction(tenantId, inventoryBlocks);

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
      e.target.value = "";
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #334155",
        borderRadius: "8px",
        maxWidth: "450px",
        backgroundColor: "#0b0f19",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Import Inventory PDF
      </h3>
      <label
        style={{
          cursor: loading ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 500,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Processing..." : "Choose PDF File"}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={loading}
          style={{ display: "none" }}
        />
      </label>
      {status && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14px",
            color: "#38bdf8",
            wordBreak: "break-word",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
