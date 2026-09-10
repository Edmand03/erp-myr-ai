"use server";

import crypto from "crypto";
import { db } from "@/lib/prisma";

const HITPAY_API_KEY = process.env.HITPAY_API_KEY!;
const HITPAY_SALT = process.env.HITPAY_SALT!;
const HITPAY_URL =
  process.env.HITPAY_PRODUCTION === "true"
    ? "https://api.hit-pay.com/v1/payment-requests"
    : "https://api.sandbox.hit-pay.com/v1/payment-requests";

export async function initiateHitPayPayment(invoiceId: string, slug: string) {
  try {
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error("Invoice not found");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // 1. Core payload only
    const payload: Record<string, any> = {
      amount: Number(invoice.total).toFixed(2),
      currency: "MYR",
      email: invoice.customerEmail || "customer@example.com",
      name: invoice.customerName || "Customer",
      reference_number: invoice.invoiceNumber
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 20),
      redirect_url: `${baseUrl}/v1/${slug}/sales?payment=success&invoiceId=${invoiceId}`,
      webhook: `${baseUrl}/api/webhooks/hitpay`,
    };

    // 2. Signature: DO NOT include payment_methods here
    const signature = crypto
      .createHmac("sha256", HITPAY_SALT)
      .update(
        Object.keys(payload)
          .sort()
          .map((k) => `${k}${payload[k]}`)
          .join(""),
      )
      .digest("hex");

    // 3. Form Data: DO NOT append payment_methods[]
    const params = new URLSearchParams(payload);

    const response = await fetch(HITPAY_URL, {
      method: "POST",
      headers: {
        "X-BUSINESS-API-KEY": HITPAY_API_KEY,
        "X-SIGNATURE": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("DEBUG_HITPAY_RESPONSE:", data);
      throw new Error(data.message || "Payment init failed");
    }
    return { success: true, url: data.url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
