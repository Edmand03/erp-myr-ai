import Link from "next/link";

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconBox}>⚡</div>
        <h1 style={styles.title}>Enterprise ERP System</h1>
        <p style={styles.subtitle}>
          Local-First Operations, Billing, & Inventory Management
        </p>

        <div style={styles.actionGroup}>
          <Link href="/dashboard-redirect" style={styles.primaryBtn}>
            Launch ERP Dashboard →
          </Link>
          <Link href="/login" style={styles.secondaryBtn}>
            System Login
          </Link>
        </div>

        <div style={styles.footerNote}>
          <span style={styles.statusDot}>●</span> Secure Local Node Active
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#f8fafc",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "440px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7)",
  },
  iconBox: {
    width: "56px",
    height: "56px",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "0 0 32px 0",
    lineHeight: "1.5",
  },
  actionGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    width: "100%",
  },
  primaryBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(56, 189, 248, 0.25)",
    transition: "all 0.2s ease",
  },
  secondaryBtn: {
    backgroundColor: "#111827",
    color: "#e2e8f0",
    border: "1px solid #334155",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  footerNote: {
    marginTop: "32px",
    fontSize: "12px",
    color: "#34d399",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 500,
  },
  statusDot: {
    fontSize: "8px",
  },
};
