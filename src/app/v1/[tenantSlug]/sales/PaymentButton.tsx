"use client";
import { initiateHitPayPayment } from "@/app/actions/hitpay";

export default function PaymentButton({
  invoiceId,
  slug,
}: {
  invoiceId: string;
  slug: string;
}) {
  return (
    <button
      onClick={async () => {
        const res = await initiateHitPayPayment(invoiceId, slug);
        if (res.success) window.location.href = res.url;
        else alert(res.error);
      }}
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
      💳 Pay via HitPay
    </button>
  );
}
