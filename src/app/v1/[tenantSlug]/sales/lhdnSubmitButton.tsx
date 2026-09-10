"use client";

import { useTransition } from "react";
import { submitToLhdnMocks } from "./lhdnActions";

interface Props {
  invoiceId: string;
  totalAmount: number;
  buyerTin: string | null;
}

export default function LhdnSubmitButton({
  invoiceId,
  totalAmount,
  buyerTin,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleLhdnSubmit = () => {
    // 2026 Guardrail Check
    if (totalAmount >= 10000 && (!buyerTin || buyerTin.trim() === "")) {
      alert(
        "⚠️ LHDN Block: Real-time 2026 mandates reject transactions ≥ RM10,000 without a designated Buyer TIN.",
      );
      return;
    }

    startTransition(async () => {
      const res = await submitToLhdnMocks(invoiceId);
      if (res.success) {
        alert(`✅ LHDN Validated!\nUUID Assigned: ${res.uuid}`);
      } else {
        alert(`❌ Validation Error: ${res.error}`);
      }
    });
  };

  return (
    <button onClick={handleLhdnSubmit} disabled={isPending} style={styles.btn}>
      {isPending ? "Validating..." : "🚀 Submit LHDN"}
    </button>
  );
}

const styles = {
  btn: {
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
};
