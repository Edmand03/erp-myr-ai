import { db } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ProductCatalog } from "./ProductCatalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  const tenant = await db.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { products: { orderBy: { name: "asc" } } },
  });

  if (!tenant) return <div>Tenant not found</div>;

  return (
    <div style={styles.container}>
      {/* 1. Header (Mirrors your Inventory page) */}
      <header style={styles.navbar}>
        <div>
          <Link href={`/v1/${tenantSlug}/dashboard`} style={styles.backLink}>
            ← Return to ERP Hub
          </Link>
          <h1 style={styles.title}>{tenant.name} Product Catalog</h1>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* 2. Quick Actions */}
        <div style={styles.quickActionsBar}>
          <Link
            href={`/v1/${tenantSlug}/inventory`}
            style={styles.primaryActionBtn}
          >
            📦 View Warehouse Stock
          </Link>
        </div>

        {/* 3. Catalog Table */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "16px", color: "#fff" }}>Catalog</h3>
          <ProductCatalog initialProducts={tenant.products} />
        </div>
      </main>
    </div>
  );
}

// Reuse the same style constant object from your Inventory page
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#09090b",
    color: "#f4f4f5",
    fontFamily: "sans-serif",
  },
  navbar: {
    display: "flex",
    padding: "24px 40px",
    backgroundColor: "#18181b",
    borderBottom: "1px solid #27272a",
  },
  backLink: { color: "#71717a", textDecoration: "none", fontSize: "13px" },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    margin: "6px 0 0 0",
    color: "#fff",
  },
  mainContent: { padding: "40px", maxWidth: "1200px", margin: "0 auto" },
  quickActionsBar: { display: "flex", gap: "12px", marginBottom: "24px" },
  primaryActionBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  secondaryActionBtn: {
    backgroundColor: "transparent",
    color: "#f4f4f5",
    border: "1px solid #27272a",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "8px",
    padding: "24px",
  },
  table: { width: "100%", borderCollapse: "collapse" as const },
  thRow: { backgroundColor: "#27272a" },
  cellHead: {
    padding: "14px 20px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#a1a1aa",
    textAlign: "left" as const,
  },
  trRow: { borderBottom: "1px solid #27272a" },
  cellBody: { padding: "16px 20px", fontSize: "14px" },
};
