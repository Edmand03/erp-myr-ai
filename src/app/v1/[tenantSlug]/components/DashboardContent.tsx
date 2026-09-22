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
        * { box-sizing: border-box; }

        .dashboard-content {
          width: 100%;
          min-width: 0;
          color: #f5f5f7;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        }

        .dashboard-content a { color: inherit; }

        /* ======================================================
           DESKTOP-FIRST HERO LANGUAGE
           Same visual direction as the animated hero, but with
           application-sized typography that is actually readable.
        ====================================================== */

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .metric-card,
        .ar-card,
        .panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background:
            linear-gradient(145deg, rgba(19, 19, 19, 0.98), rgba(7, 7, 7, 0.98));
          box-shadow:
            0 24px 55px rgba(0, 0, 0, 0.22),
            inset 0 1px rgba(255, 255, 255, 0.025);
        }

        .metric-card {
          min-height: 172px;
          padding: 24px;
          border-radius: 16px;
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 220ms ease,
            background 220ms ease;
        }

        .metric-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.16);
          background:
            linear-gradient(145deg, rgba(24, 24, 24, 0.99), rgba(8, 8, 8, 0.99));
        }

        .metric-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: var(--metric-color);
          opacity: 0.45;
        }

        .metric-card::after {
          content: "";
          position: absolute;
          right: -45px;
          bottom: -65px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: var(--metric-color);
          filter: blur(70px);
          opacity: 0.055;
          pointer-events: none;
        }

        .metric-green { --metric-color: #b7ff3c; }
        .metric-red { --metric-color: #bdbdbd; }
        .metric-blue { --metric-color: #d0d0d0; }
        .metric-amber { --metric-color: #b7ff3c; }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 27px;
        }

        .metric-label {
          color: #9b9b9b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .metric-symbol {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.025);
          color: #999;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 13px;
        }

        .metric-value {
          position: relative;
          z-index: 1;
          display: block;
          overflow: hidden;
          color: var(--metric-color);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: clamp(27px, 2.2vw, 38px);
          font-weight: 400;
          letter-spacing: -0.045em;
          line-height: 1.05;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .metric-description {
          display: block;
          margin-top: 11px;
          color: #737373;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          line-height: 1.4;
        }

        /* AR AGING */

        .ar-card {
          margin-bottom: 22px;
          padding: 24px;
          border-radius: 16px;
        }

        .ar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .ar-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ar-title-mark {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #b7ff3c;
          box-shadow: 0 0 12px rgba(183, 255, 60, 0.6);
        }

        .ar-title h3 {
          margin: 0;
          color: #dedede;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .ar-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
        }

        .ar-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b7ff3c;
          box-shadow: 0 0 8px rgba(183, 255, 60, 0.55);
        }

        .ar-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .ar-bucket {
          position: relative;
          min-width: 0;
          padding: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.018);
        }

        .ar-bucket::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--bucket-color);
          opacity: 0.45;
        }

        .ar-bucket-label {
          display: block;
          margin-bottom: 11px;
          color: #888;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .ar-bucket-value {
          display: block;
          overflow: hidden;
          color: var(--bucket-color);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 20px;
          font-weight: 400;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* MAIN GRID */

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(380px, 0.85fr);
          gap: 20px;
        }

        .panel {
          min-width: 0;
          border-radius: 16px;
        }

        .panel-heading {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          min-height: 78px;
          padding: 23px 24px 17px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.065);
        }

        .panel-heading::before {
          content: "SYSTEM / MODULE";
          position: absolute;
          top: 15px;
          right: 24px;
          color: #3d3d3d;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .panel-heading h2 {
          margin: 0;
          color: #e5e5e5;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .panel-heading p {
          margin: 5px 0 0;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
        }

        /* OPERATIONS */

        .module-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          padding: 12px;
        }

        .module {
          position: relative;
          min-height: 205px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.075);
          border-radius: 12px;
          background:
            linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(9, 9, 9, 0.94));
          text-decoration: none;
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 220ms ease,
            background 220ms ease,
            box-shadow 220ms ease;
        }

        .module::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.035) 46%,
            transparent 60%
          );
          transform: translateX(-110%);
          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .module:hover {
          transform: translateY(-3px);
          border-color: rgba(183, 255, 60, 0.2);
          background:
            linear-gradient(145deg, rgba(24, 24, 24, 0.96), rgba(10, 10, 10, 0.98));
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
        }

        .module:hover::before { transform: translateX(110%); }

        .module:focus-visible {
          outline: 1px solid #b7ff3c;
          outline-offset: 3px;
        }

        .module-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .module-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .module:hover .module-icon {
          border-color: rgba(183, 255, 60, 0.2);
          color: #b7ff3c;
        }

        .module-tag {
          padding: 5px 7px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 5px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .module-name {
          margin-top: 18px;
          color: #e0e0e0;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.025em;
        }

        .module-description {
          max-width: 300px;
          margin-top: 8px;
          color: #858585;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          line-height: 1.65;
        }

        .module-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 19px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
        }

        .module-arrow {
          color: #777;
          font-size: 16px;
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), color 180ms ease;
        }

        .module:hover .module-footer { color: #999; }
        .module:hover .module-arrow { color: #b7ff3c; transform: translateX(4px); }

        /* ACTIVITY */

        .activity-list { padding: 0 12px 12px; }

        .activity {
          position: relative;
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr) auto;
          align-items: center;
          gap: 13px;
          min-height: 78px;
          padding: 12px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
          transition: background 180ms ease;
        }

        .activity:last-child { border-bottom: 0; }
        .activity:hover { background: rgba(255, 255, 255, 0.018); }

        .activity-marker {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 500;
        }

        .activity-invoice {
          background: rgba(183, 255, 60, 0.045);
          border: 1px solid rgba(183, 255, 60, 0.13);
          color: #b7ff3c;
        }

        .activity-purchase {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #888;
        }

        .activity-info { min-width: 0; }

        .activity-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .activity-title {
          overflow: hidden;
          color: #d0d0d0;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          font-weight: 400;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-status {
          padding: 3px 6px;
          border-radius: 3px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .status-paid {
          color: #b7ff3c;
          background: rgba(183, 255, 60, 0.055);
        }

        .status-due {
          color: #aaa;
          background: rgba(255, 255, 255, 0.045);
        }

        .activity-description {
          margin-top: 5px;
          overflow: hidden;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-right {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .activity-amount {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          font-weight: 500;
        }

        .amount-in { color: #b7ff3c; }
        .amount-out { color: #999; }

        .activity-time {
          color: #666;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
        }

        .collect-button {
          margin-top: 2px;
          padding: 5px 7px;
          border: 1px solid rgba(183, 255, 60, 0.13);
          border-radius: 4px;
          background: rgba(183, 255, 60, 0.045);
          color: #b7ff3c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          text-decoration: none;
        }

        /* EMPTY / HEALTH */

        .empty-state {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 25px;
          text-align: center;
        }

        .empty-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
          border: 1px solid rgba(183, 255, 60, 0.12);
          border-radius: 11px;
          background: rgba(183, 255, 60, 0.035);
          color: #b7ff3c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 17px;
        }

        .empty-title {
          color: #aaa;
          font-size: 15px;
          font-weight: 500;
        }

        .empty-description {
          max-width: 300px;
          margin-top: 7px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          line-height: 1.65;
        }

        .health-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding: 15px 2px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
        }

        .health-indicator {
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: var(--health-color);
          box-shadow: 0 0 10px var(--health-color);
        }

        .health-positive { --health-color: #b7ff3c; }
        .health-negative { --health-color: #aaa; }
        .health-neutral { --health-color: #555; }

        .health-text {
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          line-height: 1.5;
        }

        .health-text strong {
          color: #aaa;
          font-weight: 500;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
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
            gap: 10px;
          }

          .metric-card {
            min-height: 145px;
            padding: 17px;
            border-radius: 12px;
          }

          .metric-label { font-size: 10px; }
          .metric-value { font-size: 22px; }

          .ar-card {
            padding: 17px;
            border-radius: 12px;
          }

          .ar-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .module-grid {
            grid-template-columns: 1fr;
          }

          .module {
            min-height: 175px;
          }

          .activity {
            grid-template-columns: 36px minmax(0, 1fr) auto;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr;
          }

          .metric-card {
            padding: 16px;
          }

          .ar-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .activity {
            align-items: start;
          }

          .activity-right {
            padding-top: 2px;
          }

          .health-bar {
            align-items: flex-start;
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .metric-card,
          .module,
          .module::before,
          .module-arrow,
          .collect-button,
          .activity {
            transition: none !important;
          }

          .module::before { display: none; }
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

        <div
          style={{
            marginTop: "9px",
            color: "#303030",
            fontFamily: '"SFMono-Regular", Consolas, monospace',
            fontSize: "5px",
            letterSpacing: "0.08em",
          }}
        >
          READY / SYNCED
        </div>
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
