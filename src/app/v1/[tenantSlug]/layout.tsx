"use client";
import { LogoMark } from "@/app/page";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const pathname = usePathname();
  const { tenantSlug } = React.use(params);

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

  const isActive = (href: string) => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const target = href.replace(/\/+$/, "") || "/";

    if (target.endsWith("/dashboard")) return path === target;
    return path === target || path.startsWith(`${target}/`);
  };

  return (
    <div className="erp-layout">
      <style>{`
        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          background: #050505;
        }

        body {
          color: #f5f5f5;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        }

        a {
          color: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        /* =====================================================
           LANDING-PAGE LANGUAGE
           Black canvas / lime signal / hairline borders /
           generous spacing / editorial typography /
           restrained system chrome.
        ===================================================== */

        .erp-layout {
          min-height: 100vh;
          background:
            radial-gradient(circle at 72% -10%, rgba(183,255,60,.055), transparent 28%),
            radial-gradient(circle at 10% 35%, rgba(255,255,255,.025), transparent 25%),
            #050505;
        }

        /* =====================================================
           DESKTOP SIDEBAR
        ===================================================== */

        .erp-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 268px;
          z-index: 80;
          display: flex;
          flex-direction: column;
          padding: 30px 18px 22px;
          background:
            linear-gradient(180deg, rgba(10,10,10,.98), rgba(5,5,5,.98));
          border-right: 1px solid rgba(255,255,255,.085);
        }

        .erp-sidebar::after {
          content: "";
          position: absolute;
          top: 0;
          right: -1px;
          width: 1px;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(183,255,60,.18),
            transparent 28%,
            transparent 72%,
            rgba(183,255,60,.04)
          );
          pointer-events: none;
        }

        .erp-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 4px 10px 34px;
        }

        .erp-brand-mark {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid rgba(183,255,60,.22);
          border-radius: 11px;
          background:
            linear-gradient(145deg, rgba(183,255,60,.10), rgba(183,255,60,.02));
          color: #b7ff3c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 0 28px rgba(183,255,60,.05);
        }

        .erp-brand-mark::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 5px;
          right: 5px;
          top: 5px;
          border-radius: 50%;
          background: #b7ff3c;
          box-shadow: 0 0 9px rgba(183,255,60,.7);
        }

        .erp-brand-copy { min-width: 0; }

        .erp-brand-name {
          margin: 0;
          color: #f2f2f2;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -.025em;
        }

        .erp-brand-subtitle {
          margin: 4px 0 0;
          color: #696969;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        .erp-section-label {
          padding: 8px 12px 10px;
          color: #4f4f4f;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .12em;
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
          gap: 13px;
          min-height: 48px;
          padding: 9px 12px;
          border: 1px solid transparent;
          border-radius: 10px;
          color: #777;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition:
            background .2s ease,
            border-color .2s ease,
            color .2s ease,
            transform .2s ease;
        }

        .erp-nav-link:hover {
          background: rgba(255,255,255,.035);
          border-color: rgba(255,255,255,.08);
          color: #eee;
          transform: translateX(2px);
        }

        .erp-nav-link.active {
          color: #e7e7e7;
          background: rgba(183,255,60,.045);
          border-color: rgba(183,255,60,.10);
        }

        .erp-nav-link.active::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          border-radius: 2px;
          background: #b7ff3c;
          box-shadow: 0 0 12px rgba(183,255,60,.55);
        }

        .erp-nav-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px;
          background: rgba(255,255,255,.025);
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          font-weight: 500;
        }

        .erp-nav-link.active .erp-nav-icon,
        .erp-nav-link:hover .erp-nav-icon {
          color: #b7ff3c;
          border-color: rgba(183,255,60,.15);
          background: rgba(183,255,60,.045);
        }

        .erp-sidebar-footer {
          margin-top: auto;
          padding: 18px 10px 2px;
        }

        .erp-system-card {
          position: relative;
          padding: 15px;
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 11px;
          background:
            linear-gradient(145deg, rgba(20,20,20,.8), rgba(9,9,9,.9));
        }

        .erp-system-card::before {
          content: "SYSTEM STATUS";
          display: block;
          margin-bottom: 13px;
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: .12em;
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
          background: #b7ff3c;
          box-shadow: 0 0 10px rgba(183,255,60,.7);
        }

        .erp-system-title {
          color: #bcbcbc;
          font-size: 11px;
          font-weight: 500;
        }

        .erp-system-text {
          margin: 7px 0 0;
          color: #626262;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          line-height: 1.55;
        }

        /* =====================================================
           TOP BAR
        ===================================================== */

        .erp-topbar {
          position: fixed;
          top: 0;
          left: 268px;
          right: 0;
          height: 72px;
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
          background: rgba(5,5,5,.82);
          border-bottom: 1px solid rgba(255,255,255,.075);
          backdrop-filter: blur(22px);
        }

        .erp-topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .erp-topbar-label {
          color: #4f4f4f;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .erp-topbar-divider {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,.10);
        }

        .erp-topbar-current {
          color: #bdbdbd;
          font-size: 13px;
          font-weight: 500;
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
          padding: 6px 11px;
          border: 1px solid rgba(183,255,60,.13);
          border-radius: 999px;
          background: rgba(183,255,60,.035);
          color: #b7ff3c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .erp-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b7ff3c;
          box-shadow: 0 0 9px rgba(183,255,60,.7);
        }

        .erp-tenant-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          max-width: 250px;
          padding: 6px 10px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9px;
          background: rgba(255,255,255,.025);
        }

        .erp-tenant-avatar {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 7px;
          background: #111;
          color: #b7ff3c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 600;
        }

        .erp-tenant-name {
          color: #999;
          font-size: 11px;
          font-weight: 500;
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
          margin-left: 268px;

          background:
            radial-gradient(circle at 75% 0%, rgba(183,255,60,.025), transparent 24%),
            #050505;
        }

        .erp-content {
          width: 100%;
          min-width: 0;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        .erp-mobile-header,
        .erp-mobile-nav {
          display: none;
        }

        @media (max-width: 1100px) {
          .erp-sidebar {
            width: 232px;
          }

          .erp-topbar {
            left: 232px;
            padding: 0 24px;
          }

          .erp-main {
            margin-left: 232px;
          }

          .erp-tenant-pill {
            max-width: 190px;
          }
        }

        @media (max-width: 768px) {
          .erp-sidebar,
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
            background: rgba(5,5,5,.92);
            border-bottom: 1px solid rgba(255,255,255,.075);
            backdrop-filter: blur(20px);
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
            display: grid;
            place-items: center;
            flex-shrink: 0;
            border: 1px solid rgba(183,255,60,.18);
            border-radius: 9px;
            background: rgba(183,255,60,.045);
            color: #b7ff3c;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 13px;
            font-weight: 600;
          }

          .erp-mobile-brand-text {
            color: #eee;
            font-size: 13px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .erp-mobile-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 8px;
            border: 1px solid rgba(183,255,60,.13);
            border-radius: 999px;
            background: rgba(183,255,60,.035);
            color: #b7ff3c;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 8px;
            font-weight: 500;
            letter-spacing: .05em;
          }

          .erp-mobile-status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #b7ff3c;
            box-shadow: 0 0 8px rgba(183,255,60,.7);
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
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 15px;
            background: rgba(10,10,10,.94);
            box-shadow: 0 18px 45px rgba(0,0,0,.6);
            backdrop-filter: blur(20px);
          }

          .erp-mobile-nav-link {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            min-height: 54px;
            padding: 5px 3px;
            border-radius: 10px;
            text-decoration: none;
            color: #666;
            transition: background .18s ease, color .18s ease;
          }

          .erp-mobile-nav-link.active {
            color: #b7ff3c;
            background: rgba(183,255,60,.045);
          }

          .erp-mobile-nav-icon {
            width: 27px;
            height: 27px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 8px;
            background: rgba(255,255,255,.025);
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 11px;
          }

          .erp-mobile-nav-label {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 8px;
            font-weight: 500;
            letter-spacing: .02em;
          }
        }

        @media (max-width: 480px) {
          .erp-mobile-header { padding: 0 14px; }

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

          .erp-mobile-nav-link { min-height: 50px; }
          .erp-mobile-nav-label { font-size: 7px; }
          .erp-mobile-brand-text { max-width: 150px; }
        }
      `}</style>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="erp-sidebar">
        <div className="erp-brand">
          <div>
            {" "}
            <LogoMark />
          </div>

          <div className="erp-brand-copy">
            <div className="erp-brand-name">Ledger Core</div>

            <div className="erp-brand-subtitle">Business Operating System</div>
          </div>
        </div>

        <div className="erp-section-label">Workspace</div>

        <nav className="erp-nav">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`erp-nav-link ${isActive(item.href) ? "active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
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
            className={`erp-mobile-nav-link ${isActive(item.href) ? "active" : ""}`}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className="erp-mobile-nav-icon">{item.icon}</span>

            <span className="erp-mobile-nav-label">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
