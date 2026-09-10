"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const pathname = usePathname();
  //@ts-ignore
  const resolvedParams = React.use(params);

  //@ts-ignore
  const tenantSlug = resolvedParams?.tenantSlug;

  const navItems = [
    { name: "Dashboard", href: `/v1/${tenantSlug}/dashboard`, icon: "📊" },
    { name: "Inventory", href: `/v1/${tenantSlug}/inventory`, icon: "📦" },
    { name: "Sales", href: `/v1/${tenantSlug}/sales`, icon: "🧾" },
    { name: "Procurement", href: `/v1/${tenantSlug}/procurement`, icon: "🏗️" },
    { name: "Customers", href: `/v1/${tenantSlug}/customers`, icon: "👥" },
  ];

  return (
    <div style={styles.layoutContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>SaaS ERP</div>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

const styles = {
  layoutContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#020617",
  },
  sidebar: {
    width: "260px",
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
    transition: "all 0.2s ease",
  },
  navLinkActive: {
    backgroundColor: "#3b82f6", // Vibrant Blue
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  icon: { fontSize: "18px" },
  mainContent: {
    flexGrow: 1,
    padding: "0", // Let your pages handle their own padding
    backgroundColor: "#020617",
  },
};
