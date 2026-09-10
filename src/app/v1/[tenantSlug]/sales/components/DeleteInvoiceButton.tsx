"use client";

import { deleteInvoiceAction } from "@/app/actions/sales";
import { useState } from "react";

interface DeleteInvoiceButtonProps {
  invoiceId: string;
  tenantId: string;
  tenantSlug: string;
}

export default function DeleteInvoiceButton({
  invoiceId,
  tenantId,
  tenantSlug,
}: DeleteInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteInvoiceAction({
      invoiceId: invoiceId,
      tenantId: tenantId,
      tenantSlug: tenantSlug,
    });

    if (result?.error) {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={styles.deleteBtn}
      title="Delete Invoice (Admin Only)"
    >
      {loading ? "Loading ..." : "🗑️ Delete"}
    </button>
  );
}

const styles = {
  deleteBtn: {
    marginLeft: "10px",
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #334155",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
