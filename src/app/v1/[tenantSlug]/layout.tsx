import Link from "next/link";
import React from "react";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenantSlug } = await params;

  const navItems = [
    { name: "Dashboard", href: `/v1/${tenantSlug}/dashboard`, icon: "📊" },
    { name: "Inventory", href: `/v1/${tenantSlug}/inventory`, icon: "📦" },
    { name: "Sales", href: `/v1/${tenantSlug}/sales`, icon: "🧾" },
    { name: "Procurement", href: `/v1/${tenantSlug}/procurement`, icon: "🏗️" },
    { name: "Customers", href: `/v1/${tenantSlug}/customers`, icon: "👥" },
  ];

  return (
    <div style={styles.layoutContainer}>
      <style>{`
        @media (max-width: 768px) {
          .app-sidebar {
            display: none !important; /* Hides sidebar on mobile; change to a mobile header if preferred */
          }
          .app-main {
            width: 100% !important;
            padding: 12px !important;
          }
        }
      `}</style>

      <aside className="app-sidebar" style={styles.sidebar}>
        <div style={styles.logo}>SaaS ERP</div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} style={styles.navLink}>
              <span style={styles.icon}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-main" style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  layoutContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#020617",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  sidebar: {
    width: "260px",
    minWidth: "260px",
    backgroundColor: "#0f172a",
    borderRight: "1px solid #1e293b",
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column" as const,
  },
  logo: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#38bdf8",
    marginBottom: "48px",
    letterSpacing: "-0.5px",
  },
  nav: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    color: "#94a3b8",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
  },
  icon: { fontSize: "18px" },
  mainContent: {
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: "#020617",
  },
};
