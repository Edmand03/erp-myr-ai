"use client";

import { useState } from "react";

interface ModalTriggerProps {
  buttonText: string;
  buttonStyle: React.CSSProperties;
  modalTitle: string;
  modalSubtitle: string;
  icon: string;
  children: React.ReactNode;
}

export default function ModalTrigger({
  buttonText,
  buttonStyle,
  modalTitle,
  modalSubtitle,
  icon,
  children,
}: ModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={buttonStyle}>
        {buttonText}
      </button>

      {isOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modalContainer}>
            <div style={modalStyles.modalHeader}>
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div style={modalStyles.iconBox}>{icon}</div>
                <div>
                  <h2 style={modalStyles.cardTitle}>{modalTitle}</h2>
                  <p style={modalStyles.cardSubtitle}>{modalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={modalStyles.closeBtn}
              >
                ✕
              </button>
            </div>
            <div style={modalStyles.modalBody}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

const modalStyles = {
  // 💡 This overlay forces the modal to center perfectly both vertically and horizontally
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(3, 7, 18, 0.8)",
    backdropFilter: "blur(6px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center", // Vertical center
    justifyContent: "center", // Horizontal center
    padding: "20px",
  },
  modalContainer: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 28px",
    borderBottom: "1px solid #1e293b",
  },
  iconBox: {
    width: "42px",
    height: "42px",
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: "3px 0 0 0",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px",
    transition: "color 0.2s",
  },
  modalBody: {
    padding: "28px",
  },
};
