//@ts-nocheck

import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));
  const signature = req.headers.get("X-SIGNATURE");

  // Verify HMAC Signature to ensure it's from HitPay
  const computed = crypto
    .createHmac("sha256", process.env.HITPAY_SALT!)
    .update(
      Object.keys(params)
        .sort()
        .filter((k) => k !== "signature")
        .map((k) => `${k}${params[k]}`)
        .join(""),
    )
    .digest("hex");

  if (computed !== signature)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (params.status === "completed") {
    await db.invoice.update({
      where: { invoiceNumber: params.reference_number },
      data: { status: "PAID" },
    });
  }
  return NextResponse.json({ received: true });
}
