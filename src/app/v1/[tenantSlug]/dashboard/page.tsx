import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import DashboardContent from "../components/DashboardContent";
import DashboardSkeleton from "../components/lazyloading/SkeletalDashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const accessCheck = await db.tenantMember.findFirst({
    where: { userId: session.user.id, tenant: { slug: tenantSlug } },
    include: {
      tenant: { select: { id: true, name: true } },
    },
  });

  if (!accessCheck) redirect("/dashboard-redirect");

  const { tenant } = accessCheck;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.titleRow}>
            <h1 style={styles.pageTitle}>{tenant.name}</h1>
            <span style={styles.badgeSub}>Enterprise ERP Hub</span>
          </div>
          <p style={styles.pageSubtitle}>
            Real-time Operations & Financial Overview
          </p>
        </div>
        <div style={styles.topActions}>
          <Link
            href={`/v1/${tenantSlug}/sales`}
            style={styles.primaryActionBtn}
          >
            + Create Invoice
          </Link>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}>●</span> System Online
          </div>
          <div style={styles.userProfile}>
            <div style={styles.userAvatar}>
              {session.user.name
                ? session.user.name.charAt(0).toUpperCase()
                : "U"}
            </div>
            <span>{session.user.name}</span>
          </div>
        </div>
      </header>

      <main style={styles.content}>
        {/* Lazy Loaded Dynamic Content Stream */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent tenantId={tenant.id} tenantSlug={tenantSlug} />
        </Suspense>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#030712",
    color: "#f8fafc",
    padding: "40px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    maxWidth: "1400px",
    marginInline: "auto",
    flexWrap: "wrap" as const,
    gap: "24px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "24px",
  },
  headerLeft: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  titleRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.5px",
    color: "#ffffff",
  },
  badgeSub: {
    fontSize: "12px",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "2px 8px",
    borderRadius: "6px",
    fontWeight: 500,
    border: "1px solid #334155",
  },
  pageSubtitle: { color: "#64748b", margin: 0, fontSize: "14px" },
  topActions: { display: "flex", gap: "12px", alignItems: "center" },
  statusBadge: {
    padding: "6px 14px",
    background: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    fontSize: "12px",
    borderRadius: "20px",
    fontWeight: 600,
    border: "1px solid rgba(16, 185, 129, 0.25)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statusDot: { fontSize: "10px" },
  userProfile: {
    padding: "6px 14px 6px 6px",
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "24px",
    fontWeight: 600,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#e2e8f0",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
  },
  content: { maxWidth: "1400px", margin: "0 auto" },
  primaryActionBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
    transition: "all 0.2s ease",
  },
};
