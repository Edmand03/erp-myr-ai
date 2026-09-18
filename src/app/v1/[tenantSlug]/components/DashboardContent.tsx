import { getUserTenantRole, auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AgingService } from "@/service/aging.service";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type DashboardContentProps = {
  tenantId: string;
  tenantSlug: string;
};

type Activity = {
  id: string;
  type: "invoice" | "purchase";
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
  href?: string;
  status?: "paid" | "outstanding";
};

export default async function DashboardContent({
  tenantId,
  tenantSlug,
}: DashboardContentProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const authCheck = await getUserTenantRole(session.user.id, tenantId);

  if (!authCheck) {
    redirect("/dashboard-redirect");
  }

  const tenant = await db.tenant.findUnique({
    where: {
      id: tenantId,
    },
    include: {
      products: true,
      customers: true,

      invoices: {
        include: {
          invoiceItems: true,
          customer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },

      purchaseOrders: {
        include: {
          poItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!tenant) {
    return null;
  }

  const aging = await AgingService.getTenantAgingSummary(tenant.id);

  /*
   * ─────────────────────────────────────────────
   * FINANCIAL METRICS
   * ─────────────────────────────────────────────
   */

  const totalRevenue = tenant.invoices.reduce(
    (sum, invoice) =>
      sum +
      Number(
        // @ts-ignore
        invoice.totalAmount ?? invoice.total ?? 0,
      ),
    0,
  );

  const totalCost = tenant.purchaseOrders.reduce(
    (sum, purchaseOrder) =>
      sum +
      Number(
        // @ts-ignore
        purchaseOrder.totalCost ?? purchaseOrder.totalAmount ?? 0,
      ),
    0,
  );

  const netProfit = totalRevenue - totalCost;

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const outstandingInvoices = tenant.invoices.filter((invoice) => {
    const total =
      // @ts-ignore
      Number(invoice.total ?? invoice.totalAmount ?? 0);

    // @ts-ignore
    const paid = Number(invoice.amountPaid ?? 0);

    return total - paid > 0;
  });

  const collectionRate =
    tenant.invoices.length > 0
      ? ((tenant.invoices.length - outstandingInvoices.length) /
          tenant.invoices.length) *
        100
      : 0;

  /*
   * ─────────────────────────────────────────────
   * ACTIVITY STREAM
   *
   * Unlike the original implementation, invoices
   * and purchase orders are merged and genuinely
   * sorted by creation date.
   * ─────────────────────────────────────────────
   */

  const invoiceActivities: Activity[] = tenant.invoices.map((invoice) => {
    const total =
      // @ts-ignore
      Number(invoice.total ?? invoice.totalAmount ?? 0);

    // @ts-ignore
    const paid = Number(invoice.amountPaid ?? 0);

    const balance = Math.max(total - paid, 0);

    return {
      id: invoice.id,
      type: "invoice",
      title: `Invoice #${invoice.id.slice(-6).toUpperCase()}`,
      description: invoice.customer?.name ?? "Client",
      amount: total,
      createdAt: new Date(invoice.createdAt),
      status: balance <= 0 ? "paid" : "outstanding",
      href:
        balance > 0 && invoice.customerId
          ? `/v1/${tenantSlug}/ar/customers/${invoice.customerId}/dashboard`
          : undefined,
    };
  });

  const purchaseActivities: Activity[] = tenant.purchaseOrders.map(
    (purchaseOrder) => ({
      id: purchaseOrder.id,
      type: "purchase",
      title: `PO #${purchaseOrder.id.slice(-6).toUpperCase()}`,
      description: `${purchaseOrder.poItems?.length ?? 0} items`,
      amount: Number(
        // @ts-ignore
        purchaseOrder.totalCost ?? purchaseOrder.totalAmount ?? 0,
      ),
      createdAt: new Date(purchaseOrder.createdAt),
    }),
  );

  const activities = [...invoiceActivities, ...purchaseActivities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  /*
   * ─────────────────────────────────────────────
   * HELPERS
   * ─────────────────────────────────────────────
   */

  const formatCurrency = (value: number) =>
    `RM ${value.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatRelativeDate = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";

    if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes}m ago`;
    }

    if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours}h ago`;
    }

    if (diff < 7 * day) {
      const days = Math.floor(diff / day);
      return `${days}d ago`;
    }

    return formatDate(date);
  };

  const getHealthState = () => {
    if (totalRevenue <= 0) {
      return {
        label: "Awaiting data",
        description:
          "Create your first transaction to establish a financial baseline.",
        className: "health-neutral",
      };
    }

    if (profitMargin >= 30) {
      return {
        label: "Strong position",
        description:
          "Your current revenue is comfortably ahead of recorded costs.",
        className: "health-positive",
      };
    }

    if (profitMargin >= 0) {
      return {
        label: "Positive position",
        description: "Revenue currently exceeds recorded procurement costs.",
        className: "health-positive",
      };
    }

    return {
      label: "Needs attention",
      description:
        "Recorded procurement costs currently exceed invoiced revenue.",
      className: "health-negative",
    };
  };

  const health = getHealthState();

  /*
   * ─────────────────────────────────────────────
   * RENDER
   * ─────────────────────────────────────────────
   */

  return (
    <section className="dashboard-content">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-content {
          width: 100%;
          color: #f8fafc;
        }

        /*
         * ─────────────────────────────
         * KPI CARDS
         * ─────────────────────────────
         */

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .metric-card {
          position: relative;
          overflow: hidden;

          min-height: 148px;
          padding: 20px;

          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.88),
              rgba(7, 12, 24, 0.92)
            );

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.14),
            inset 0 1px rgba(255, 255, 255, 0.025);

          transition:
            transform 180ms ease,
            border-color 180ms ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(148, 163, 184, 0.22);
        }

        .metric-card::after {
          content: "";

          position: absolute;
          right: -45px;
          bottom: -55px;

          width: 130px;
          height: 130px;

          border-radius: 50%;

          background: var(--metric-glow);

          filter: blur(50px);
          opacity: 0.12;

          pointer-events: none;
        }

        .metric-green {
          --metric-glow: #34d399;
        }

        .metric-red {
          --metric-glow: #fb7185;
        }

        .metric-blue {
          --metric-glow: #38bdf8;
        }

        .metric-amber {
          --metric-glow: #f59e0b;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 15px;
        }

        .metric-label {
          color: #64748b;

          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .metric-symbol {
          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: rgba(148, 163, 184, 0.055);
          border: 1px solid rgba(148, 163, 184, 0.08);

          color: #94a3b8;
          font-size: 12px;
        }

        .metric-value {
          position: relative;
          z-index: 1;

          display: block;

          overflow: hidden;
          text-overflow: ellipsis;

          color: var(--metric-color);

          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;

          font-size: clamp(20px, 2vw, 27px);
          font-weight: 800;
          letter-spacing: -0.04em;

          white-space: nowrap;
        }

        .metric-description {
          display: block;

          margin-top: 7px;

          color: #475569;

          font-size: 11px;
        }

        /*
         * ─────────────────────────────
         * AR OVERVIEW
         * ─────────────────────────────
         */

        .ar-card {
          margin-bottom: 24px;

          padding: 20px;

          border: 1px solid rgba(148, 163, 184, 0.11);
          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.78),
              rgba(7, 12, 24, 0.9)
            );

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .ar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 16px;
        }

        .ar-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .ar-title-mark {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #f59e0b;

          box-shadow:
            0 0 12px rgba(245, 158, 11, 0.7);
        }

        .ar-title h3 {
          margin: 0;

          color: #e2e8f0;

          font-size: 13px;
          font-weight: 750;
        }

        .ar-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          color: #64748b;

          font-size: 10px;
          font-weight: 650;
        }

        .ar-live-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #34d399;
        }

        .ar-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .ar-bucket {
          position: relative;

          min-width: 0;

          padding: 14px;

          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 11px;

          background: rgba(3, 7, 18, 0.45);

          overflow: hidden;
        }

        .ar-bucket::before {
          content: "";

          position: absolute;
          top: 0;
          left: 0;
          right: 0;

          height: 1px;

          background: var(--bucket-color);
          opacity: 0.5;
        }

        .ar-bucket-label {
          display: block;

          margin-bottom: 7px;

          color: #64748b;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .ar-bucket-value {
          display: block;

          overflow: hidden;
          text-overflow: ellipsis;

          color: var(--bucket-color);

          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 15px;
          font-weight: 750;

          white-space: nowrap;
        }

        /*
         * ─────────────────────────────
         * MAIN GRID
         * ─────────────────────────────
         */

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
          gap: 20px;
        }

        .panel {
          min-width: 0;

          border: 1px solid rgba(148, 163, 184, 0.11);
          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.76),
              rgba(7, 12, 24, 0.9)
            );

          overflow: hidden;

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .panel-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 15px;

          padding: 19px 20px 15px;
        }

        .panel-heading h2 {
          margin: 0;

          color: #f8fafc;

          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .panel-heading p {
          margin: 4px 0 0;

          color: #475569;

          font-size: 10px;
        }

        /*
         * ─────────────────────────────
         * MODULES
         * ─────────────────────────────
         */

        .module-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;

          padding: 0 12px 12px;
        }

        .module {
          position: relative;

          min-height: 172px;
          padding: 17px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 13px;

          background: rgba(3, 7, 18, 0.42);

          text-decoration: none;

          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .module:hover {
          transform: translateY(-2px);

          border-color: rgba(56, 189, 248, 0.28);

          background:
            linear-gradient(
              145deg,
              rgba(14, 29, 48, 0.72),
              rgba(3, 7, 18, 0.6)
            );
        }

        .module:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
        }

        .module-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .module-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(56, 189, 248, 0.13);
          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              rgba(56, 189, 248, 0.09),
              rgba(99, 102, 241, 0.07)
            );

          color: #7dd3fc;

          font-size: 14px;
          font-weight: 800;
        }

        .module-tag {
          padding: 4px 7px;

          border: 1px solid rgba(148, 163, 184, 0.09);
          border-radius: 6px;

          color: #475569;

          font-size: 8px;
          font-weight: 750;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .module-name {
          margin-top: 14px;

          color: #e2e8f0;

          font-size: 13px;
          font-weight: 750;
        }

        .module-description {
          margin-top: 5px;

          color: #475569;

          font-size: 10px;
          line-height: 1.55;
        }

        .module-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 15px;
          padding-top: 10px;

          border-top: 1px solid rgba(148, 163, 184, 0.07);

          color: #38bdf8;

          font-size: 9px;
          font-weight: 700;
        }

        .module-arrow {
          font-size: 13px;

          transition: transform 180ms ease;
        }

        .module:hover .module-arrow {
          transform: translateX(3px);
        }

        /*
         * ─────────────────────────────
         * ACTIVITY
         * ─────────────────────────────
         */

        .activity-list {
          padding: 0 10px 10px;
        }

        .activity {
          position: relative;

          display: flex;
          align-items: center;

          gap: 12px;

          min-height: 72px;

          padding: 11px 10px;

          border-bottom: 1px solid rgba(148, 163, 184, 0.07);
        }

        .activity:last-child {
          border-bottom: 0;
        }

        .activity-marker {
          position: relative;

          width: 34px;
          height: 34px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          font-size: 9px;
          font-weight: 800;
        }

        .activity-invoice {
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.14);
          color: #34d399;
        }

        .activity-purchase {
          background: rgba(251, 113, 133, 0.08);
          border: 1px solid rgba(251, 113, 133, 0.14);
          color: #fb7185;
        }

        .activity-info {
          min-width: 0;
          flex: 1;
        }

        .activity-title-row {
          display: flex;
          align-items: center;
          gap: 7px;

          min-width: 0;
        }

        .activity-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          color: #cbd5e1;

          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 10px;
          font-weight: 700;
        }

        .activity-status {
          padding: 2px 5px;

          border-radius: 4px;

          font-size: 7px;
          font-weight: 750;
          letter-spacing: 0.03em;
          text-transform: uppercase;

          white-space: nowrap;
        }

        .status-paid {
          color: #34d399;
          background: rgba(52, 211, 153, 0.08);
        }

        .status-due {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
        }

        .activity-description {
          margin-top: 4px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          color: #475569;

          font-size: 9px;
        }

        .activity-right {
          flex: 0 0 auto;

          display: flex;
          flex-direction: column;
          align-items: flex-end;

          gap: 4px;
        }

        .activity-amount {
          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 10px;
          font-weight: 750;
        }

        .amount-in {
          color: #34d399;
        }

        .amount-out {
          color: #fb7185;
        }

        .activity-time {
          color: #334155;

          font-size: 8px;
        }

        .collect-button {
          margin-top: 3px;

          padding: 4px 7px;

          border: 1px solid rgba(56, 189, 248, 0.15);
          border-radius: 5px;

          background: rgba(56, 189, 248, 0.07);

          color: #38bdf8;

          font-size: 8px;
          font-weight: 700;

          text-decoration: none;

          transition:
            background 150ms ease,
            border-color 150ms ease;
        }

        .collect-button:hover {
          background: rgba(56, 189, 248, 0.13);
          border-color: rgba(56, 189, 248, 0.3);
        }

        /*
         * ─────────────────────────────
         * EMPTY STATE
         * ─────────────────────────────
         */

        .empty-state {
          min-height: 350px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 40px 25px;

          text-align: center;
        }

        .empty-icon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 13px;

          border: 1px solid rgba(56, 189, 248, 0.12);
          border-radius: 12px;

          background: rgba(56, 189, 248, 0.05);

          color: #38bdf8;

          font-size: 15px;
          font-weight: 800;
        }

        .empty-title {
          color: #cbd5e1;

          font-size: 12px;
          font-weight: 700;
        }

        .empty-description {
          max-width: 250px;

          margin-top: 5px;

          color: #475569;

          font-size: 10px;
          line-height: 1.5;
        }

        /*
         * ─────────────────────────────
         * FINANCIAL HEALTH
         * ─────────────────────────────
         */

        .health-bar {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-top: 13px;
          padding-top: 12px;

          border-top: 1px solid rgba(148, 163, 184, 0.07);
        }

        .health-indicator {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: var(--health-color);
          box-shadow: 0 0 10px var(--health-color);
        }

        .health-positive {
          --health-color: #34d399;
        }

        .health-negative {
          --health-color: #fb7185;
        }

        .health-neutral {
          --health-color: #64748b;
        }

        .health-text {
          color: #64748b;

          font-size: 9px;
        }

        /*
         * ─────────────────────────────
         * RESPONSIVE
         * ─────────────────────────────
         */

        @media (max-width: 1100px) {
          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .metric-card {
            min-height: 130px;
            padding: 15px;
          }

          .metric-value {
            font-size: 18px;
          }

          .metric-description {
            font-size: 9px;
          }

          .ar-card {
            padding: 15px;
          }

          .ar-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .module-grid {
            grid-template-columns: 1fr;
          }

          .module {
            min-height: 150px;
          }
        }

        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr 1fr;
          }

          .metric-card {
            padding: 13px;
            border-radius: 12px;
          }

          .metric-label {
            font-size: 8px;
          }

          .metric-value {
            font-size: 16px;
          }

          .metric-symbol {
            width: 24px;
            height: 24px;
          }

          .ar-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .activity {
            align-items: flex-start;
          }

          .activity-right {
            padding-top: 2px;
          }

          .activity-amount {
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .metric-card,
          .module,
          .module-arrow,
          .collect-button {
            transition: none;
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          FINANCIAL OVERVIEW
      ═══════════════════════════════════════════ */}

      <div className="metric-grid">
        <MetricCard
          className="metric-green"
          color="#34d399"
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="Invoiced earnings"
          symbol="↗"
        />

        <MetricCard
          className="metric-red"
          color="#fb7185"
          label="Operating Cost"
          value={formatCurrency(totalCost)}
          description="Recorded procurement"
          symbol="↘"
        />

        <MetricCard
          className="metric-blue"
          color={netProfit >= 0 ? "#38bdf8" : "#fb7185"}
          label="Net Position"
          value={`${profitMargin.toFixed(1)}%`}
          description={formatCurrency(netProfit)}
          symbol="∿"
        />

        <MetricCard
          className="metric-amber"
          color="#f59e0b"
          label="Overdue AR"
          value={formatCurrency(aging.totalOverdue)}
          description={
            aging.days60Plus > 0
              ? "60+ day exposure detected"
              : "Pending collections"
          }
          symbol="!"
        />
      </div>

      {/* ═══════════════════════════════════════════
          AR AGING
      ═══════════════════════════════════════════ */}

      <section className="ar-card">
        <div className="ar-header">
          <div className="ar-title">
            <span className="ar-title-mark" />

            <h3>Accounts Receivable Aging</h3>
          </div>

          <span className="ar-live">
            <span className="ar-live-dot" />
            Live assessment
          </span>
        </div>

        <div className="ar-grid">
          <AgingBucket label="Current" value={aging.current} color="#34d399" />

          <AgingBucket
            label="1–30 days"
            value={aging.days1_30}
            color="#38bdf8"
          />

          <AgingBucket
            label="31–60 days"
            value={aging.days31_60}
            color="#f59e0b"
          />

          <AgingBucket
            label="60+ days"
            value={aging.days60Plus}
            color="#fb7185"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MAIN DASHBOARD
      ═══════════════════════════════════════════ */}

      <div className="main-grid">
        {/* ─────────────────────────────────────────
            MODULES
        ───────────────────────────────────────── */}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Operations</h2>

              <p>Core business modules</p>
            </div>
          </div>

          <div className="module-grid">
            <ModuleCard
              href={`/v1/${tenantSlug}/sales`}
              icon="INV"
              tag="Billing"
              title="Sales Management"
              description="Create, manage and dispatch professional client invoices."
            />

            <ModuleCard
              href={`/v1/${tenantSlug}/inventory`}
              icon="STK"
              tag="Inventory"
              title="Warehouse"
              description="Monitor stock levels, valuations and catalog items."
            />

            <ModuleCard
              href={`/v1/${tenantSlug}/procurement`}
              icon="PO"
              tag="Supply"
              title="Procurement"
              description="Track purchase orders and supplier restocking."
            />

            <ModuleCard
              href={`/v1/${tenantSlug}/customers`}
              icon="CRM"
              tag="Clients"
              title="Customer Directory"
              description="Manage customer profiles, balances and collection ledgers."
            />
          </div>
        </section>

        {/* ─────────────────────────────────────────
            ACTIVITY
        ───────────────────────────────────────── */}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Activity stream</h2>

              <p>Latest financial transactions</p>
            </div>

            {activities.length > 0 && (
              <span className="ar-live">{activities.length} events</span>
            )}
          </div>

          {activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>

              <div className="empty-title">No transactions yet</div>

              <div className="empty-description">
                Create an invoice or purchase order and your activity will
                appear here.
              </div>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <ActivityRow
                  key={`${activity.type}-${activity.id}`}
                  activity={activity}
                  formatCurrency={formatCurrency}
                  formatRelativeDate={formatRelativeDate}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ═══════════════════════════════════════════
          FINANCIAL HEALTH
      ═══════════════════════════════════════════ */}

      <div className={`health-bar ${health.className}`}>
        <span className="health-indicator" />

        <span className="health-text">
          <strong>{health.label}</strong>
          {" — "}
          {health.description}
        </span>

        <span className="health-text">
          Collection rate: {collectionRate.toFixed(0)}%
        </span>
      </div>
    </section>
  );
}

/*
 * ═══════════════════════════════════════════════
 * COMPONENTS
 * ═══════════════════════════════════════════════
 */

function MetricCard({
  className,
  color,
  label,
  value,
  description,
  symbol,
}: {
  className: string;
  color: string;
  label: string;
  value: string;
  description: string;
  symbol: string;
}) {
  return (
    <article
      className={`metric-card ${className}`}
      style={
        {
          "--metric-color": color,
        } as React.CSSProperties
      }
    >
      <div className="metric-top">
        <span className="metric-label">{label}</span>

        <span className="metric-symbol">{symbol}</span>
      </div>

      <span className="metric-value">{value}</span>

      <span className="metric-description">{description}</span>
    </article>
  );
}

function AgingBucket({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="ar-bucket"
      style={
        {
          "--bucket-color": color,
        } as React.CSSProperties
      }
    >
      <span className="ar-bucket-label">{label}</span>

      <span className="ar-bucket-value">
        RM{" "}
        {value.toLocaleString("en-MY", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}

function ModuleCard({
  href,
  icon,
  tag,
  title,
  description,
}: {
  href: string;
  icon: string;
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="module">
      <div>
        <div className="module-top">
          <div className="module-icon">{icon}</div>

          <span className="module-tag">{tag}</span>
        </div>

        <div className="module-name">{title}</div>

        <div className="module-description">{description}</div>
      </div>

      <div className="module-footer">
        <span>Open module</span>

        <span className="module-arrow">→</span>
      </div>
    </Link>
  );
}

function ActivityRow({
  activity,
  formatCurrency,
  formatRelativeDate,
}: {
  activity: Activity;
  formatCurrency: (value: number) => string;
  formatRelativeDate: (date: Date) => string;
}) {
  const isInvoice = activity.type === "invoice";

  return (
    <div className="activity">
      <div
        className={`activity-marker ${
          isInvoice ? "activity-invoice" : "activity-purchase"
        }`}
      >
        {isInvoice ? "IN" : "PO"}
      </div>

      <div className="activity-info">
        <div className="activity-title-row">
          <span className="activity-title">{activity.title}</span>

          {isInvoice && activity.status && (
            <span
              className={`activity-status ${
                activity.status === "paid" ? "status-paid" : "status-due"
              }`}
            >
              {activity.status === "paid" ? "Paid" : "Outstanding"}
            </span>
          )}
        </div>

        <div className="activity-description">{activity.description}</div>
      </div>

      <div className="activity-right">
        <span
          className={`activity-amount ${
            isInvoice ? "amount-in" : "amount-out"
          }`}
        >
          {isInvoice ? "+" : "-"}
          {formatCurrency(activity.amount)}
        </span>

        <span className="activity-time">
          {formatRelativeDate(activity.createdAt)}
        </span>

        {activity.href && (
          <Link href={activity.href} className="collect-button">
            Collect
          </Link>
        )}
      </div>
    </div>
  );
}
