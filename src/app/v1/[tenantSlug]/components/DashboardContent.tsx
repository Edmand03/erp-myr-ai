import { getUserTenantRole, auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AgingService } from "@/service/aging.service";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardContent({
  tenantId,
  tenantSlug,
}: {
  tenantId: string;
  tenantSlug: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const authCheck = await getUserTenantRole(session.user.id, tenantId);
  // Fetch heavy data lazily
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    include: {
      products: true,
      customers: true,
      invoices: {
        include: { invoiceItems: true, customer: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      purchaseOrders: {
        include: { poItems: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!tenant) return null;

  // Fetch AR Aging breakdown
  const aging = await AgingService.getTenantAgingSummary(tenant.id);

  const totalRevenue = tenant.invoices.reduce(
    //@ts-ignore
    (sum, inv) => sum + Number(inv.totalAmount || inv.total || 0),
    0,
  );

  const totalCost = tenant.purchaseOrders.reduce(
    //@ts-ignore
    (sum, po) => sum + Number(po.totalCost || po.totalAmount || 0),
    0,
  );

  const netProfit = totalRevenue - totalCost;
  const healthScore = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <>
      {/* KPI Row */}
      <div style={styles.kpiGrid}>
        {[
          {
            label: "Total Revenue",
            val: `RM ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: "#34d399",
            icon: "📈",
            sub: "Invoiced earnings",
          },
          {
            label: "Operating Cost",
            val: `RM ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: "#fb7185",
            icon: "📉",
            sub: "Procurement expenses",
          },
          {
            label: "Net Profitability",
            val: `${healthScore.toFixed(1)}%`,
            color: healthScore >= 0 ? "#38bdf8" : "#fb7185",
            icon: "⚡",
            sub: `RM ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} net`,
          },
          {
            label: "Total Overdue AR",
            val: `RM ${aging.totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: "#f59e0b",
            icon: "⚠️",
            sub: `${aging.days60Plus > 0 ? "Critical 60+ days risk" : "Pending collections"}`,
          },
        ].map((kpi, i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>{kpi.label}</span>
              <span style={styles.kpiIcon}>{kpi.icon}</span>
            </div>
            <span style={{ ...styles.kpiVal, color: kpi.color }}>
              {kpi.val}
            </span>
            <span style={styles.kpiSub}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* New AR Aging Risk Summary Widget */}
      <div style={styles.agingBanner}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              margin: 0,
              color: "#f8fafc",
            }}
          >
            Accounts Receivable (AR) Aging Breakdown
          </h3>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Live Risk Assessment
          </span>
        </div>
        <div style={styles.agingGrid}>
          <div style={styles.agingBucket}>
            <span style={styles.bucketLabel}>Current / Not Due</span>
            <span style={{ ...styles.bucketVal, color: "#34d399" }}>
              RM {aging.current.toFixed(2)}
            </span>
          </div>
          <div style={styles.agingBucket}>
            <span style={styles.bucketLabel}>1–30 Days Overdue</span>
            <span style={{ ...styles.bucketVal, color: "#38bdf8" }}>
              RM {aging.days1_30.toFixed(2)}
            </span>
          </div>
          <div style={styles.agingBucket}>
            <span style={styles.bucketLabel}>31–60 Days Overdue</span>
            <span style={{ ...styles.bucketVal, color: "#f59e0b" }}>
              RM {aging.days31_60.toFixed(2)}
            </span>
          </div>
          <div style={styles.agingBucket}>
            <span style={styles.bucketLabel}>60+ Days Overdue</span>
            <span style={{ ...styles.bucketVal, color: "#fb7185" }}>
              RM {aging.days60Plus.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Grid */}
      <div style={styles.mainGrid}>
        {/* <div>
          <h1>Customer Management</h1>
          <ClientPdfImporter tenantId="4942f81e-61bc-4c95-bb1f-eb390c1b349f" />
        </div> */}
        {/* Left Column: Quick Operations */}
        <div style={styles.col}>
          <div style={styles.sectionHeaderWrapper}>
            <h2 style={styles.sectionHeader}>Quick Operations</h2>
            <span style={styles.sectionSub}>Core ERP Modules</span>
          </div>

          <div style={styles.actionGrid}>
            {[
              {
                l: "Sales Management",
                d: "Create and dispatch professional client invoices",
                h: "sales",
                icon: "🧾",
                tag: "Billing",
              },
              {
                l: "Warehouse Inventory",
                d: "Manage stock levels, valuations & catalog items",
                h: "inventory",
                icon: "📦",
                tag: "Catalog",
              },
              {
                l: "Procurement",
                d: "Track purchase orders & supplier restocking",
                h: "procurement",
                icon: "🛒",
                tag: "Supply",
              },
              {
                l: "Customer Directory",
                d: "Maintain client profiles & collection ledgers",
                h: "customers",
                icon: "👥",
                tag: "CRM",
              },
            ].map((m) => (
              <Link
                key={m.l}
                href={`/v1/${tenantSlug}/${m.h}`}
                style={styles.moduleCard}
              >
                <div style={styles.moduleTop}>
                  <div style={styles.modIconBox}>{m.icon}</div>
                  <span style={styles.modTag}>{m.tag}</span>
                </div>
                <div>
                  <div style={styles.modLabel}>{m.l}</div>
                  <div style={styles.modDesc}>{m.d}</div>
                </div>
                <div style={styles.modFooter}>
                  <span>Launch module</span>
                  <span style={styles.modArrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div style={styles.col}>
          <div style={styles.sectionHeaderWrapper}>
            <h2 style={styles.sectionHeader}>Recent Activity Logs</h2>
            <span style={styles.sectionSub}>Live ledger stream</span>
          </div>

          <div style={styles.logCard}>
            {tenant.invoices.length === 0 &&
            tenant.purchaseOrders.length === 0 ? (
              <div style={styles.emptyLogs}>
                <span style={styles.emptyIcon}>⏳</span>
                <div style={styles.emptyTitle}>No Activity Yet</div>
                <div style={styles.emptyDesc}>
                  Transactions will appear here in real-time.
                </div>
              </div>
            ) : (
              <div style={styles.logList}>
                {tenant.invoices.map((inv) => {
                  const balanceDue =
                    //@ts-ignore
                    Number(inv.total || inv.totalAmount || 0) -
                    Number(inv.amountPaid || 0);
                  const isFullyPaid = balanceDue <= 0;

                  return (
                    <div key={inv.id} style={styles.logRow}>
                      <div style={styles.logMain}>
                        <div style={styles.logTitleWrapper}>
                          <span style={styles.logBadgeSales}>Invoice</span>
                          <span style={styles.logTitle}>
                            #{inv.id.slice(-6).toUpperCase()}
                          </span>
                          {!isFullyPaid && (
                            <span style={styles.dueBadge}>
                              Due: RM {balanceDue.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div style={styles.logMeta}>
                          {inv.customer?.name || "Client"} •{" "}
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div style={styles.logAmountSales}>
                          +RM{" "}
                          {Number(
                            //@ts-ignore
                            inv.totalAmount || inv.total || 0,
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        {!isFullyPaid && (
                          <Link
                            href={`/v1/${tenantSlug}/ar/customers/${inv.customerId}/dashboard`}
                            style={styles.quickPayBtn}
                          >
                            Collect
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tenant.purchaseOrders.map((po) => (
                  <div key={po.id} style={styles.logRow}>
                    <div style={styles.logMain}>
                      <div style={styles.logTitleWrapper}>
                        <span style={styles.logBadgePO}>Procurement</span>
                        <span style={styles.logTitle}>
                          #{po.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div style={styles.logMeta}>
                        {po.poItems?.length || 0} items restocked •{" "}
                        {new Date(po.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={styles.logAmountPO}>
                      -RM{" "}
                      {Number(
                        //@ts-ignore
                        po.totalCost || po.totalAmount || 0,
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Styles object remains identical
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

  kpiGrid: {
    display: "grid",

    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",

    gap: "20px",

    marginBottom: "24px",
  },

  kpiCard: {
    background: "#0b0f19",

    padding: "24px",

    borderRadius: "16px",

    border: "1px solid #1e293b",

    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",

    display: "flex",

    flexDirection: "column" as const,

    gap: "8px",
  },

  kpiHeader: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",
  },

  kpiLabel: {
    fontSize: "12px",

    color: "#94a3b8",

    textTransform: "uppercase" as const,

    fontWeight: 700,

    letterSpacing: "0.5px",
  },

  kpiIcon: { fontSize: "16px" },

  kpiVal: {
    display: "block",

    fontSize: "26px",

    fontWeight: 800,

    letterSpacing: "-0.5px",

    margin: "4px 0 0 0",
  },

  kpiSub: { fontSize: "12px", color: "#64748b" },

  agingBanner: {
    background: "#0b0f19",

    border: "1px solid #1e293b",

    borderRadius: "16px",

    padding: "20px 24px",

    marginBottom: "30px",

    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
  },

  agingGrid: {
    display: "grid",

    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",

    gap: "16px",
  },

  agingBucket: {
    background: "#030712",

    border: "1px solid #1e293b",

    padding: "14px",

    borderRadius: "10px",

    display: "flex",

    flexDirection: "column" as const,

    gap: "4px",
  },

  bucketLabel: {
    fontSize: "11px",

    color: "#94a3b8",

    fontWeight: 600,

    textTransform: "uppercase" as const,
  },

  bucketVal: { fontSize: "18px", fontWeight: 700, fontFamily: "monospace" },

  mainGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" },

  col: { display: "flex", flexDirection: "column" as const, gap: "16px" },

  sectionHeaderWrapper: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "baseline",
  },

  sectionHeader: {
    fontSize: "18px",

    fontWeight: 700,

    margin: 0,

    color: "#f8fafc",

    letterSpacing: "-0.3px",
  },

  sectionSub: { fontSize: "12px", color: "#64748b" },

  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },

  moduleCard: {
    display: "flex",

    flexDirection: "column" as const,

    justifyContent: "space-between",

    background: "#0b0f19",

    padding: "20px",

    borderRadius: "16px",

    border: "1px solid #1e293b",

    textDecoration: "none",

    color: "#f8fafc",

    cursor: "pointer",

    transition: "all 0.2s ease",

    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",

    minHeight: "180px",
  },

  moduleTop: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  modIconBox: {
    width: "40px",

    height: "40px",

    backgroundColor: "#111827",

    border: "1px solid #334155",

    borderRadius: "10px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "18px",
  },

  modTag: {
    fontSize: "11px",

    backgroundColor: "#1e293b",

    color: "#94a3b8",

    padding: "2px 8px",

    borderRadius: "6px",

    fontWeight: 500,
  },

  modLabel: {
    fontWeight: 700,

    fontSize: "15px",

    marginTop: "16px",

    marginBottom: "4px",

    color: "#ffffff",
  },

  modDesc: { fontSize: "12px", color: "#64748b", lineHeight: "1.4" },

  modFooter: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    borderTop: "1px solid #1e293b",

    paddingTop: "12px",

    marginTop: "16px",

    fontSize: "12px",

    fontWeight: 600,

    color: "#38bdf8",
  },

  modArrow: { fontSize: "14px" },

  logCard: {
    background: "#0b0f19",

    borderRadius: "16px",

    border: "1px solid #1e293b",

    padding: "8px",

    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",

    minHeight: "392px",

    display: "flex",

    flexDirection: "column" as const,
  },

  logList: { display: "flex", flexDirection: "column" as const },

  logRow: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    padding: "16px",

    borderBottom: "1px solid #1e293b",
  },

  logMain: { display: "flex", flexDirection: "column" as const, gap: "4px" },

  logTitleWrapper: { display: "flex", alignItems: "center", gap: "8px" },

  logBadgeSales: {
    fontSize: "10px",

    backgroundColor: "rgba(16, 185, 129, 0.1)",

    color: "#34d399",

    padding: "1px 6px",

    borderRadius: "4px",

    fontWeight: 700,

    border: "1px solid rgba(16, 185, 129, 0.2)",
  },

  logBadgePO: {
    fontSize: "10px",

    backgroundColor: "rgba(244, 63, 94, 0.1)",

    color: "#fb7185",

    padding: "1px 6px",

    borderRadius: "4px",

    fontWeight: 700,

    border: "1px solid rgba(244, 63, 94, 0.2)",
  },

  logTitle: {
    fontWeight: 700,

    fontSize: "14px",

    color: "#f8fafc",

    fontFamily: "monospace",
  },

  logMeta: { fontSize: "11px", color: "#64748b" },

  logAmountSales: {
    fontWeight: 800,

    fontSize: "14px",

    fontFamily: "monospace",

    color: "#34d399",
  },

  logAmountPO: {
    fontWeight: 800,

    fontSize: "14px",

    fontFamily: "monospace",

    color: "#fb7185",
  },

  emptyLogs: {
    flex: 1,

    display: "flex",

    flexDirection: "column" as const,

    alignItems: "center",

    justifyContent: "center",

    padding: "60px 20px",

    textAlign: "center" as const,
  },

  emptyIcon: { fontSize: "36px", marginBottom: "12px" },

  emptyTitle: {
    fontSize: "15px",

    fontWeight: 700,

    color: "#f1f5f9",

    marginBottom: "4px",
  },

  emptyDesc: {
    fontSize: "13px",

    color: "#64748b",

    maxWidth: "280px",

    lineHeight: "1.4",
  },

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

  dueBadge: {
    fontSize: "10px",

    backgroundColor: "rgba(245, 158, 11, 0.1)",

    color: "#f59e0b",

    padding: "1px 6px",

    borderRadius: "4px",

    fontWeight: 600,

    border: "1px solid rgba(245, 158, 11, 0.2)",
  },

  quickPayBtn: {
    backgroundColor: "#10b981",

    color: "#ffffff",

    padding: "4px 10px",

    borderRadius: "6px",

    fontSize: "11px",

    fontWeight: 600,

    textDecoration: "none",
  },
};
