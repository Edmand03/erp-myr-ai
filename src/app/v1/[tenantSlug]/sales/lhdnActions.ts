"use server";

import { db } from "@/lib/prisma";
import crypto from "crypto";

export async function submitToLhdnMocks(invoiceId: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new Error("Invoice not found");

    // Handle your model's exact total field name dynamically
    // @ts-ignore
    const grandTotal = Number(invoice.totalAmount ?? invoice.total ?? 0);

    // @ts-ignore
    const buyerTin = invoice.buyerTin || "";

    // 2026 LHDN Mandate Guardrail:
    if (grandTotal >= 10000 && (!buyerTin || buyerTin.trim() === "")) {
      return {
        success: false,
        error:
          "LHDN Validation Error: Transactions of RM 10,000 and above must have a valid Buyer TIN.",
      };
    }

    // Generate a secure, mock LHDN Unique Identifier Number (UUID)
    const mockUuid = `LHDN-2026-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    // Update state safely
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        // @ts-ignore (Bypasses compilation if the client hasn't regenerated yet)
        lhdnUuid: mockUuid,
        // @ts-ignore
        lhdnStatus: "VALIDATED",
      },
    });

    return {
      success: true,
      uuid: mockUuid,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unknown error during LHDN validation",
    };
  }
}
