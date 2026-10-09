"use client";

import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Command,
  Home,
  Package,
  PanelLeft,
  Plus,
  Sparkles,
  ShoppingCart,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const pathname = usePathname();
  const { tenantSlug } = React.use(params);

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: `/v1/${tenantSlug}/dashboard`,
      icon: Home,
    },
    {
      name: "Inventory",
      href: `/v1/${tenantSlug}/inventory`,
      icon: Package,
    },
    {
      name: "Sales",
      href: `/v1/${tenantSlug}/sales`,
      icon: ShoppingCart,
    },
    {
      name: "Procurement",
      href: `/v1/${tenantSlug}/procurement`,
      icon: Truck,
    },
    {
      name: "Customers",
      href: `/v1/${tenantSlug}/customers`,
      icon: Users,
    },
    {
      name: "AI",
      href: `/v1/${tenantSlug}/ai`,
      icon: Sparkles,
    },
  ];

  const isActive = (href: string) => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const target = href.replace(/\/+$/, "") || "/";

    if (target.endsWith("/dashboard")) return path === target;
    return path === target || path.startsWith(`${target}/`);
  };

  const currentItem =
    navItems.find((item) => isActive(item.href)) ?? navItems[0];

  const initials = tenantSlug.slice(0, 2).toUpperCase();

  const mobilePrimary = [navItems[0], navItems[1], navItems[2], navItems[5]];

  const mobileMore = [navItems[3], navItems[4]];

  React.useEffect(() => {
    setMobileMoreOpen(false);
  }, [pathname]);

  return (
    <div
      className={`erp-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <style>{`
        :root {
          --erp-sidebar: 252px;
          --erp-sidebar-collapsed: 76px;
          --erp-topbar: 68px;
          --erp-lime: #b7ff3c;
          --erp-bg: #050505;
          --erp-panel: #0b0b0b;
          --erp-panel-2: #0f0f0f;
          --erp-border: rgba(255,255,255,.075);
          --erp-border-strong: rgba(255,255,255,.11);
          --erp-muted: #696969;
        }

        * { box-sizing: border-box; }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          background: var(--erp-bg);
        }

        body {
          color: #f5f5f5;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "SF Pro Display", sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        button,
        input,
        textarea,
        select { font: inherit; }

        button,
        a { -webkit-tap-highlight-color: transparent; }

        a { color: inherit; }

        .erp-layout {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 80% -10%, rgba(183,255,60,.05), transparent 28%),
            radial-gradient(circle at 8% 45%, rgba(255,255,255,.018), transparent 25%),
            var(--erp-bg);
        }

        /* =========================
           SIDEBAR
        ========================= */

        .erp-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 80;
          width: var(--erp-sidebar);
          display: flex;
          flex-direction: column;
          padding: 18px 12px 14px;
          background: rgba(7,7,7,.96);
          border-right: 1px solid var(--erp-border);
          transition: width .22s ease;
          overflow: hidden;
        }

        .erp-sidebar::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,.018), transparent 20%);
        }

        .sidebar-collapsed .erp-sidebar {
          width: var(--erp-sidebar-collapsed);
        }

        .erp-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          height: 46px;
          padding: 0 7px;
          margin-bottom: 25px;
        }

        .erp-brand-mark {
          position: relative;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(183,255,60,.2);
          border-radius: 11px;
          background: linear-gradient(145deg, rgba(183,255,60,.11), rgba(183,255,60,.02));
          color: var(--erp-lime);
          box-shadow: 0 0 28px rgba(183,255,60,.04);
        }

        .erp-brand-mark::after,
        .erp-mobile-brand-mark::after {
          content: "";
          position: absolute;
          top: 4px;
          right: 4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--erp-lime);
          box-shadow: 0 0 9px rgba(183,255,60,.7);
        }

        .erp-brand-mark > div,
        .erp-mobile-brand-mark > div {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
        }

        .erp-brand-copy {
          min-width: 0;
          opacity: 1;
          transition: opacity .15s ease;
        }

        .sidebar-collapsed .erp-brand-copy,
        .sidebar-collapsed .erp-section-label,
        .sidebar-collapsed .erp-nav-text,
        .sidebar-collapsed .erp-sidebar-footer {
          opacity: 0;
          pointer-events: none;
        }

        .erp-brand-name {
          color: #f1f1f1;
          font-size: 14px;
          font-weight: 650;
          letter-spacing: -.025em;
          white-space: nowrap;
        }

        .erp-brand-subtitle {
          margin-top: 3px;
          color: #565656;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7.5px;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .erp-section-label {
          padding: 0 11px 9px;
          color: #474747;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: .13em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity .15s ease;
        }

        .erp-nav {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .erp-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 45px;
          padding: 6px 10px;
          border: 1px solid transparent;
          border-radius: 11px;
          color: #707070;
          text-decoration: none;
          transition: background .16s ease, border-color .16s ease, color .16s ease;
        }

        .erp-nav-link:hover {
          color: #e7e7e7;
          background: rgba(255,255,255,.035);
          border-color: rgba(255,255,255,.06);
        }

        .erp-nav-link.active {
          color: #f0f0f0;
          background: rgba(183,255,60,.055);
          border-color: rgba(183,255,60,.1);
        }

        .erp-nav-link.active::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          border-radius: 2px;
          background: var(--erp-lime);
          box-shadow: 0 0 12px rgba(183,255,60,.55);
        }

        .erp-nav-icon {
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          background: rgba(255,255,255,.02);
          color: #656565;
          transition: color .16s ease, background .16s ease, border-color .16s ease;
        }

        .erp-nav-link:hover .erp-nav-icon,
        .erp-nav-link.active .erp-nav-icon {
          color: var(--erp-lime);
          border-color: rgba(183,255,60,.13);
          background: rgba(183,255,60,.045);
        }

        .erp-nav-text {
          overflow: hidden;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 520;
          transition: opacity .15s ease;
        }

        .erp-collapse {
          position: absolute;
          top: 28px;
          right: -13px;
          z-index: 3;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 50%;
          background: #111;
          color: #777;
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(0,0,0,.45);
          transition: color .16s ease, border-color .16s ease, background .16s ease;
        }

        .erp-collapse:hover {
          color: var(--erp-lime);
          border-color: rgba(183,255,60,.2);
          background: #151515;
        }

        .sidebar-collapsed .erp-collapse {
          right: 8px;
        }

        .erp-sidebar-footer {
          margin-top: auto;
          padding: 12px 7px 0;
          transition: opacity .15s ease;
        }

        .erp-system-card {
          padding: 12px;
          border: 1px solid rgba(255,255,255,.065);
          border-radius: 11px;
          background: linear-gradient(145deg, rgba(20,20,20,.75), rgba(9,9,9,.9));
        }

        .erp-system-top {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .erp-status-dot,
        .erp-live-dot,
        .erp-mobile-status-dot {
          width: 6px;
          height: 6px;
          flex: 0 0 6px;
          border-radius: 50%;
          background: var(--erp-lime);
          box-shadow: 0 0 9px rgba(183,255,60,.7);
        }

        .erp-system-title {
          color: #aaa;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .erp-system-text {
          margin: 6px 0 0;
          color: #565656;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          line-height: 1.5;
        }

        /* =========================
           TOP BAR
        ========================= */

        .erp-topbar {
          position: fixed;
          top: 0;
          right: 0;
          left: var(--erp-sidebar);
          z-index: 70;
          height: var(--erp-topbar);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 26px;
          background: rgba(5,5,5,.78);
          border-bottom: 1px solid var(--erp-border);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          transition: left .22s ease;
        }

        .sidebar-collapsed .erp-topbar {
          left: var(--erp-sidebar-collapsed);
        }

        .erp-topbar-left,
        .erp-topbar-right {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .erp-topbar-left { gap: 10px; }
        .erp-topbar-right { gap: 8px; }

        .erp-topbar-label {
          color: #4b4b4b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .erp-topbar-divider {
          width: 1px;
          height: 15px;
          background: rgba(255,255,255,.1);
        }

        .erp-topbar-current {
          overflow: hidden;
          max-width: 350px;
          color: #c3c3c3;
          font-size: 12px;
          font-weight: 540;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .erp-command-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          background: rgba(255,255,255,.025);
          color: #555;
          cursor: default;
        }

        .erp-command-button span {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
        }

        .erp-command-key {
          padding: 2px 5px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 5px;
          color: #707070;
          font-size: 8px;
        }

        .erp-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 31px;
          padding: 0 10px;
          border: 1px solid rgba(183,255,60,.12);
          border-radius: 999px;
          background: rgba(183,255,60,.032);
          color: var(--erp-lime);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        .erp-tenant-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 210px;
          min-width: 0;
          min-height: 36px;
          padding: 4px 8px 4px 5px;
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 10px;
          background: rgba(255,255,255,.022);
        }

        .erp-tenant-avatar {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(183,255,60,.12);
          border-radius: 8px;
          background: rgba(183,255,60,.045);
          color: var(--erp-lime);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          font-weight: 600;
        }

        .erp-tenant-copy {
          min-width: 0;
        }

        .erp-tenant-label {
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .erp-tenant-name {
          display: block;
          overflow: hidden;
          margin-top: 1px;
          color: #a6a6a6;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .erp-topbar-profile {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.075);
          border-radius: 9px;
          background: rgba(255,255,255,.022);
          color: #696969;
        }

        /* =========================
           MAIN
        ========================= */

        .erp-main {
          min-height: 100dvh;
          min-width: 0;
          margin-left: var(--erp-sidebar);
          padding-top: var(--erp-topbar);
          background:
            radial-gradient(circle at 75% 0%, rgba(183,255,60,.022), transparent 25%),
            var(--erp-bg);
          transition: margin-left .22s ease;
        }

        .sidebar-collapsed .erp-main {
          margin-left: var(--erp-sidebar-collapsed);
        }

        .erp-content {
          width: 100%;
          min-width: 0;
        }

        .erp-main {
          font-size: 15px;
        }

        /* =========================
           MOBILE
        ========================= */

        .erp-mobile-header,
        .erp-mobile-nav,
        .erp-mobile-more {
          display: none;
        }

        @media (max-width: 1100px) {
          :root {
            --erp-sidebar: 224px;
          }

          .erp-topbar {
            padding-inline: 20px;
          }

          .erp-command-button {
            display: none;
          }

          .erp-topbar-current {
            max-width: 280px;
          }
        }

        @media (max-width: 820px) {
          .erp-sidebar,
          .erp-topbar {
            display: none !important;
          }

          .erp-main,
          .sidebar-collapsed .erp-main {
            margin-left: 0;
            padding-top: 58px;
            padding-bottom: 82px;
          }

          .erp-mobile-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 90;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 0 14px;
            background: rgba(5,5,5,.9);
            border-bottom: 1px solid rgba(255,255,255,.075);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
          }

          .erp-mobile-brand {
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
          }

          .erp-mobile-brand-mark {
            position: relative;
            width: 30px;
            height: 30px;
            flex: 0 0 30px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(183,255,60,.18);
            border-radius: 9px;
            background: rgba(183,255,60,.045);
            color: var(--erp-lime);
          }

          .erp-mobile-brand-text {
            min-width: 0;
            overflow: hidden;
            color: #ececec;
            font-size: 11px;
            font-weight: 650;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .erp-mobile-page {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            max-width: 35vw;
            overflow: hidden;
            color: #6e6e6e;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 7px;
            letter-spacing: .08em;
            text-overflow: ellipsis;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .erp-mobile-status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            flex: 0 0 auto;
            padding: 5px 7px;
            border: 1px solid rgba(183,255,60,.12);
            border-radius: 999px;
            background: rgba(183,255,60,.03);
            color: var(--erp-lime);
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 7px;
            letter-spacing: .05em;
            text-transform: uppercase;
          }

          .erp-mobile-status-dot {
            width: 5px;
            height: 5px;
            flex-basis: 5px;
          }

          .erp-mobile-nav {
            position: fixed;
            left: 9px;
            right: 9px;
            bottom: max(8px, env(safe-area-inset-bottom));
            z-index: 90;
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 3px;
            padding: 5px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 17px;
            background: rgba(10,10,10,.94);
            box-shadow: 0 18px 50px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.04) inset;
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
          }

          .erp-mobile-nav-link {
            position: relative;
            min-width: 0;
            min-height: 54px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 4px 2px;
            border-radius: 12px;
            color: #606060;
            text-decoration: none;
            transition: background .16s ease, color .16s ease, transform .16s ease;
          }

          .erp-mobile-nav-link:active {
            transform: scale(.95);
          }

          .erp-mobile-nav-link.active {
            color: var(--erp-lime);
            background: rgba(183,255,60,.055);
          }

          .erp-mobile-nav-link.active::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 3px;
            width: 13px;
            height: 2px;
            border-radius: 99px;
            transform: translateX(-50%);
            background: var(--erp-lime);
            box-shadow: 0 0 8px rgba(183,255,60,.55);
          }

          .erp-mobile-nav-icon {
            width: 25px;
            height: 25px;
            display: grid;
            place-items: center;
          }

          .erp-mobile-nav-label {
            width: 100%;
            overflow: hidden;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: "SFMono-Regular", Consolas, monospace;
            font-size: 9px;
            font-weight: 500;
          }

          .erp-mobile-more {
            position: fixed;
            left: 10px;
            right: 10px;
            bottom: 76px;
            z-index: 89;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 8px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 15px;
            background: rgba(12,12,12,.97);
            box-shadow: 0 20px 55px rgba(0,0,0,.6);
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
          }

          .erp-mobile-more-link {
            display: flex;
            align-items: center;
            gap: 9px;
            min-height: 48px;
            padding: 8px 10px;
            border: 1px solid rgba(255,255,255,.065);
            border-radius: 10px;
            background: rgba(255,255,255,.02);
            color: #888;
            text-decoration: none;
            font-size: 11px;
          }

          .erp-mobile-more-link.active {
            color: var(--erp-lime);
            border-color: rgba(183,255,60,.12);
            background: rgba(183,255,60,.045);
          }

          .erp-mobile-more-close {
            position: absolute;
            right: 7px;
            top: -35px;
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 50%;
            background: #111;
            color: #777;
          }
        }

        @media (max-width: 480px) {
          .erp-main,
          .sidebar-collapsed .erp-main {
            padding-top: 55px;
            padding-bottom: 79px;
          }

          .erp-mobile-header {
            height: 55px;
            padding-inline: 12px;
          }

          .erp-mobile-page {
            display: none;
          }

          .erp-mobile-nav {
            left: 6px;
            right: 6px;
            bottom: max(6px, env(safe-area-inset-bottom));
            padding: 4px;
            border-radius: 15px;
          }

          .erp-mobile-nav-link {
            min-height: 51px;
          }

          .erp-mobile-nav-label {
            font-size: 8px;
          }

          .erp-mobile-more {
            left: 7px;
            right: 7px;
            bottom: 70px;
          }
        }

        @media (max-width: 360px) {
          .erp-mobile-status {
            display: none;
          }

          .erp-mobile-nav-link {
            min-height: 49px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .erp-sidebar,
          .erp-topbar,
          .erp-main,
          .erp-nav-link,
          .erp-mobile-nav-link {
            transition: none;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="erp-sidebar">
        <div className="erp-brand">
          <div className="erp-brand-copy">
            <div className="erp-brand-name">Ledger Core</div>
            <div className="erp-brand-subtitle">Business Operating System</div>
          </div>

          <button
            type="button"
            className="erp-collapse"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={13} strokeWidth={1.8} />
            ) : (
              <ChevronLeft size={13} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <div className="erp-section-label">Workspace</div>

        <nav className="erp-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`erp-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <span className="erp-nav-icon">
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <span className="erp-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="erp-sidebar-footer">
          <div className="erp-system-card">
            <div className="erp-system-top">
              <span className="erp-status-dot" />
              <span className="erp-system-title">Systems operational</span>
            </div>
            <p className="erp-system-text">
              Workspace connected and running normally.
            </p>
          </div>
        </div>
      </aside>

      {/* Desktop top bar */}
      <header className="erp-topbar">
        <div className="erp-topbar-left">
          <span className="erp-topbar-label">Ledger Core</span>
          <span className="erp-topbar-divider" />
          <span className="erp-topbar-current">{currentItem.name}</span>
        </div>

        <div className="erp-topbar-right">
          <div className="erp-command-button" aria-hidden="true">
            <Command size={12} strokeWidth={1.5} />
            <span>Quick actions</span>
            <span className="erp-command-key">⌘ K</span>
          </div>

          <div className="erp-live-pill">
            <span className="erp-live-dot" />
            Live
          </div>

          <div className="erp-tenant-pill">
            <div className="erp-tenant-avatar">{initials}</div>
            <div className="erp-tenant-copy">
              <div className="erp-tenant-label">Workspace</div>
              <span className="erp-tenant-name">{tenantSlug}</span>
            </div>
            <ChevronDown size={13} color="#555" />
          </div>

          <div className="erp-topbar-profile" aria-hidden="true">
            <CircleUserRound size={17} strokeWidth={1.5} />
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="erp-mobile-header">
        <div className="erp-mobile-brand">
          <span className="erp-mobile-brand-text">Ledger Core</span>
        </div>

        <div className="erp-mobile-page">{currentItem.name}</div>

        <div className="erp-mobile-status">
          <span className="erp-mobile-status-dot" />
          Live
        </div>
      </header>

      {/* Main page content */}
      <main className="erp-main">
        <div className="erp-content">{children}</div>
      </main>

      {/* Mobile "more" menu */}
      {mobileMoreOpen && (
        <div className="erp-mobile-more">
          <button
            type="button"
            className="erp-mobile-more-close"
            onClick={() => setMobileMoreOpen(false)}
            aria-label="Close menu"
          >
            <X size={13} strokeWidth={1.7} />
          </button>

          {mobileMore.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`erp-mobile-more-link ${active ? "active" : ""}`}
                onClick={() => setMobileMoreOpen(false)}
              >
                <Icon size={16} strokeWidth={1.7} />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="erp-mobile-nav" aria-label="Mobile navigation">
        {mobilePrimary.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`erp-mobile-nav-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="erp-mobile-nav-icon">
                <Icon size={17} strokeWidth={1.65} />
              </span>
              <span className="erp-mobile-nav-label">{item.name}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className={`erp-mobile-nav-link ${
            mobileMoreOpen || mobileMore.some((item) => isActive(item.href))
              ? "active"
              : ""
          }`}
          onClick={() => setMobileMoreOpen((value) => !value)}
          aria-expanded={mobileMoreOpen}
        >
          <span className="erp-mobile-nav-icon">
            {mobileMoreOpen ? (
              <X size={17} strokeWidth={1.65} />
            ) : (
              <Plus size={17} strokeWidth={1.65} />
            )}
          </span>
          <span className="erp-mobile-nav-label">More</span>
        </button>
      </nav>
    </div>
  );
}
