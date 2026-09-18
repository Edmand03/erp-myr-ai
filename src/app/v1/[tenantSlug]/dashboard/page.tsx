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

  const userName = session.user.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const tenantInitial = tenant.name.charAt(0).toUpperCase();

  return (
    <div className="erp-shell">
      <style>{`
        /*
         * ═════════════════════════════════════════════
         * ERP DASHBOARD SHELL
         * ═════════════════════════════════════════════
         */

        .erp-shell {
          position: relative;
          min-height: 100vh;
          width: 100%;

          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 10% -10%,
              rgba(56, 189, 248, 0.09),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 0%,
              rgba(99, 102, 241, 0.075),
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

        /*
         * Technical grid background
         */

        .erp-shell::before {
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

          background-size: 44px 44px;

          mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.6) 35%,
            transparent 85%
          );
        }

        /*
         * Ambient light
         */

        .ambient {
          position: fixed;

          pointer-events: none;

          border-radius: 999px;

          filter: blur(110px);

          opacity: 0.12;
        }

        .ambient-one {
          width: 320px;
          height: 320px;

          top: -220px;
          left: 18%;

          background: #38bdf8;
        }

        .ambient-two {
          width: 280px;
          height: 280px;

          top: 25%;
          right: -180px;

          background: #6366f1;
        }

        /*
         * Main container
         */

        .dashboard-container {
          position: relative;
          z-index: 1;

          width: 100%;
          max-width: 1480px;

          margin: 0 auto;

          padding: 32px 40px 60px;
        }

        /*
         * ═════════════════════════════════════════════
         * HEADER
         * ═════════════════════════════════════════════
         */

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 28px;

          width: 100%;

          margin-bottom: 30px;
          padding-bottom: 24px;

          border-bottom:
            1px solid rgba(148, 163, 184, 0.11);
        }

        /*
         * Tenant identity
         */

        .tenant-identity {
          display: flex;
          align-items: center;

          gap: 14px;

          min-width: 0;
        }

        .tenant-logo {
          width: 46px;
          height: 46px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              rgba(56, 189, 248, 0.18),
              rgba(99, 102, 241, 0.15)
            );

          border:
            1px solid rgba(125, 211, 252, 0.18);

          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.06),
            0 10px 30px rgba(56, 189, 248, 0.07);

          color: #7dd3fc;

          font-size: 16px;
          font-weight: 850;
        }

        .tenant-copy {
          min-width: 0;
        }

        .title-row {
          display: flex;
          align-items: center;

          gap: 9px;

          min-width: 0;

          flex-wrap: wrap;
        }

        .tenant-name {
          margin: 0;

          max-width: 600px;

          color: #f8fafc;

          font-size: clamp(22px, 2vw, 29px);
          line-height: 1.15;

          font-weight: 800;

          letter-spacing: -0.7px;

          overflow-wrap: anywhere;
        }

        .workspace-badge {
          display: inline-flex;
          align-items: center;

          gap: 6px;

          padding: 4px 8px;

          border:
            1px solid rgba(148, 163, 184, 0.13);

          border-radius: 7px;

          background:
            rgba(15, 23, 42, 0.65);

          color: #64748b;

          font-size: 9px;
          font-weight: 750;

          letter-spacing: 0.04em;
          text-transform: uppercase;

          white-space: nowrap;
        }

        .workspace-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #38bdf8;

          box-shadow:
            0 0 9px rgba(56, 189, 248, 0.8);
        }

        .tenant-subtitle {
          margin: 6px 0 0;

          color: #475569;

          font-size: 12px;
          line-height: 1.45;
        }

        /*
         * ═════════════════════════════════════════════
         * HEADER ACTIONS
         * ═════════════════════════════════════════════
         */

        .dashboard-actions {
          display: flex;
          align-items: center;

          gap: 9px;

          flex: 0 0 auto;
        }

        /*
         * System status
         */

        .system-status {
          display: flex;
          align-items: center;

          gap: 8px;

          height: 40px;

          padding: 0 11px;

          border:
            1px solid rgba(16, 185, 129, 0.13);

          border-radius: 10px;

          background:
            rgba(16, 185, 129, 0.045);
        }

        .status-light {
          position: relative;

          width: 7px;
          height: 7px;

          flex: 0 0 auto;
        }

        .status-light::before {
          content: "";

          position: absolute;

          inset: -3px;

          border-radius: 50%;

          background: rgba(52, 211, 153, 0.15);

          animation: statusPulse 2s ease-out infinite;
        }

        .status-light span {
          position: relative;

          display: block;

          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 9px rgba(52, 211, 153, 0.8);
        }

        .status-copy {
          display: flex;
          flex-direction: column;

          gap: 1px;
        }

        .status-copy strong {
          color: #a7f3d0;

          font-size: 9px;
          font-weight: 750;

          white-space: nowrap;
        }

        .status-copy span {
          color: #475569;

          font-size: 8px;
        }

        /*
         * Create invoice
         */

        .create-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          height: 40px;

          padding: 0 15px;

          border-radius: 10px;

          background: #38bdf8;

          color: #03111b;

          text-decoration: none;

          font-size: 11px;
          font-weight: 800;

          box-shadow:
            0 7px 20px rgba(56, 189, 248, 0.13),
            inset 0 1px rgba(255, 255, 255, 0.25);

          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .create-button:hover {
          transform: translateY(-1px);

          background: #7dd3fc;

          box-shadow:
            0 10px 28px rgba(56, 189, 248, 0.2),
            inset 0 1px rgba(255, 255, 255, 0.3);
        }

        .create-button:active {
          transform: translateY(0);
        }

        .create-button:focus-visible {
          outline: 2px solid #7dd3fc;
          outline-offset: 3px;
        }

        .create-icon {
          width: 18px;
          height: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 5px;

          background: rgba(3, 7, 18, 0.1);

          font-size: 15px;
          line-height: 1;
        }

        /*
         * User profile
         */

        .user-profile {
          display: flex;
          align-items: center;

          gap: 9px;

          height: 42px;

          padding: 5px 10px 5px 5px;

          border:
            1px solid rgba(148, 163, 184, 0.11);

          border-radius: 12px;

          background:
            rgba(15, 23, 42, 0.6);

          backdrop-filter: blur(12px);
        }

        .user-avatar {
          width: 31px;
          height: 31px;

          flex: 0 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #38bdf8,
              #6366f1
            );

          color: white;

          font-size: 11px;
          font-weight: 850;

          box-shadow:
            0 5px 15px rgba(56, 189, 248, 0.1);
        }

        .user-details {
          display: flex;
          flex-direction: column;

          min-width: 0;
        }

        .user-name {
          max-width: 120px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          color: #cbd5e1;

          font-size: 10px;
          font-weight: 750;
        }

        .user-role {
          margin-top: 1px;

          color: #475569;

          font-size: 8px;
        }

        .user-chevron {
          margin-left: 2px;

          color: #334155;

          font-size: 12px;
        }

        /*
         * ═════════════════════════════════════════════
         * CONTENT
         * ═════════════════════════════════════════════
         */

        .dashboard-content {
          width: 100%;
          min-width: 0;
        }

        /*
         * ═════════════════════════════════════════════
         * ANIMATION
         * ═════════════════════════════════════════════
         */

        @keyframes statusPulse {
          0% {
            transform: scale(0.7);
            opacity: 0.7;
          }

          70% {
            transform: scale(1.6);
            opacity: 0;
          }

          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        /*
         * ═════════════════════════════════════════════
         * TABLET
         * ═════════════════════════════════════════════
         */

        @media (max-width: 1100px) {
          .dashboard-container {
            padding: 28px 24px 50px;
          }

          .dashboard-header {
            align-items: flex-start;
          }

          .system-status {
            display: none;
          }
        }

        /*
         * ═════════════════════════════════════════════
         * MOBILE
         * ═════════════════════════════════════════════
         */

        @media (max-width: 760px) {
          .dashboard-container {
            padding: 20px 16px 40px;
          }

          .dashboard-header {
            flex-direction: column;

            align-items: stretch;

            gap: 18px;

            margin-bottom: 22px;
            padding-bottom: 20px;
          }

          .tenant-identity {
            align-items: flex-start;
          }

          .tenant-logo {
            width: 40px;
            height: 40px;

            border-radius: 11px;

            font-size: 14px;
          }

          .tenant-name {
            font-size: 21px;
          }

          .tenant-subtitle {
            font-size: 11px;
          }

          .dashboard-actions {
            display: grid;

            grid-template-columns: 1fr auto;

            width: 100%;
          }

          .create-button {
            width: 100%;
          }

          .user-profile {
            min-width: 0;
          }

          .user-details {
            display: none;
          }

          .user-chevron {
            display: none;
          }
        }

        /*
         * ═════════════════════════════════════════════
         * SMALL MOBILE
         * ═════════════════════════════════════════════
         */

        @media (max-width: 430px) {
          .dashboard-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .workspace-badge {
            font-size: 8px;
          }

          .dashboard-actions {
            grid-template-columns: 1fr 42px;
          }

          .user-profile {
            width: 42px;

            justify-content: center;

            padding: 5px;
          }

          .user-avatar {
            width: 31px;
            height: 31px;
          }

          .create-button {
            font-size: 10px;
          }
        }

        /*
         * ═════════════════════════════════════════════
         * REDUCED MOTION
         * ═════════════════════════════════════════════
         */

        @media (prefers-reduced-motion: reduce) {
          .create-button {
            transition: none;
          }

          .status-light::before {
            animation: none;
          }
        }
      `}</style>

      {/* Ambient background effects */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="dashboard-container">
        {/* ═══════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════ */}

        <header className="dashboard-header">
          {/* Tenant */}
          <div className="tenant-identity">
            <div className="tenant-logo">{tenantInitial}</div>

            <div className="tenant-copy">
              <div className="title-row">
                <h1 className="tenant-name">{tenant.name}</h1>

                <span className="workspace-badge">
                  <span className="workspace-dot" />
                  ERP Workspace
                </span>
              </div>

              <p className="tenant-subtitle">
                Real-time operations & financial overview
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="dashboard-actions">
            {/* System status */}
            <div className="system-status">
              <span className="status-light">
                <span />
              </span>

              <div className="status-copy">
                <strong>All systems operational</strong>
                <span>Live</span>
              </div>
            </div>

            {/* Create invoice */}
            <Link href={`/v1/${tenantSlug}/sales`} className="create-button">
              <span className="create-icon">+</span>

              <span>Create invoice</span>
            </Link>

            {/* User */}
            <div className="user-profile">
              <div className="user-avatar">{userInitial}</div>

              <div className="user-details">
                <span className="user-name">{userName}</span>

                <span className="user-role">Workspace member</span>
              </div>

              <span className="user-chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════
            DASHBOARD CONTENT
        ═══════════════════════════════════════════ */}

        <main className="dashboard-content">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent tenantId={tenant.id} tenantSlug={tenantSlug} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
