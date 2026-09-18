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
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default async function InventoryPage({ params }: InventoryProps) {
  const { tenantSlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const accessCheck = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      tenant: {
        slug: tenantSlug,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!accessCheck) {
    redirect("/dashboard-redirect");
  }

  const { tenant } = accessCheck;
  const tenantInitial = tenant.name.charAt(0).toUpperCase();

  return (
    <div className="inventory-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        .inventory-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(56, 189, 248, 0.08),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 8%,
              rgba(99, 102, 241, 0.07),
              transparent 28%
            ),
            #030712;

          color: #f8fafc;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =========================================
           BACKGROUND
        ========================================= */

        .inventory-page::before {
          content: "";
          position: fixed;
          inset: 0;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(148, 163, 184, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148, 163, 184, 0.025) 1px,
              transparent 1px
            );

          background-size: 48px 48px;

          mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.7) 45%,
            transparent 90%
          );
        }

        .inventory-glow {
          position: fixed;
          top: 80px;
          left: 50%;

          width: 700px;
          height: 300px;

          transform: translateX(-50%);

          pointer-events: none;

          background: radial-gradient(
            ellipse,
            rgba(56, 189, 248, 0.035),
            transparent 70%
          );

          filter: blur(20px);
        }

        /* =========================================
           HEADER
        ========================================= */

        .inventory-header {
          position: sticky;
          top: 0;
          z-index: 50;

          width: 100%;

          background: rgba(3, 7, 18, 0.9);

          border-bottom:
            1px solid rgba(148, 163, 184, 0.12);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .header-inner {
          width: 100%;
          max-width: 1500px;

          margin: 0 auto;

          padding: 20px 48px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 28px;
        }

        .header-left {
          display: flex;
          align-items: center;

          min-width: 0;

          gap: 14px;
        }

        /* =========================================
           BACK BUTTON
        ========================================= */

        .back-button {
          width: 40px;
          height: 40px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 11px;

          background: rgba(15, 23, 42, 0.7);

          color: #94a3b8;

          text-decoration: none;

          font-size: 17px;
          font-weight: 600;

          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;
        }

        .back-button:hover {
          color: #f8fafc;

          background: rgba(30, 41, 59, 0.9);

          border-color: rgba(148, 163, 184, 0.3);

          transform: translateX(-2px);
        }

        /* =========================================
           TENANT ICON
        ========================================= */

        .tenant-icon {
          width: 42px;
          height: 42px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              rgba(56, 189, 248, 0.14),
              rgba(99, 102, 241, 0.12)
            );

          color: #7dd3fc;

          font-size: 13px;
          font-weight: 850;
        }

        .header-copy {
          min-width: 0;
        }

        .title-row {
          display: flex;
          align-items: center;

          gap: 10px;

          flex-wrap: wrap;
        }

        .title {
          margin: 0;

          color: #f8fafc;

          font-size: 19px;
          line-height: 1.25;

          font-weight: 800;

          letter-spacing: -0.45px;

          overflow-wrap: anywhere;
        }

        .badge {
          display: inline-flex;
          align-items: center;

          min-height: 24px;

          padding: 4px 9px;

          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 7px;

          background: rgba(15, 23, 42, 0.75);

          color: #64748b;

          font-size: 8px;
          font-weight: 750;

          letter-spacing: 0.06em;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .subtitle {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 11px;
          line-height: 1.4;
        }

        /* =========================================
           STATUS
        ========================================= */

        .header-status {
          display: flex;
          align-items: center;

          gap: 8px;

          flex: 0 0 auto;

          padding: 9px 13px;

          border: 1px solid rgba(52, 211, 153, 0.13);
          border-radius: 9px;

          background: rgba(52, 211, 153, 0.04);

          color: #64748b;

          font-size: 9px;
          font-weight: 700;

          white-space: nowrap;
        }

        .status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 10px rgba(52, 211, 153, 0.7);
        }

        /* =========================================
           MAIN
        ========================================= */

        .inventory-main {
          position: relative;
          z-index: 1;

          width: 100%;
          max-width: 1500px;

          margin: 0 auto;

          padding:
            40px 48px 90px;

          display: flex;
          flex-direction: column;

          gap: 30px;
        }

        /* =========================================
           IMPORT SECTION
        ========================================= */

        .import-card {
          width: 100%;

          padding: 26px 28px;

          border:
            1px solid rgba(148, 163, 184, 0.12);

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.82),
              rgba(7, 12, 24, 0.92)
            );

          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.16);

          overflow: hidden;
        }

        .import-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-bottom: 22px;
        }

        .import-title-wrapper {
          display: flex;
          align-items: center;

          gap: 12px;
        }

        .import-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          border:
            1px solid rgba(56, 189, 248, 0.16);

          border-radius: 9px;

          background:
            rgba(56, 189, 248, 0.07);

          color: #38bdf8;

          font-size: 8px;
          font-weight: 850;

          letter-spacing: 0.04em;
        }

        .import-title {
          color: #e2e8f0;

          font-size: 13px;

          font-weight: 750;
        }

        .import-description {
          color: #64748b;

          font-size: 10px;

          line-height: 1.5;

          text-align: right;
        }

        /* =========================================
           INVENTORY CONTENT
        ========================================= */

        .inventory-content {
          width: 100%;
          min-width: 0;

          /*
           * Give InventoryContent breathing room.
           * This prevents its first/last elements from
           * feeling glued to the surrounding container.
           */
          padding: 4px 0;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 1100px) {
          .header-inner {
            padding-left: 32px;
            padding-right: 32px;
          }

          .inventory-main {
            padding-left: 32px;
            padding-right: 32px;
          }

          .header-status {
            display: none;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 700px) {
          .header-inner {
            padding: 16px 20px;
          }

          .inventory-main {
            padding:
              28px 20px 60px;

            gap: 24px;
          }

          .back-button {
            width: 38px;
            height: 38px;
          }

          .tenant-icon {
            width: 38px;
            height: 38px;
          }

          .title {
            font-size: 16px;
          }

          .subtitle {
            font-size: 10px;
          }

          .import-card {
            padding: 22px 20px;

            border-radius: 15px;
          }

          .import-header {
            align-items: flex-start;

            flex-direction: column;

            gap: 8px;

            margin-bottom: 18px;
          }

          .import-description {
            text-align: left;
          }
        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 480px) {
          .header-inner {
            padding: 14px;
          }

          .inventory-main {
            padding:
              22px 14px 45px;

            gap: 20px;
          }

          .header-left {
            gap: 9px;
          }

          .back-button {
            width: 36px;
            height: 36px;

            font-size: 15px;
          }

          .tenant-icon {
            display: none;
          }

          .title {
            font-size: 15px;
          }

          .badge {
            display: none;
          }

          .subtitle {
            margin-top: 4px;

            font-size: 9px;
          }

          .import-card {
            padding: 18px 16px;

            border-radius: 14px;
          }

          .import-title {
            font-size: 12px;
          }

          .import-description {
            font-size: 9px;
          }
        }
      `}</style>

      {/* Background */}
      <div className="inventory-glow" />

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="inventory-header">
        <div className="header-inner">
          <div className="header-left">
            <Link
              href={`/v1/${tenantSlug}/dashboard`}
              className="back-button"
              aria-label="Return to ERP dashboard"
            >
              ←
            </Link>

            <div className="tenant-icon">{tenantInitial}</div>

            <div className="header-copy">
              <div className="title-row">
                <h1 className="title">{tenant.name} · Warehouse</h1>

                <span className="badge">Inventory Operations</span>
              </div>

              <p className="subtitle">
                Stock control, product catalog & inventory intelligence
              </p>
            </div>
          </div>

          <div className="header-status">
            <span className="status-dot" />
            Inventory system active
          </div>
        </div>
      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="inventory-main">
        <section className="import-card">
          <div className="import-header">
            <div className="import-title-wrapper">
              <div className="import-icon">PDF</div>

              <span className="import-title">Inventory import</span>
            </div>

            <span className="import-description">
              Import stock data from supplier documents
            </span>
          </div>

          <ClientPdfInventoryImporter tenantId={tenant.id} />
        </section>

        <section className="inventory-content">
          <Suspense fallback={<InventorySkeleton />}>
            <InventoryContent tenantId={tenant.id} tenantSlug={tenantSlug} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
