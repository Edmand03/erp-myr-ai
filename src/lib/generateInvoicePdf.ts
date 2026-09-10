import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateInvoicePdf(invoice: any, tenantName: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Header & Branding ---
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text(tenantName, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Gray subtitle
  doc.text("TAX INVOICE", 14, 26);

  // Invoice Meta (Right side)
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 200, 20, { align: "right" });
  doc.text(
    `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`,
    200,
    26,
    { align: "right" },
  );

  if (invoice.lhdnUuid) {
    doc.setTextColor(16, 185, 129); // Green for validated
    doc.text(`LHDN Validated ✓`, 200, 32, { align: "right" });
  }

  // --- Customer Details Box ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 182, 24, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("BILLED TO:", 18, 42);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoice.customerName}`, 18, 49);

  if (invoice.buyerTin) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`TIN: ${invoice.buyerTin}`, 18, 55);
  }

  // --- Map Items for AutoTable ---
  const tableRows = invoice.invoiceItems.map((item: any, index: number) => {
    const itemName = item.product
      ? item.product.name
      : item.description || "Custom Charge";
    const qty = item.quantity;
    const unitPrice = Number(item.unitPrice || 0);
    const lineTotal = qty * unitPrice;

    return [
      index + 1,
      itemName,
      qty,
      `RM ${unitPrice.toFixed(2)}`,
      `RM ${lineTotal.toFixed(2)}`,
    ];
  });

  // --- Render Table using explicit autoTable import function ---
  autoTable(doc, {
    startY: 65,
    head: [["#", "Item Description / Product", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: { textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 92 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    theme: "striped",
  });

  // --- Totals Section ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const sstAmount = Number(invoice.sstAmount || 0);
  const totalAmount = Number(invoice.total || 0);
  const subTotal = totalAmount - sstAmount;

  const rightMargin = 196;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);

  doc.text("Subtotal:", 135, finalY);
  doc.text(`RM ${subTotal.toFixed(2)}`, rightMargin, finalY, {
    align: "right",
  });

  doc.text("SST (Service Tax):", 135, finalY + 6);
  doc.text(`RM ${sstAmount.toFixed(2)}`, rightMargin, finalY + 6, {
    align: "right",
  });

  // Grand Total Box Line
  doc.setDrawColor(203, 213, 225);
  doc.line(135, finalY + 10, rightMargin, finalY + 10);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Due:", 135, finalY + 17);
  doc.text(`RM ${totalAmount.toFixed(2)}`, rightMargin, finalY + 17, {
    align: "right",
  });

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is a computer-generated invoice. No signature is required.",
    14,
    285,
  );

  // Save PDF file to client machine
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}
