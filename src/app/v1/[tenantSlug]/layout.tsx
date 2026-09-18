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
    {
      name: "Dashboard",
      href: `/v1/${tenantSlug}/dashboard`,
      icon: "▦",
    },
    {
      name: "Inventory",
      href: `/v1/${tenantSlug}/inventory`,
      icon: "□",
    },
    {
      name: "Sales",
      href: `/v1/${tenantSlug}/sales`,
      icon: "⌁",
    },
    {
      name: "Procurement",
      href: `/v1/${tenantSlug}/procurement`,
      icon: "◇",
    },
    {
      name: "Customers",
      href: `/v1/${tenantSlug}/customers`,
      icon: "○",
    },
  ];

  return (
    <div className="erp-layout">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          background: #030712;
        }

        body {
          color: #f8fafc;
        }

        a {
          -webkit-tap-highlight-color: transparent;
        }

        /* =====================================================
           DESKTOP SIDEBAR
        ===================================================== */

        .erp-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 248px;
          z-index: 80;
          display: flex;
          flex-direction: column;
          background:
            linear-gradient(
              180deg,
              #080d18 0%,
              #060b14 100%
            );
          border-right: 1px solid #172033;
          padding: 24px 14px;
        }

        .erp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 26px;
        }

        .erp-brand-mark {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              rgba(56, 189, 248, 0.18),
              rgba(56, 189, 248, 0.04)
            );
          border: 1px solid rgba(56, 189, 248, 0.22);
          color: #38bdf8;
          font-size: 16px;
          font-weight: 900;
          box-shadow:
            0 0 25px rgba(56, 189, 248, 0.08);
        }

        .erp-brand-copy {
          min-width: 0;
        }

        .erp-brand-name {
          margin: 0;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .erp-brand-subtitle {
          margin: 3px 0 0;
          color: #475569;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .erp-section-label {
          padding: 10px 12px 8px;
          color: #334155;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.1px;
          text-transform: uppercase;
        }

        .erp-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .erp-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
          transition:
            background-color 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .erp-nav-link:hover {
          background: #0d1422;
          border-color: #1b273a;
          color: #e2e8f0;
          transform: translateX(2px);
        }

        .erp-nav-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          background: #0b1220;
          border: 1px solid #182437;
          color: #64748b;
          font-size: 13px;
          font-weight: 800;
        }

        .erp-nav-link:hover .erp-nav-icon {
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.18);
          background: rgba(56, 189, 248, 0.05);
        }

        .erp-sidebar-footer {
          margin-top: auto;
          padding: 14px 10px 4px;
        }

        .erp-system-card {
          padding: 13px;
          border-radius: 11px;
          background: #0a101c;
          border: 1px solid #172033;
        }

        .erp-system-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .erp-status-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #10b981;
          box-shadow:
            0 0 9px rgba(16, 185, 129, 0.75);
        }

        .erp-system-title {
          color: #cbd5e1;
          font-size: 10px;
          font-weight: 750;
        }

        .erp-system-text {
          margin: 6px 0 0;
          color: #475569;
          font-size: 9px;
          line-height: 1.45;
        }

        /* =====================================================
           TOP BAR
        ===================================================== */

        .erp-topbar {
          position: fixed;
          top: 0;
          left: 248px;
          right: 0;
          height: 68px;
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: rgba(3, 7, 18, 0.88);
          border-bottom: 1px solid #172033;
          backdrop-filter: blur(18px);
        }

        .erp-topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .erp-topbar-label {
          color: #475569;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .erp-topbar-divider {
          width: 1px;
          height: 15px;
          background: #1d2a3e;
        }

        .erp-topbar-current {
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .erp-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .erp-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.16);
          color: #34d399;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .erp-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow:
            0 0 9px rgba(16, 185, 129, 0.75);
        }

        .erp-tenant-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 230px;
          padding: 6px 10px;
          border-radius: 8px;
          background: #0b1220;
          border: 1px solid #172033;
        }

        .erp-tenant-avatar {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #111827;
          color: #38bdf8;
          font-size: 9px;
          font-weight: 850;
          border: 1px solid #22304a;
        }

        .erp-tenant-name {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 650;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .erp-main {
          min-height: 100vh;
          min-width: 0;
          margin-left: 248px;
          padding-top: 68px;
          background:
            radial-gradient(
              circle at top left,
              rgba(56, 189, 248, 0.025),
              transparent 28%
            ),
            #030712;
        }

        .erp-content {
          width: 100%;
          min-width: 0;
        }

        /* =====================================================
           MOBILE TOP NAV
        ===================================================== */

        .erp-mobile-header {
          display: none;
        }

        .erp-mobile-nav {
          display: none;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1050px) {
          .erp-sidebar {
            width: 220px;
          }

          .erp-topbar {
            left: 220px;
          }

          .erp-main {
            margin-left: 220px;
          }

          .erp-topbar {
            padding: 0 22px;
          }

          .erp-tenant-pill {
            max-width: 180px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .erp-sidebar {
            display: none !important;
          }

          .erp-topbar {
            display: none !important;
          }

          .erp-main {
            margin-left: 0 !important;
            padding-top: 64px !important;
            padding-bottom: 78px !important;
          }

          .erp-mobile-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            z-index: 90;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 18px;
            background: rgba(3, 7, 18, 0.93);
            border-bottom: 1px solid #172033;
            backdrop-filter: blur(18px);
          }

          .erp-mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .erp-mobile-brand-mark {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 9px;
            background: rgba(56, 189, 248, 0.06);
            border: 1px solid rgba(56, 189, 248, 0.18);
            color: #38bdf8;
            font-size: 13px;
            font-weight: 900;
          }

          .erp-mobile-brand-text {
            color: #f8fafc;
            font-size: 12px;
            font-weight: 800;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .erp-mobile-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 8px;
            border-radius: 999px;
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.14);
            color: #34d399;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.4px;
          }

          .erp-mobile-status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
            box-shadow:
              0 0 8px rgba(16, 185, 129, 0.75);
          }

          .erp-mobile-nav {
            position: fixed;
            left: 10px;
            right: 10px;
            bottom: 10px;
            z-index: 90;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            padding: 7px;
            background: rgba(7, 12, 22, 0.96);
            border: 1px solid #1b273a;
            border-radius: 15px;
            box-shadow:
              0 18px 45px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(18px);
          }

          .erp-mobile-nav-link {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-height: 54px;
            padding: 5px 3px;
            border-radius: 10px;
            text-decoration: none;
            color: #64748b;
            transition:
              background-color 0.18s ease,
              color 0.18s ease;
          }

          .erp-mobile-nav-link:hover {
            background: #0d1422;
            color: #cbd5e1;
          }

          .erp-mobile-nav-icon {
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #0b1220;
            border: 1px solid #172033;
            font-size: 11px;
            font-weight: 850;
          }

          .erp-mobile-nav-label {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
            font-size: 7px;
            font-weight: 750;
            letter-spacing: 0.2px;
          }
        }

        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 480px) {
          .erp-mobile-header {
            padding: 0 14px;
          }

          .erp-main {
            padding-top: 60px !important;
            padding-bottom: 76px !important;
          }

          .erp-mobile-nav {
            left: 7px;
            right: 7px;
            bottom: 7px;
            padding: 6px;
            border-radius: 14px;
          }

          .erp-mobile-nav-link {
            min-height: 50px;
          }

          .erp-mobile-nav-label {
            font-size: 6.5px;
          }

          .erp-mobile-brand-text {
            max-width: 150px;
          }
        }
      `}</style>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="erp-sidebar">
        <div className="erp-brand">
          <div className="erp-brand-mark">S</div>

          <div className="erp-brand-copy">
            <div className="erp-brand-name">SaaS ERP</div>

            <div className="erp-brand-subtitle">Business Operating System</div>
          </div>
        </div>

        <div className="erp-section-label">Workspace</div>

        <nav className="erp-nav">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="erp-nav-link">
              <span className="erp-nav-icon">{item.icon}</span>

              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="erp-sidebar-footer">
          <div className="erp-system-card">
            <div className="erp-system-top">
              <span className="erp-status-dot" />

              <span className="erp-system-title">ERP Systems Online</span>
            </div>

            <p className="erp-system-text">
              Your workspace is connected and operational.
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP TOP BAR
      ===================================================== */}

      <header className="erp-topbar">
        <div className="erp-topbar-left">
          <span className="erp-topbar-label">Workspace</span>

          <span className="erp-topbar-divider" />

          <span className="erp-topbar-current">Business Operations</span>
        </div>

        <div className="erp-topbar-right">
          <div className="erp-live-pill">
            <span className="erp-live-dot" />
            LIVE SYSTEM
          </div>

          <div className="erp-tenant-pill">
            <div className="erp-tenant-avatar">
              {tenantSlug.charAt(0).toUpperCase()}
            </div>

            <span className="erp-tenant-name">{tenantSlug}</span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="erp-mobile-header">
        <div className="erp-mobile-brand">
          <div className="erp-mobile-brand-mark">S</div>

          <span className="erp-mobile-brand-text">SaaS ERP</span>
        </div>

        <div className="erp-mobile-status">
          <span className="erp-mobile-status-dot" />
          LIVE
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="erp-main">
        <div className="erp-content">{children}</div>
      </main>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav className="erp-mobile-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="erp-mobile-nav-link"
          >
            <span className="erp-mobile-nav-icon">{item.icon}</span>

            <span className="erp-mobile-nav-label">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
