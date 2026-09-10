"use client";
import { useState } from "react";

export default function DuitNowQrButton({
  invoiceId,
  invoiceNumber,
  totalAmount,
  onGenerate,
}: {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  onGenerate: (id: string) => Promise<any>;
}) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    qrUrl: string;
    checkoutUrl: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenQr = async () => {
    setLoading(true);
    const res = await onGenerate(invoiceId);
    setLoading(false);
    if (res.success) {
      setQrData({ qrUrl: res.qrUrl, checkoutUrl: res.checkoutUrl });
      setIsOpen(true);
    } else {
      alert(res.error || "Failed to generate QR code.");
    }
  };

  return (
    <>
      <button
        onClick={handleOpenQr}
        disabled={loading}
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
        {loading ? "Generating..." : "⚡ DuitNow QR"}
      </button>

      {isOpen && qrData && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#f8fafc",
                fontSize: "16px",
              }}
            >
              Scan to Pay ({invoiceNumber})
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Amount Due:{" "}
              <strong style={{ color: "#34d399" }}>
                RM {totalAmount.toFixed(2)}
              </strong>
            </p>

            <div style={modalStyles.qrBox}>
              <img
                //@ts-ignore
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData.qrString)}`}
                alt="DuitNow QR Code"
                style={{
                  width: "220px",
                  height: "220px",
                  display: "block",
                  borderRadius: "8px",
                }}
              />
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                margin: "12px 0 20px 0",
              }}
            >
              Supports all Malaysian banking apps (MAE, CIMB Clicks, DuitNow QR
              apps, etc.)
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <a
                href={qrData.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                style={modalStyles.linkBtn}
              >
                Open Web Checkout ↗
              </a>
              <button
                onClick={() => setIsOpen(false)}
                style={modalStyles.closeBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    width: "340px",
    textAlign: "center" as const,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  qrBox: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "12px",
    display: "inline-block",
  },
  closeBtn: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  linkBtn: {
    backgroundColor: "#0ea5e9",
    color: "#0f172a",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
  },
};
