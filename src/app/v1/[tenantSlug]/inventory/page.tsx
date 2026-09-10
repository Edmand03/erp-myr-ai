import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import InventoryContent from "../components/InventoryContent";
import InventorySkeleton from "../components/lazyloading/SkeletalInventory";
import ClientPdfInventoryImporter from "../components/ClientPdfInventoryImporter";

export const dynamic = "force-dynamic";

interface InventoryProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function InventoryPage({ params }: InventoryProps) {
  const { tenantSlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  // Lightweight authorization check only (fast)
  const accessCheck = await db.tenantMember.findFirst({
    where: { userId: session.user.id, tenant: { slug: tenantSlug } },
    include: {
      tenant: {
        select: { id: true, name: true },
      },
    },
  });

  if (!accessCheck) redirect("/dashboard-redirect");
  const tenant = accessCheck.tenant;

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navLeft}>
            <Link href={`/v1/${tenantSlug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span> Return to ERP Hub
            </Link>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title}>
                {tenant.name} Warehouse & Stock Control
              </h1>
              <span style={styles.badgeSub}>Inventory Operations</span>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        <ClientPdfInventoryImporter tenantId={tenant.id} />
        {/* Lazy Loaded Dynamic Inventory Stream */}
        <Suspense fallback={<InventorySkeleton />}>
          <InventoryContent tenantId={tenant.id} tenantSlug={tenantSlug} />
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
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  navbar: {
    backgroundColor: "#0b0f19",
    borderBottom: "1px solid #1e293b",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(8px)",
  },
  navContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "20px",
  },
  navLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  backArrow: { fontSize: "14px" },
  titleWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.5px",
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
  mainContent: {
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "32px",
  },
};
