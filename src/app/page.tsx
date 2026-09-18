"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Module = {
  id: string;
  code: string;
  title: string;
  summary: string;
  metric: string;
  metricLabel: string;
  status: string;
  bullets: string[];
};

const modules: Module[] = [
  {
    id: "sales",
    code: "01",
    title: "Sales & Client Invoicing",
    summary:
      "A connected billing workflow that keeps invoices, payments, clients, and financial records moving together.",
    metric: "142,850",
    metricLabel: "PROCESSED VOLUME",
    status: "LIVE",
    bullets: [
      "Digital invoice generation",
      "Tax & multi-currency support",
      "Client payment tracking",
      "Line-item & SKU control",
    ],
  },
  {
    id: "warehouse",
    code: "02",
    title: "Warehouse & Inventory",
    summary:
      "A single inventory layer for stock visibility, valuation, locations, and replenishment.",
    metric: "1,240",
    metricLabel: "UNITS IN STOCK",
    status: "OPTIMIZED",
    bullets: [
      "Inventory importing",
      "Low-stock detection",
      "FIFO / LIFO / weighted average",
      "Barcode & serial traceability",
    ],
  },
  {
    id: "procurement",
    code: "03",
    title: "Procurement & Purchase Orders",
    summary:
      "Keep purchasing connected to vendors, approvals, commitments, and the inventory that arrives.",
    metric: "38,400",
    metricLabel: "OPEN COMMITMENTS",
    status: "TRACKING",
    bullets: [
      "Supplier performance",
      "PO-to-inventory matching",
      "Expense-linked purchasing",
      "Approval & spending controls",
    ],
  },
  {
    id: "risk",
    code: "04",
    title: "AR Aging & Risk Control",
    summary:
      "Understand outstanding receivables before they become a problem with visibility into every aging bucket.",
    metric: "12,150",
    metricLabel: "OUTSTANDING RISK",
    status: "SECURED",
    bullets: [
      "Automated aging breakdown",
      "Customer risk visibility",
      "Collection reminders",
      "Doubtful debt provisioning",
    ],
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const documentHeight = document.documentElement.scrollHeight;

      const viewportHeight = window.innerHeight;

      const maxScroll = documentHeight - viewportHeight;

      setProgress(maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0);

      frame = 0;
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onScroll);

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return progress;
}

function usePointer() {
  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setPointer({
        x: event.clientX / window.innerWidth - 0.5,

        y: event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return pointer;
}

function useReveal() {
  const [visible, setVisible] = useState(new Set<string>());

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
            const id = entry.target.getAttribute("data-reveal");

            if (id) {
              setVisible((current) => {
                const next = new Set(current);

                next.add(id);

                return next;
              });
            }
          }
        });
      },
      {
        threshold: [0.12, 0.3],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return visible;
}

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;

    const start = performance.now();

    const duration = 1200;

    const animate = (timestamp: number) => {
      const progress = clamp((timestamp - start) / duration);

      const eased = 1 - Math.pow(1 - progress, 4);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

function LogoMark() {
  return (
    <span className="logo-mark">
      <i />
      <i />
      <i />
    </span>
  );
}

function Noise() {
  return <div className="noise" aria-hidden="true" />;
}

/* ============================================================
   HERO DASHBOARD
============================================================ */

function HeroDashboard({
  activeModule,
  pointer,
}: {
  activeModule: number;
  pointer: {
    x: number;
    y: number;
  };
}) {
  const module = modules[activeModule];

  return (
    <div
      className="hero-dashboard-wrap"
      style={{
        transform: `
          perspective(1800px)
          rotateX(${pointer.y * -1.2}deg)
          rotateY(${pointer.x * 2}deg)
        `,
      }}
    >
      <div className="hero-dashboard-shadow" />

      <div className="hero-dashboard">
        {/* browser bar */}

        <div className="window-bar">
          <div className="window-controls">
            <span />
            <span />
            <span />
          </div>

          <div className="window-url">
            ledgercore.com / workspace /{module.id}
          </div>

          <div className="window-status">
            <span />
            LIVE
          </div>
        </div>

        {/* content */}

        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <div className="dashboard-brand">
              <LogoMark />
              <span>LEDGERCORE</span>
            </div>

            <div className="dashboard-nav">
              {modules.map((item, index) => (
                <div
                  key={item.id}
                  className={`dashboard-nav-item ${
                    activeModule === index ? "active" : ""
                  }`}
                >
                  <span>{item.code}</span>

                  <strong>{item.title.split(" ")[0]}</strong>
                </div>
              ))}
            </div>

            <div className="dashboard-sidebar-bottom">
              <span />
              SYSTEM HEALTH
              <strong>100%</strong>
            </div>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-topline">
              <div>
                <span>ACTIVE SYSTEM</span>

                <h3>{module.title}</h3>
              </div>

              <div className="dashboard-date">
                SEP 18, 2026
                <br />
                17:42
              </div>
            </div>

            <div className="dashboard-stats">
              <div>
                <span>{module.metricLabel}</span>

                <strong>{module.metric}</strong>
              </div>

              <div>
                <span>STATUS</span>

                <strong className="green-text">{module.status}</strong>
              </div>

              <div>
                <span>SYSTEM SYNC</span>

                <strong>99.98%</strong>
              </div>
            </div>

            <div className="dashboard-chart">
              <div className="chart-background" />

              <svg viewBox="0 0 900 280" preserveAspectRatio="none">
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />

                    <stop offset="50%" stopColor="rgba(255,255,255,0.85)" />

                    <stop offset="100%" stopColor="rgba(255,255,255,1)" />
                  </linearGradient>
                </defs>

                <path
                  d="
                    M0 220
                    C60 218 74 160 130 175
                    C182 188 197 115 250 135
                    C301 155 315 88 362 105
                    C420 125 438 175 492 142
                    C540 111 562 145 614 112
                    C672 74 694 118 741 78
                    C788 36 821 63 900 18
                  "
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                />
              </svg>

              <div className="chart-point chart-point-a" />
              <div className="chart-point chart-point-b" />
              <div className="chart-point chart-point-c" />

              <div className="chart-floating-value">+18.4%</div>
            </div>

            <div className="dashboard-bottom-grid">
              <div className="dashboard-bars">
                {[34, 48, 42, 61, 52, 67, 58, 76, 69, 89, 77, 94].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  ),
                )}
              </div>

              <div className="dashboard-feed">
                <div>
                  <span />
                  Ledger synchronized
                </div>

                <div>
                  <span />
                  Automated reconciliation
                </div>

                <div>
                  <span />
                  Data integrity verified
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-footer">
          <span>ENCRYPTED SESSION</span>

          <span>API 23ms</span>

          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SYSTEM MAP
============================================================ */

function SystemMap({
  activeModule,
  setActiveModule,
}: {
  activeModule: number;
  setActiveModule: (index: number) => void;
}) {
  return (
    <div className="system-map">
      <div className="map-aura" />

      <div className="map-ring ring-a" />
      <div className="map-ring ring-b" />
      <div className="map-ring ring-c" />

      <div className="map-center">
        <div className="map-core">
          <div>
            <LogoMark />
          </div>

          <strong>ERP</strong>

          <span>CORE</span>
        </div>
      </div>

      {modules.map((module, index) => {
        const positions = [
          {
            top: "2%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          {
            top: "50%",
            right: "2%",
            transform: "translateY(-50%)",
          },
          {
            bottom: "2%",
            left: "50%",
            transform: "translateX(-50%)",
          },
          {
            top: "50%",
            left: "2%",
            transform: "translateY(-50%)",
          },
        ];

        return (
          <button
            key={module.id}
            className={`map-node ${activeModule === index ? "active" : ""}`}
            style={positions[index]}
            onClick={() => setActiveModule(index)}
          >
            <span className="map-node-number">{module.code}</span>

            <strong>{module.title.split(" & ")[0]}</strong>

            <small>{module.status}</small>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   MODULE VISUALS
============================================================ */

function SalesVisual() {
  const invoices = [
    ["INV-02481", "12,840", "PAID"],
    ["INV-02480", "8,420", "PAID"],
    ["INV-02479", "18,920", "PENDING"],
  ];

  return (
    <div className="visual-card sales-card">
      <div className="visual-card-header">
        <span>TRANSACTION FLOW</span>

        <small>LIVE</small>
      </div>

      <div className="sales-stack">
        {invoices.map(([id, amount, status], index) => (
          <div
            key={id}
            className="invoice"
            style={{
              transform: `translateY(${index * 20}px) translateX(${
                index * 12
              }px) rotate(${index === 1 ? 0 : index === 0 ? -1.5 : 1}deg)`,
            }}
          >
            <div className="invoice-top">
              <span>{id}</span>

              <em
                className={
                  status === "PAID" ? "invoice-paid" : "invoice-pending"
                }
              >
                {status}
              </em>
            </div>

            <strong>{amount}</strong>

            <div className="invoice-lines">
              <span />
              <span />
              <span />
            </div>

            <small>CLIENT LEDGER</small>
          </div>
        ))}
      </div>

      <div className="sales-flow">
        <div>
          <span />
          <strong>Invoice</strong>

          <small>Generated</small>
        </div>

        <div>
          <span />
          <strong>Ledger</strong>

          <small>Synced</small>
        </div>

        <div>
          <span />
          <strong>Payment</strong>

          <small>Reconciled</small>
        </div>
      </div>
    </div>
  );
}

function InventoryVisual() {
  return (
    <div className="visual-card inventory-card">
      <div className="inventory-grid">
        {Array.from({
          length: 49,
        }).map((_, index) => {
          const occupied = index % 7 === 0 || index % 11 === 0;

          const warning = index % 13 === 0;

          return (
            <span
              key={index}
              className={occupied ? "occupied" : warning ? "warning" : ""}
            >
              {occupied && <i />}
            </span>
          );
        })}
      </div>

      <div className="inventory-scanner">
        <div className="scan-line" />

        <div className="scan-target">
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="scan-copy">
          <strong>LOCATION A-14</strong>

          <span>BARCODE VERIFIED</span>
        </div>
      </div>

      <div className="inventory-stats">
        <div>
          <span>AVAILABLE</span>

          <strong>1,240</strong>
        </div>

        <div>
          <span>RESERVED</span>

          <strong>184</strong>
        </div>

        <div>
          <span>LOW STOCK</span>

          <strong>12</strong>
        </div>
      </div>
    </div>
  );
}

function ProcurementVisual() {
  const steps = [
    ["REQUEST", "PR-0841"],
    ["APPROVAL", "FIN-291"],
    ["PURCHASE", "PO-4832"],
    ["RECEIVE", "GRN-912"],
    ["LEDGER", "SYNC"],
  ];

  return (
    <div className="visual-card procurement-card">
      <div className="procurement-intro">
        <span>PURCHASE PIPELINE</span>

        <strong>Request → Receipt</strong>
      </div>

      <div className="procurement-track">
        <div className="procurement-progress" />

        {steps.map(([label, id], index) => (
          <div
            className="procurement-step"
            key={label}
            style={{
              animationDelay: `${index * 110}ms`,
            }}
          >
            <div className="procurement-circle">
              {String(index + 1).padStart(2, "0")}
            </div>

            <span>{label}</span>

            <strong>{id}</strong>
          </div>
        ))}
      </div>

      <div className="vendor-card">
        <div>
          <span>PRIMARY VENDOR</span>

          <strong>GLOBAL SUPPLY CO.</strong>
        </div>

        <div>
          <span>COMMITTED</span>

          <strong>38,400</strong>
        </div>

        <div>
          <span>DELIVERY</span>

          <strong>21 SEP</strong>
        </div>
      </div>
    </div>
  );
}

function RiskVisual() {
  return (
    <div className="visual-card risk-card">
      <div className="risk-radar">
        <div className="radar-ring radar-one" />
        <div className="radar-ring radar-two" />
        <div className="radar-ring radar-three" />

        <div className="radar-line radar-x" />
        <div className="radar-line radar-y" />

        <div className="radar-sweep" />

        <span className="risk-point point-a" />
        <span className="risk-point point-b" />
        <span className="risk-point point-c" />
        <span className="risk-point point-d" />
        <span className="risk-point point-e" />

        <div className="radar-core">AR</div>
      </div>

      <div className="risk-info">
        <span>PORTFOLIO EXPOSURE</span>

        <strong>
          12,150
          <small>OUTSTANDING</small>
        </strong>

        <div className="aging">
          <div>
            <span>0–30</span>

            <i
              style={{
                width: "82%",
              }}
            />
          </div>

          <div>
            <span>31–60</span>

            <i
              style={{
                width: "54%",
              }}
            />
          </div>

          <div>
            <span>61–90</span>

            <i
              style={{
                width: "29%",
              }}
            />
          </div>

          <div>
            <span>90+</span>

            <i
              style={{
                width: "12%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleVisual({ index }: { index: number }) {
  if (index === 0) {
    return <SalesVisual />;
  }

  if (index === 1) {
    return <InventoryVisual />;
  }

  if (index === 2) {
    return <ProcurementVisual />;
  }

  return <RiskVisual />;
}

/* ============================================================
   MAIN
============================================================ */

export default function Home() {
  const scrollProgress = useScrollProgress();

  const pointer = usePointer();

  const visible = useReveal();

  const [activeModule, setActiveModule] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);

  const moduleRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    moduleRefs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            setActiveModule(index);
          }
        },
        {
          threshold: [0.35, 0.6],
        },
      );

      observer.observe(element);

      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const active = modules[activeModule];

  const heroState = useMemo(() => {
    const progress = clamp(scrollProgress * 5);

    return {
      opacity: 1 - progress * 0.82,

      transform: `
          translateY(${progress * -80}px)
          scale(${1 - progress * 0.04})
        `,
    };
  }, [scrollProgress]);

  return (
    <main className="page">
      <Noise />

      <div className="page-gradient" />
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            <LogoMark />

            <span>LedgerCore</span>
          </Link>

          <div className="header-status">
            <span />

            <span>SYSTEM OPERATIONAL</span>
          </div>

          <nav className={`site-nav ${menuOpen ? "open" : ""}`}>
            <Link href="#systems">Systems</Link>

            <Link href="#modules">Modules</Link>

            <Link href="#architecture">Architecture</Link>
            {/* 
            <Link href="/login" className="nav-signin">
              Sign In
            </Link> */}

            <Link href="#" className="nav-cta">
              <span>Coming soon</span>

              <span>→</span>
            </Link>
          </nav>

          <button
            className={`menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="hero">
        <div className="hero-grid" />

        <div className="hero-content" style={heroState}>
          <div className="hero-eyebrow">
            <span>ERP / OPERATING SYSTEM</span>

            <i />

            <span>FOR MODERN BUSINESS</span>
          </div>

          <h1>
            Business
            <br />
            <span>in motion.</span>
          </h1>

          <p className="hero-description">
            One operating layer for sales, inventory, procurement, and financial
            control.
          </p>

          <div className="hero-actions">
            {/* <Link href="/login" className="hero-primary">
              Sign in
              <span>→</span>
            </Link> */}
            <Link href="/#" className="hero-primary">
              Coming soon
              <span>→</span>
            </Link>

            <a href="#systems" className="hero-secondary">
              Explore the system
              <span>↓</span>
            </a>
          </div>
        </div>

        <div
          className={`hero-screen ${visible.has("hero-screen") ? "visible" : ""}`}
          data-reveal="hero-screen"
        >
          <HeroDashboard activeModule={activeModule} pointer={pointer} />
        </div>

        <div className="hero-meta">
          <span>ERP_CORE / 2026</span>

          <div className="hero-scroll">
            <span>SCROLL TO EXPLORE</span>

            <i />
          </div>

          <span>01 — 04</span>
        </div>
      </section>

      {/* ======================================================
          INTRO
      ====================================================== */}

      <section className="intro-section" id="systems">
        <div className="section-container">
          <div className="section-kicker">
            <span>01</span>

            <span>THE OPERATING LAYER</span>
          </div>

          <div className="intro-layout">
            <div
              data-reveal="intro-title"
              className={`intro-title ${
                visible.has("intro-title") ? "visible" : ""
              }`}
            >
              <h2>
                Every part
                <br />
                <span>connected.</span>
              </h2>
            </div>

            <div
              data-reveal="intro-copy"
              className={`intro-copy ${
                visible.has("intro-copy") ? "visible" : ""
              }`}
            >
              <p>
                Businesses move through thousands of small events every day.
              </p>

              <p>
                A sale changes inventory. Inventory changes purchasing.
                Purchasing changes cash flow.
              </p>

              <p>LedgerCore keeps those movements connected.</p>

              <div className="integrity">
                <div className="integrity-line">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <div>
                  <strong>
                    <Counter value={99.98} />%
                  </strong>

                  <span>DATA INTEGRITY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ARCHITECTURE
      ====================================================== */}

      <section className="architecture" id="architecture">
        <div className="section-container">
          <div
            className={`architecture-header ${
              visible.has("architecture-header") ? "visible" : ""
            }`}
            data-reveal="architecture-header"
          >
            <div>
              <div className="section-kicker">
                <span>02</span>

                <span>SYSTEM ARCHITECTURE</span>
              </div>

              <h2>
                Four systems.
                <br />
                <span>One source of truth.</span>
              </h2>
            </div>

            <p>
              Select a subsystem.
              <br />
              The operating layer reorganizes around it.
            </p>
          </div>

          <div
            className={`architecture-map-wrap ${
              visible.has("system-map") ? "visible" : ""
            }`}
            data-reveal="system-map"
          >
            <SystemMap
              activeModule={activeModule}
              setActiveModule={setActiveModule}
            />
          </div>

          <div className="architecture-footer">
            <span>ACTIVE SYSTEM</span>

            <strong>
              {active.code} — {active.title}
            </strong>

            <span>CONNECTED / 04</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          MODULES
      ====================================================== */}

      <section className="modules" id="modules">
        {modules.map((module, index) => {
          const isActive = activeModule === index;

          return (
            <section
              key={module.id}
              ref={(element) => {
                moduleRefs.current[index] = element;
              }}
              className={`module-section ${isActive ? "active" : ""}`}
            >
              <div className="module-inner">
                <div className="module-header">
                  <span>{module.code} / SYSTEM</span>

                  <span>{String(index + 1).padStart(2, "0")} / 04</span>
                </div>

                <div className="module-layout">
                  <div className="module-copy">
                    <div className="module-status">
                      <i />

                      {module.status}
                    </div>

                    <h2>{module.title}</h2>

                    <p>{module.summary}</p>

                    <div className="module-number">
                      <span>{module.metricLabel}</span>

                      <strong>{module.metric}</strong>
                    </div>

                    <div className="module-features">
                      {module.bullets.map((bullet, bulletIndex) => (
                        <div key={bullet}>
                          <span>
                            {String(bulletIndex + 1).padStart(2, "0")}
                          </span>

                          <p>{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="module-visual">
                    <ModuleVisual
                      key={`${module.id}-${isActive}`}
                      index={index}
                    />
                  </div>
                </div>

                <div className="module-footer">
                  <span>LEDGERCORE / {module.id}</span>

                  <div className="module-progress">
                    <i
                      style={{
                        width: `${((index + 1) / modules.length) * 100}%`,
                      }}
                    />
                  </div>

                  <span>
                    {String(index + 1).padStart(2, "0")} —{" "}
                    {String(modules.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </section>

      {/* ======================================================
          LIVE CONTROL
      ====================================================== */}

      <section className="control-section">
        <div className="section-container">
          <div className="control-layout">
            <div
              className={`control-title ${
                visible.has("control-title") ? "visible" : ""
              }`}
              data-reveal="control-title"
            >
              <div className="section-kicker">
                <span>03</span>

                <span>CONTINUOUS CONTROL</span>
              </div>

              <h2>
                The numbers
                <br />
                <span>move with you.</span>
              </h2>
            </div>

            <div
              className={`control-stream ${
                visible.has("control-stream") ? "visible" : ""
              }`}
              data-reveal="control-stream"
            >
              {[
                ["SALES", "142,850", "+18.4%"],
                ["INVENTORY", "1,240 UNITS", "+6.8%"],
                ["PROCUREMENT", "38,400", "12 OPEN"],
                ["AR RISK", "12,150", "3 OVERDUE"],
              ].map((row) => (
                <div key={row[0]} className="stream-row">
                  <span>{row[0]}</span>

                  <i />

                  <strong>{row[1]}</strong>

                  <em>{row[2]}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="final-section">
        <div className="final-grid" />
        <div className="final-glow" />

        <div className="section-container">
          <div className="final-content">
            <div className="section-kicker">
              <span>04</span>

              <span>DEPLOY YOUR OPERATING LAYER</span>
            </div>

            <h2>
              Make the
              <br />
              <span>business visible.</span>
            </h2>

            <p>
              Replace disconnected workflows with one system that understands
              how every part of your business moves.
            </p>

            <Link href="/login" className="final-button">
              <span>Enter LedgerCore</span>

              <strong>→</strong>
            </Link>
          </div>

          <div className="final-orbit">
            <div />
            <div />
            <div />

            <span>ERP</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="site-footer">
        <div className="section-container">
          <div className="footer-top">
            <div className="footer-brand">
              <LogoMark />

              <span>LedgerCore</span>
            </div>

            <span>OPERATIONAL INTELLIGENCE / 2026</span>

            <span>ALL SYSTEMS NOMINAL</span>
          </div>

          <div className="footer-bottom">
            <span>© 2026 ERP_CORE</span>

            {/* <div>
              <Link href="/login">SIGN IN</Link>

              <Link href="/dashboard-redirect">DASHBOARD →</Link>
            </div> */}
          </div>
        </div>
      </footer>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style jsx global>{`
        :root {
          --background: #000000;
          --surface: #0a0a0a;
          --surface-light: #111111;
          --text: #f5f5f7;
          --muted: #86868b;
          --dim: #48484a;
          --line: rgba(255, 255, 255, 0.09);
          --line-soft: rgba(255, 255, 255, 0.05);
          --accent: #d9ff43;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          background: var(--background);
        }

        body {
          margin: 0;
          background: var(--background);
          color: var(--text);
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "SF Pro Text",
            system-ui,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
        }

        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(255, 255, 255, 0.035),
              transparent 30%
            ),
            #000;
        }

        .page-gradient {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.008) 42%,
            transparent 100%
          );
        }

        .noise {
          position: fixed;
          inset: 0;
          z-index: 1000;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E");
          mix-blend-mode: screen;
        }

        .ambient {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(120px);
        }

        .ambient-a {
          left: -300px;
          top: 25%;
          background: rgba(255, 255, 255, 0.08);
        }

        .ambient-b {
          right: -350px;
          top: 48%;
          background: rgba(217, 255, 67, 0.025);
        }

        /* ======================================================
           REVEALS
        ====================================================== */

        [data-reveal] {
          opacity: 0;
          transform: translateY(45px);
          transition:
            opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        [data-reveal].visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Hero screen has its own reveal transform so the dashboard's
           pointer-controlled transform remains independent. */
        .hero-screen[data-reveal] {
          transform: translateY(40px) scale(0.985);
          transition:
            opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-screen[data-reveal].visible {
          transform: translateY(0) scale(1);
        }

        /* Prevent reveal-hidden sections from blocking their contents. */
        .architecture-map-wrap[data-reveal] {
          will-change: opacity, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal],
          .hero-screen[data-reveal] {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* ======================================================
           LOGO
        ====================================================== */

        .logo-mark {
          position: relative;
          width: 21px;
          height: 21px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
        }

        .logo-mark i {
          display: block;
          width: 4px;
          border-radius: 2px;
          background: #f5f5f7;
        }

        .logo-mark i:nth-child(1) {
          height: 8px;
          opacity: 0.35;
        }

        .logo-mark i:nth-child(2) {
          height: 14px;
          opacity: 0.65;
        }

        .logo-mark i:nth-child(3) {
          height: 20px;
        }

        /* ======================================================
           HEADER
        ====================================================== */

        .site-header {
          position: fixed;
          top: 16px;
          left: 50%;
          z-index: 100;
          width: min(1180px, calc(100% - 32px));
          transform: translateX(-50%);
        }

        .site-header-inner {
          position: relative;
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 8px 0 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: rgba(12, 12, 12, 0.65);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow:
            0 16px 50px rgba(0, 0, 0, 0.35),
            inset 0 1px rgba(255, 255, 255, 0.04);
        }

        .site-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #eee;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .header-status {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          color: #666;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .header-status span:first-child {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px rgba(217, 255, 67, 0.7);
          animation: statusPulse 2.5s ease-in-out infinite;
        }

        .site-nav {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-left: auto;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          color: #777;
        }

        .site-nav a {
          transition:
            color 0.25s ease,
            transform 0.25s ease;
        }

        .site-nav a:hover {
          color: #fff;
        }

        .nav-signin {
          margin-left: 5px;
          color: #aaa;
        }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f5f5f7;
          color: #050505 !important;
          font-weight: 600;
          transition:
            transform 0.25s ease,
            background-color 0.25s ease;
        }

        .nav-cta:hover {
          transform: translateY(-1px);
          background: #fff;
        }

        .nav-cta span:last-child {
          font-size: 13px;
        }

        .menu-button {
          display: none;
        }

        /* ======================================================
           HERO
        ====================================================== */

        .hero {
          position: relative;
          z-index: 1;
          min-height: 125vh;
          padding: 160px 24px 70px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          isolation: isolate;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.22;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 90px 90px;
          mask-image: linear-gradient(to bottom, black 0%, transparent 78%);
        }

        .hero-content {
          position: relative;
          z-index: 3;
          width: min(1120px, 100%);
          margin: 0 auto;
          will-change: opacity, transform;
        }

        .hero-eyebrow,
        .section-kicker {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #666;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: 0.13em;
        }

        .hero-eyebrow i {
          width: 26px;
          height: 1px;
          background: #343434;
        }

        .hero h1 {
          max-width: 1100px;
          margin: 30px 0 0;
          font-size: clamp(76px, 11.6vw, 170px);
          line-height: 0.83;
          letter-spacing: -0.085em;
          font-weight: 500;
        }

        .hero h1 span {
          color: #666;
        }

        .hero-description {
          max-width: 410px;
          margin: 38px 0 0 5px;
          color: #858585;
          font-size: 14px;
          line-height: 1.75;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 26px;
          margin: 32px 0 0 5px;
        }

        .hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 17px;
          padding: 13px 18px;
          border-radius: 999px;
          background: #f5f5f7;
          color: #050505;
          font-size: 10px;
          font-weight: 600;
          transition:
            transform 0.3s ease,
            background-color 0.3s ease;
        }

        .hero-primary:hover {
          transform: translateY(-2px);
          background: #fff;
        }

        .hero-primary span {
          font-size: 15px;
        }

        .hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #666;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          transition: color 0.25s ease;
        }

        .hero-secondary:hover {
          color: #fff;
        }

        .hero-secondary span {
          font-size: 13px;
        }

        .hero-screen {
          position: relative;
          z-index: 4;
          width: min(1060px, 94%);
          margin: 90px auto 0;
        }

        .hero-dashboard-wrap {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.25s ease-out;
          will-change: transform;
        }

        .hero-dashboard-shadow {
          position: absolute;
          left: 15%;
          bottom: -15%;
          width: 70%;
          height: 60%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          filter: blur(100px);
          opacity: 0.3;
        }

        .hero-dashboard {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          background: #080808;
          overflow: hidden;
          box-shadow:
            0 60px 140px rgba(0, 0, 0, 0.78),
            0 0 0 1px rgba(255, 255, 255, 0.025);
        }

        .window-bar {
          height: 48px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid var(--line);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .window-controls {
          display: flex;
          gap: 5px;
        }

        .window-controls span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #363636;
        }

        .window-url {
          text-align: center;
          color: #454545;
        }

        .window-status {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
        }

        .window-status span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 9px rgba(217, 255, 67, 0.6);
        }

        .dashboard-content {
          min-height: 460px;
          display: grid;
          grid-template-columns: 155px 1fr;
        }

        .dashboard-sidebar {
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          border-right: 1px solid var(--line);
        }

        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 19px 22px;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .dashboard-brand .logo-mark {
          transform: scale(0.62);
          transform-origin: left center;
          width: 16px;
        }

        .dashboard-nav-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 13px 18px;
          border-left: 1px solid transparent;
          opacity: 0.32;
          transition:
            opacity 0.35s ease,
            background-color 0.35s ease,
            border-color 0.35s ease;
        }

        .dashboard-nav-item.active {
          opacity: 1;
          border-left-color: var(--accent);
          background: rgba(255, 255, 255, 0.024);
        }

        .dashboard-nav-item span {
          color: #505050;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .dashboard-nav-item strong {
          color: #aaa;
          font-size: 9px;
          font-weight: 500;
        }

        .dashboard-sidebar-bottom {
          margin-top: auto;
          padding: 18px;
          color: #414141;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .dashboard-sidebar-bottom span {
          display: inline-block;
          width: 4px;
          height: 4px;
          margin-right: 5px;
          border-radius: 50%;
          background: var(--accent);
        }

        .dashboard-sidebar-bottom strong {
          display: block;
          margin-top: 7px;
          color: #777;
          font-size: 10px;
          font-weight: 400;
        }

        .dashboard-main {
          min-width: 0;
          padding: 26px 28px;
        }

        .dashboard-topline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .dashboard-topline span {
          display: block;
          margin-bottom: 6px;
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          letter-spacing: 0.1em;
        }

        .dashboard-topline h3 {
          margin: 0;
          color: #ddd;
          font-size: 21px;
          font-weight: 500;
          letter-spacing: -0.04em;
          animation: dashboardTextIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .dashboard-date {
          text-align: right;
          color: #484848;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          line-height: 1.7;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 1px;
          margin-top: 24px;
          border: 1px solid var(--line);
          background: var(--line);
        }

        .dashboard-stats > div {
          padding: 16px;
          background: #0b0b0b;
        }

        .dashboard-stats span {
          display: block;
          margin-bottom: 7px;
          color: #4b4b4b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .dashboard-stats strong {
          color: #ddd;
          font-size: 14px;
          font-weight: 500;
        }

        .green-text {
          color: var(--accent) !important;
        }

        .dashboard-chart {
          position: relative;
          height: 190px;
          margin-top: 1px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: #0b0b0b;
        }

        .chart-background {
          position: absolute;
          inset: 0;
          opacity: 0.55;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 52px 52px;
        }

        .dashboard-chart svg {
          position: absolute;
          inset: 20px;
          width: calc(100% - 40px);
          height: calc(100% - 40px);
        }

        .chart-point {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 1px solid #999;
          background: #080808;
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.25);
          animation: chartPulse 2.6s ease-in-out infinite;
        }

        .chart-point-a {
          left: 36%;
          top: 61%;
        }

        .chart-point-b {
          left: 66%;
          top: 44%;
          animation-delay: 0.4s;
        }

        .chart-point-c {
          right: 9%;
          top: 18%;
          animation-delay: 0.8s;
        }

        .chart-floating-value {
          position: absolute;
          right: 20px;
          top: 20px;
          padding: 6px 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0c0c0c;
          color: var(--accent);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          margin-top: 1px;
        }

        .dashboard-bars,
        .dashboard-feed {
          min-height: 82px;
          padding: 14px;
          border: 1px solid var(--line);
          background: #0b0b0b;
        }

        .dashboard-bars {
          display: flex;
          align-items: end;
          gap: 5px;
        }

        .dashboard-bars span {
          flex: 1;
          min-width: 2px;
          background: #393939;
          transform-origin: bottom;
          animation: barBreathe 4s ease-in-out infinite;
        }

        .dashboard-bars span:nth-child(7n) {
          background: #707070;
        }

        .dashboard-feed {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          color: #585858;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .dashboard-feed div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dashboard-feed span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
        }

        .dashboard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 15px;
          border-top: 1px solid var(--line);
          color: #3f3f3f;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          letter-spacing: 0.08em;
        }

        .hero-meta {
          position: relative;
          z-index: 5;
          width: min(1120px, 100%);
          margin: 50px auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #464646;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .hero-scroll {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 13px;
        }

        .hero-scroll i {
          position: relative;
          width: 1px;
          height: 44px;
          overflow: hidden;
          background: #252525;
        }

        .hero-scroll i::after {
          content: "";
          position: absolute;
          top: -22px;
          left: 0;
          width: 1px;
          height: 22px;
          background: #fff;
          animation: scrollLine 2.2s ease-in-out infinite;
        }

        /* ======================================================
           SECTION COMMON
        ====================================================== */

        .section-container {
          position: relative;
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .section-kicker {
          gap: 12px;
        }

        .section-kicker span:first-child {
          color: #4b4b4b;
        }

        /* ======================================================
           INTRO
        ====================================================== */

        .intro-section {
          position: relative;
          z-index: 1;
          padding: 180px 24px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .intro-layout {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 100px;
          margin-top: 80px;
        }

        .intro-title h2,
        .architecture-header h2,
        .control-title h2 {
          margin: 0;
          font-size: clamp(54px, 6.5vw, 90px);
          line-height: 0.92;
          font-weight: 450;
          letter-spacing: -0.07em;
        }

        .intro-title h2 span,
        .architecture-header h2 span,
        .control-title h2 span {
          color: #5f5f5f;
        }

        .intro-copy {
          padding-top: 12px;
          color: #777;
          font-size: 14px;
          line-height: 1.8;
        }

        .intro-copy p {
          max-width: 390px;
          margin: 0 0 20px;
        }

        .integrity {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 50px;
        }

        .integrity-line {
          width: 100px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .integrity-line i {
          flex: 1;
          height: 1px;
          background: #444;
          animation: integrityPulse 1.8s ease-in-out infinite;
        }

        .integrity-line i:nth-child(2) {
          animation-delay: 0.15s;
        }

        .integrity-line i:nth-child(3) {
          animation-delay: 0.3s;
        }

        .integrity-line i:nth-child(4) {
          animation-delay: 0.45s;
        }

        .integrity strong,
        .integrity span {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .integrity strong {
          color: #eee;
          font-size: 22px;
          font-weight: 400;
        }

        .integrity span {
          margin-top: 5px;
          color: #4b4b4b;
          font-size: 6px;
          letter-spacing: 0.08em;
        }

        /* ======================================================
           ARCHITECTURE
        ====================================================== */

        .architecture {
          position: relative;
          z-index: 1;
          padding: 170px 24px 130px;
          border-bottom: 1px solid var(--line);
        }

        .architecture-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .architecture-header h2 {
          margin-top: 25px;
        }

        .architecture-header > p {
          width: 230px;
          margin: 0 0 6px;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          line-height: 1.8;
          text-transform: uppercase;
        }

        .architecture-map-wrap {
          margin-top: 85px;
        }

        .system-map {
          position: relative;
          width: min(720px, 92vw);
          height: 610px;
          margin: 0 auto;
        }

        .map-aura {
          position: absolute;
          inset: 25%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.07),
            transparent 68%
          );
          filter: blur(30px);
          animation: auraBreathe 5s ease-in-out infinite;
        }

        .map-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-a {
          width: 245px;
          height: 245px;
          animation: mapRotate 24s linear infinite;
        }

        .ring-b {
          width: 390px;
          height: 390px;
          border-style: dashed;
          animation: mapRotateReverse 38s linear infinite;
        }

        .ring-c {
          width: 555px;
          height: 555px;
          opacity: 0.55;
          animation: mapRotate 50s linear infinite;
        }

        .map-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
        }

        .map-core {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 50%;
          background: #080808;
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.04);
        }

        .map-core > div {
          transform: scale(0.55);
          margin-bottom: -5px;
        }

        .map-core strong {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .map-core span {
          margin-top: 2px;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .map-node {
          position: absolute;
          z-index: 4;
          width: 135px;
          min-height: 84px;
          padding: 14px 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          background: rgba(10, 10, 10, 0.84);
          color: #888;
          cursor: pointer;
          text-align: left;
          backdrop-filter: blur(18px);
          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            background-color 0.35s ease,
            color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .map-node:hover {
          border-color: rgba(255, 255, 255, 0.16);
          color: #ddd;
          background: #101010;
        }

        .map-node.active {
          border-color: rgba(217, 255, 67, 0.35);
          color: #f5f5f7;
          background: #101010;
          box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.45),
            0 0 30px rgba(217, 255, 67, 0.035);
        }

        .map-node-number {
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .map-node strong {
          margin-top: 7px;
          font-size: 10px;
          font-weight: 500;
        }

        .map-node small {
          margin-top: 4px;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .map-node.active small {
          color: var(--accent);
        }

        .architecture-footer {
          display: grid;
          grid-template-columns: 130px 1fr 130px;
          gap: 20px;
          align-items: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
          color: #484848;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .architecture-footer strong {
          color: #999;
          font-weight: 400;
          text-align: center;
        }

        .architecture-footer span:last-child {
          text-align: right;
        }

        /* ======================================================
           MODULES
        ====================================================== */

        .module-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 110px 24px;
          border-bottom: 1px solid var(--line);
        }

        .module-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            circle at 80% 50%,
            rgba(255, 255, 255, 0.025),
            transparent 32%
          );
          opacity: 0;
          transition: opacity 1s ease;
        }

        .module-section.active::before {
          opacity: 1;
        }

        .module-inner {
          position: relative;
          z-index: 2;
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .module-header,
        .module-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .module-layout {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 100px;
          align-items: center;
          margin-top: 75px;
          margin-bottom: 85px;
        }

        .module-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .module-status i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 9px rgba(217, 255, 67, 0.65);
        }

        .module-copy h2 {
          max-width: 560px;
          margin: 23px 0 0;
          font-size: clamp(52px, 5.6vw, 78px);
          line-height: 0.93;
          font-weight: 450;
          letter-spacing: -0.065em;
        }

        .module-copy > p {
          max-width: 440px;
          margin: 28px 0 0;
          color: #777;
          font-size: 14px;
          line-height: 1.75;
        }

        .module-number {
          margin-top: 46px;
        }

        .module-number span,
        .module-number strong {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .module-number span {
          color: #4a4a4a;
          font-size: 6px;
          letter-spacing: 0.09em;
        }

        .module-number strong {
          margin-top: 8px;
          color: #eee;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -0.04em;
        }

        .module-features {
          margin-top: 45px;
          border-top: 1px solid var(--line);
        }

        .module-features > div {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid var(--line-soft);
        }

        .module-features span {
          color: #454545;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .module-features p {
          margin: 0;
          color: #777;
          font-size: 10px;
        }

        .module-visual {
          min-width: 0;
        }

        .visual-card {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          background: linear-gradient(145deg, #0c0c0c, #070707);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.38);
          transition:
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.5s ease;
        }

        .module-section.active .visual-card {
          transform: translateY(-6px);
          border-color: rgba(255, 255, 255, 0.12);
        }

        /* ======================================================
           SALES VISUAL
        ====================================================== */

        .sales-card {
          display: grid;
          grid-template-columns: 1fr 145px;
          gap: 32px;
          padding: 42px;
          align-items: center;
        }

        .visual-card-header {
          position: absolute;
          top: 24px;
          left: 24px;
          right: 24px;
          display: flex;
          justify-content: space-between;
          color: #4a4a4a;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .visual-card-header small {
          color: var(--accent);
        }

        .sales-stack {
          position: relative;
          width: 285px;
          height: 330px;
          margin-left: 10px;
        }

        .invoice {
          position: absolute;
          top: 35px;
          left: 20px;
          width: 240px;
          min-height: 220px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 14px;
          background: linear-gradient(145deg, #171717, #0c0c0c);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .invoice:nth-child(1) {
          z-index: 3;
        }

        .invoice:nth-child(2) {
          z-index: 2;
        }

        .invoice:nth-child(3) {
          z-index: 1;
        }

        .module-section.active .invoice {
          animation: invoiceFloat 5s ease-in-out infinite;
        }

        .invoice-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .invoice-top em {
          font-style: normal;
          font-size: 6px;
        }

        .invoice-paid {
          color: #aaa;
        }

        .invoice-pending {
          color: var(--accent);
        }

        .invoice > strong {
          display: block;
          margin-top: 34px;
          color: #eee;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 28px;
          font-weight: 400;
        }

        .invoice-lines {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 30px;
        }

        .invoice-lines span {
          display: block;
          height: 2px;
          background: #272727;
        }

        .invoice-lines span:nth-child(1) {
          width: 80%;
        }

        .invoice-lines span:nth-child(2) {
          width: 60%;
        }

        .invoice-lines span:nth-child(3) {
          width: 45%;
        }

        .invoice > small {
          display: block;
          margin-top: 22px;
          color: #484848;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 5px;
        }

        .sales-flow {
          border-left: 1px solid var(--line);
          padding-left: 24px;
        }

        .sales-flow > div {
          position: relative;
          display: grid;
          grid-template-columns: 8px 1fr;
          gap: 10px;
          padding-bottom: 30px;
        }

        .sales-flow > div:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 7px;
          left: 2px;
          width: 1px;
          height: 55px;
          background: #272727;
        }

        .sales-flow span {
          position: relative;
          z-index: 2;
          width: 5px;
          height: 5px;
          margin-top: 3px;
          border-radius: 50%;
          background: #aaa;
        }

        .sales-flow strong,
        .sales-flow small {
          display: block;
        }

        .sales-flow strong {
          color: #aaa;
          font-size: 9px;
          font-weight: 400;
        }

        .sales-flow small {
          margin-top: 4px;
          color: #4b4b4b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        /* ======================================================
           INVENTORY VISUAL
        ====================================================== */

        .inventory-card {
          display: grid;
          grid-template-columns: 1fr 170px;
          gap: 28px;
          padding: 55px;
          align-items: center;
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }

        .inventory-grid span {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid rgba(255, 255, 255, 0.055);
          background: rgba(255, 255, 255, 0.012);
          transition:
            border-color 0.4s ease,
            background-color 0.4s ease;
        }

        .module-section.active .inventory-grid span {
          animation: gridPulse 5s ease-in-out infinite;
        }

        .inventory-grid span.occupied {
          border-color: rgba(255, 255, 255, 0.17);
        }

        .inventory-grid span.warning {
          border-color: rgba(217, 255, 67, 0.35);
        }

        .inventory-grid i {
          position: absolute;
          inset: 26%;
          display: block;
          background: #858585;
        }

        .inventory-grid span.warning i {
          background: var(--accent);
        }

        .inventory-scanner {
          position: relative;
          height: 290px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.01);
        }

        .scan-line {
          position: absolute;
          left: 0;
          top: -2px;
          width: 100%;
          height: 1px;
          background: var(--accent);
          box-shadow: 0 0 18px rgba(217, 255, 67, 0.8);
          animation: scannerMove 3.2s linear infinite;
        }

        .scan-target {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 92px;
          height: 92px;
          transform: translate(-50%, -50%);
        }

        .scan-target i {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #888;
        }

        .scan-target i:nth-child(1) {
          top: 0;
          left: 0;
          border-top: 1px solid;
          border-left: 1px solid;
        }

        .scan-target i:nth-child(2) {
          top: 0;
          right: 0;
          border-top: 1px solid;
          border-right: 1px solid;
        }

        .scan-target i:nth-child(3) {
          bottom: 0;
          left: 0;
          border-left: 1px solid;
          border-bottom: 1px solid;
        }

        .scan-target i:nth-child(4) {
          bottom: 0;
          right: 0;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }

        .scan-copy {
          position: absolute;
          left: 18px;
          bottom: 18px;
        }

        .scan-copy strong,
        .scan-copy span {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .scan-copy strong {
          color: #aaa;
          font-size: 7px;
          font-weight: 400;
        }

        .scan-copy span {
          margin-top: 4px;
          color: var(--accent);
          font-size: 5px;
        }

        .inventory-stats {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--line);
          margin-top: 10px;
        }

        .inventory-stats div {
          padding-top: 18px;
          border-right: 1px solid var(--line);
        }

        .inventory-stats div:last-child {
          border-right: 0;
          padding-left: 18px;
        }

        .inventory-stats span,
        .inventory-stats strong {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .inventory-stats span {
          color: #454545;
          font-size: 6px;
        }

        .inventory-stats strong {
          margin-top: 7px;
          color: #aaa;
          font-size: 18px;
          font-weight: 400;
        }

        /* ======================================================
           PROCUREMENT VISUAL
        ====================================================== */

        .procurement-card {
          padding: 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .procurement-intro {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin-bottom: 75px;
        }

        .procurement-intro span {
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .procurement-intro strong {
          color: #aaa;
          font-size: 14px;
          font-weight: 400;
        }

        .procurement-track {
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
        }

        .procurement-progress {
          position: absolute;
          left: 0;
          right: 0;
          top: 15px;
          height: 1px;
          overflow: hidden;
          background: #272727;
        }

        .procurement-progress::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 25%;
          background: linear-gradient(90deg, transparent, #aaa, transparent);
          animation: progressTravel 3s linear infinite;
        }

        .procurement-step {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          opacity: 0;
        }

        .module-section.active .procurement-step {
          animation: stepAppear 0.8s ease forwards;
        }

        .module-section.active .procurement-step:nth-child(2) {
          animation-delay: 0ms !important;
        }

        .module-section.active .procurement-step:nth-child(3) {
          animation-delay: 110ms !important;
        }

        .module-section.active .procurement-step:nth-child(4) {
          animation-delay: 220ms !important;
        }

        .module-section.active .procurement-step:nth-child(5) {
          animation-delay: 330ms !important;
        }

        .module-section.active .procurement-step:nth-child(6) {
          animation-delay: 440ms !important;
        }

        .procurement-circle {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 1px solid #555;
          border-radius: 50%;
          background: #080808;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .procurement-step span {
          margin-top: 14px;
          color: #4a4a4a;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .procurement-step strong {
          margin-top: 5px;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          font-weight: 400;
        }

        .vendor-card {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          margin-top: 72px;
          border: 1px solid var(--line);
        }

        .vendor-card > div {
          padding: 18px;
          border-right: 1px solid var(--line);
        }

        .vendor-card > div:last-child {
          border-right: 0;
        }

        .vendor-card span,
        .vendor-card strong {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .vendor-card span {
          color: #444;
          font-size: 6px;
        }

        .vendor-card strong {
          margin-top: 7px;
          color: #aaa;
          font-size: 9px;
          font-weight: 400;
        }

        /* ======================================================
           RISK VISUAL
        ====================================================== */

        .risk-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 75px;
          padding: 55px;
        }

        .risk-radar {
          position: relative;
          width: 290px;
          height: 290px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .radar-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .radar-one {
          width: 100%;
          height: 100%;
        }

        .radar-two {
          width: 68%;
          height: 68%;
        }

        .radar-three {
          width: 34%;
          height: 34%;
        }

        .radar-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.055);
        }

        .radar-x {
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
        }

        .radar-y {
          top: 0;
          left: 50%;
          width: 1px;
          height: 100%;
        }

        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50%;
          height: 1px;
          transform-origin: left center;
          background: linear-gradient(
            90deg,
            rgba(217, 255, 67, 0.8),
            transparent
          );
          animation: radarRotate 3.5s linear infinite;
        }

        .risk-point {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #999;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
          animation: riskPulse 2.6s ease-in-out infinite;
        }

        .point-a {
          top: 24%;
          left: 64%;
        }

        .point-b {
          top: 63%;
          left: 25%;
          animation-delay: 0.3s;
        }

        .point-c {
          top: 73%;
          left: 69%;
          animation-delay: 0.6s;
        }

        .point-d {
          top: 35%;
          left: 31%;
          background: var(--accent);
        }

        .point-e {
          top: 54%;
          left: 77%;
          animation-delay: 0.9s;
        }

        .radar-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          transform: translate(-50%, -50%);
          border: 1px solid #555;
          border-radius: 50%;
          background: #080808;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .risk-info {
          width: 175px;
        }

        .risk-info > span {
          color: #464646;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .risk-info > strong {
          display: block;
          margin-top: 13px;
          color: #eee;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 27px;
          font-weight: 400;
        }

        .risk-info > strong small {
          display: block;
          margin-top: 4px;
          color: #4a4a4a;
          font-size: 6px;
        }

        .aging {
          margin-top: 28px;
        }

        .aging div {
          display: grid;
          grid-template-columns: 36px 1fr;
          align-items: center;
          gap: 10px;
          margin-bottom: 13px;
        }

        .aging span {
          color: #4d4d4d;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .aging i {
          display: block;
          height: 2px;
          background: #666;
        }

        .aging div:last-child i {
          background: var(--accent);
        }

        /* ======================================================
           MODULE FOOTER
        ====================================================== */

        .module-footer {
          padding-top: 20px;
          border-top: 1px solid var(--line);
        }

        .module-progress {
          flex: 1;
          max-width: 150px;
          height: 1px;
          overflow: hidden;
          background: #272727;
        }

        .module-progress i {
          display: block;
          height: 1px;
          background: #777;
          transition: width 1s ease;
        }

        /* ======================================================
           CONTROL
        ====================================================== */

        .control-section {
          position: relative;
          padding: 180px 24px;
          border-bottom: 1px solid var(--line);
        }

        .control-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
        }

        .control-title h2 {
          margin-top: 24px;
        }

        .control-stream {
          border-top: 1px solid var(--line);
        }

        .stream-row {
          display: grid;
          grid-template-columns: 100px 1fr 130px 80px;
          gap: 15px;
          min-height: 62px;
          align-items: center;
          border-bottom: 1px solid var(--line);
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .stream-row > span {
          color: #555;
        }

        .stream-row > i {
          height: 1px;
          background: #292929;
        }

        .stream-row strong {
          color: #aaa;
          font-weight: 400;
        }

        .stream-row em {
          color: #555;
          font-style: normal;
          text-align: right;
        }

        /* ======================================================
           FINAL
        ====================================================== */

        .final-section {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 150px 24px;
          overflow: hidden;
        }

        .final-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 90px 90px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black,
            transparent
          );
        }

        .final-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.055),
            transparent 70%
          );
          filter: blur(35px);
          pointer-events: none;
        }

        .final-content {
          position: relative;
          z-index: 3;
          width: 100%;
        }

        .final-content h2 {
          max-width: 950px;
          margin: 28px 0;
          font-size: clamp(76px, 10vw, 145px);
          line-height: 0.8;
          letter-spacing: -0.085em;
          font-weight: 450;
        }

        .final-content h2 span {
          color: #626262;
        }

        .final-content p {
          max-width: 390px;
          margin: 0;
          color: #717171;
          font-size: 13px;
          line-height: 1.75;
        }

        .final-button {
          display: inline-flex;
          align-items: center;
          gap: 45px;
          margin-top: 32px;
          padding: 15px 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: #f2f2f2;
          color: #050505;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          transition:
            transform 0.3s ease,
            background-color 0.3s ease;
        }

        .final-button:hover {
          transform: translateY(-2px);
          background: #fff;
        }

        .final-button strong {
          font-size: 15px;
          font-weight: 400;
        }

        .final-orbit {
          position: absolute;
          right: -80px;
          top: 50%;
          width: 560px;
          height: 560px;
          transform: translateY(-50%);
          opacity: 0.9;
        }

        .final-orbit div {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid rgba(255, 255, 255, 0.075);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .final-orbit div:nth-child(1) {
          width: 100%;
          height: 100%;
          animation: mapRotate 25s linear infinite;
        }

        .final-orbit div:nth-child(2) {
          width: 66%;
          height: 66%;
          border-style: dashed;
          animation: mapRotateReverse 18s linear infinite;
        }

        .final-orbit div:nth-child(3) {
          width: 30%;
          height: 30%;
          border-color: rgba(217, 255, 67, 0.22);
        }

        .final-orbit span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          background: #080808;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
        }

        /* ======================================================
           FOOTER
        ====================================================== */

        .site-footer {
          position: relative;
          z-index: 2;
          padding: 25px 24px 32px;
          border-top: 1px solid var(--line);
          color: #424242;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .footer-top,
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .footer-top {
          padding-bottom: 23px;
          border-bottom: 1px solid var(--line);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #777;
        }

        .footer-brand .logo-mark {
          transform: scale(0.7);
        }

        .footer-bottom {
          padding-top: 22px;
        }

        .footer-bottom > div {
          display: flex;
          gap: 27px;
        }

        .footer-bottom a:hover {
          color: #aaa;
        }

        /* ======================================================
           ANIMATIONS
        ====================================================== */

        @keyframes dashboardTextIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes statusPulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes scrollLine {
          0% {
            transform: translateY(-22px);
          }

          100% {
            transform: translateY(68px);
          }
        }

        @keyframes chartPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }

          50% {
            transform: scale(1.45);
            opacity: 1;
          }
        }

        @keyframes barBreathe {
          0%,
          100% {
            transform: scaleY(0.82);
            opacity: 0.6;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes integrityPulse {
          0%,
          100% {
            transform: scaleY(0.35);
            opacity: 0.3;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes auraBreathe {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.45;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.75;
          }
        }

        @keyframes mapRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes mapRotateReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes invoiceFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -5px;
          }
        }

        @keyframes gridPulse {
          0%,
          100% {
            background-color: rgba(255, 255, 255, 0.012);
          }

          50% {
            background-color: rgba(255, 255, 255, 0.03);
          }
        }

        @keyframes scannerMove {
          0% {
            transform: translateY(0);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          90% {
            opacity: 1;
          }

          100% {
            transform: translateY(290px);
            opacity: 0;
          }
        }

        @keyframes progressTravel {
          0% {
            transform: translateX(-120%);
          }

          100% {
            transform: translateX(400%);
          }
        }

        @keyframes stepAppear {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes radarRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes riskPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.45;
          }

          50% {
            transform: scale(1.65);
            opacity: 1;
          }
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 1000px) {
          .header-status {
            display: none;
          }

          .intro-layout,
          .control-layout {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .module-layout {
            grid-template-columns: 1fr;
            gap: 65px;
          }

          .module-copy {
            max-width: 700px;
          }

          .final-orbit {
            right: -220px;
            opacity: 0.38;
          }
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {
          .site-header {
            top: 10px;
            width: calc(100% - 20px);
          }

          .site-header-inner {
            height: 52px;
            padding: 0 7px 0 13px;
          }

          .site-nav {
            position: absolute;
            top: 61px;
            left: 0;
            right: 0;
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            padding: 13px 15px;
            border: 1px solid var(--line);
            border-radius: 18px;
            background: rgba(10, 10, 10, 0.94);
            backdrop-filter: blur(25px);
          }

          .site-nav.open {
            display: flex;
          }

          .site-nav a {
            padding: 13px 4px;
          }

          .nav-cta {
            justify-content: space-between;
            padding: 11px 13px !important;
            margin-top: 5px;
          }

          .menu-button {
            width: 38px;
            height: 38px;
            margin-left: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 5px;
            border: 0;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
          }

          .menu-button span {
            width: 15px;
            height: 1px;
            background: #aaa;
            transition: transform 0.25s ease;
          }

          .menu-button.open span:first-child {
            transform: translateY(3px) rotate(45deg);
          }

          .menu-button.open span:last-child {
            transform: translateY(-3px) rotate(-45deg);
          }

          .hero {
            min-height: auto;
            padding: 125px 20px 70px;
          }

          .hero h1 {
            font-size: clamp(58px, 18vw, 100px);
            letter-spacing: -0.08em;
          }

          .hero-description {
            width: min(100%, 350px);
            margin-left: 0;
            font-size: 13px;
          }

          .hero-actions {
            flex-wrap: wrap;
            gap: 18px;
            margin-left: 0;
          }

          .hero-screen {
            width: 100%;
            margin-top: 65px;
          }

          .hero-meta {
            margin-top: 35px;
          }

          .hero-dashboard {
            border-radius: 14px;
          }

          .window-bar {
            grid-template-columns: auto 1fr;
          }

          .window-url {
            display: none;
          }

          .window-status {
            justify-self: end;
          }

          .dashboard-content {
            display: block;
            min-height: 0;
          }

          .dashboard-sidebar {
            display: none;
          }

          .dashboard-main {
            padding: 18px;
          }

          .dashboard-topline h3 {
            max-width: 210px;
            font-size: 16px;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .dashboard-stats > div:not(:first-child) {
            display: none;
          }

          .dashboard-chart {
            height: 150px;
          }

          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-feed {
            display: none;
          }

          .dashboard-footer {
            gap: 10px;
            overflow: hidden;
            white-space: nowrap;
          }

          .dashboard-footer span {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dashboard-footer span:nth-child(2) {
            display: none;
          }

          .intro-section,
          .architecture,
          .control-section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .intro-section {
            padding-top: 100px;
            padding-bottom: 100px;
          }

          .intro-layout {
            margin-top: 55px;
            gap: 45px;
          }

          .intro-title h2,
          .architecture-header h2,
          .control-title h2 {
            font-size: 51px;
          }

          .intro-copy {
            padding-top: 0;
          }

          .architecture {
            padding-top: 100px;
            padding-bottom: 90px;
          }

          .architecture-header {
            display: block;
          }

          .architecture-header > p {
            margin-top: 30px;
          }

          .architecture-map-wrap {
            margin-top: 60px;
          }

          .system-map {
            width: 100%;
            height: 420px;
          }

          .ring-a {
            width: 160px;
            height: 160px;
          }

          .ring-b {
            width: 260px;
            height: 260px;
          }

          .ring-c {
            width: 355px;
            height: 355px;
          }

          .map-node {
            width: 104px;
            min-height: 68px;
            padding: 11px;
          }

          .map-node strong {
            font-size: 8px;
          }

          .map-node small {
            font-size: 5px;
          }

          .architecture-footer {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .architecture-footer strong {
            text-align: left;
          }

          .architecture-footer span:last-child {
            text-align: left;
          }

          .module-section {
            min-height: auto;
            padding: 85px 20px;
          }

          .module-layout {
            margin-top: 52px;
            margin-bottom: 58px;
            gap: 48px;
          }

          .module-copy h2 {
            font-size: 51px;
          }

          .module-copy > p {
            font-size: 13px;
          }

          .visual-card {
            min-height: 430px;
            border-radius: 17px;
          }

          .sales-card {
            display: flex;
            flex-direction: column;
            padding: 42px 24px;
            gap: 25px;
          }

          .sales-stack {
            transform: scale(0.78);
            transform-origin: top center;
            width: 285px;
            height: 280px;
            margin-bottom: -50px;
          }

          .sales-flow {
            width: 100%;
            border-left: 0;
            border-top: 1px solid var(--line);
            padding-left: 0;
            padding-top: 22px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .sales-flow > div {
            padding: 0 8px 0 0;
          }

          .sales-flow > div:not(:last-child)::after {
            display: none;
          }

          .inventory-card {
            grid-template-columns: 1fr;
            padding: 28px;
            gap: 24px;
          }

          .inventory-grid {
            gap: 3px;
          }

          .inventory-scanner {
            height: 170px;
          }

          .inventory-stats {
            margin-top: 0;
          }

          .inventory-stats div {
            padding-top: 14px;
          }

          .procurement-card {
            padding: 30px 20px;
          }

          .procurement-intro {
            margin-bottom: 55px;
          }

          .procurement-intro strong {
            font-size: 11px;
          }

          .procurement-step span,
          .procurement-step strong {
            font-size: 5px;
          }

          .vendor-card {
            grid-template-columns: 1fr;
            margin-top: 55px;
          }

          .vendor-card > div {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .vendor-card > div:last-child {
            border-bottom: 0;
          }

          .risk-card {
            flex-direction: column;
            gap: 35px;
            padding: 35px 24px;
          }

          .risk-radar {
            width: 230px;
            height: 230px;
          }

          .risk-info {
            width: 100%;
          }

          .module-footer {
            gap: 10px;
          }

          .module-progress {
            max-width: 95px;
          }

          .control-section {
            padding-top: 100px;
            padding-bottom: 100px;
          }

          .control-layout {
            gap: 55px;
          }

          .stream-row {
            grid-template-columns: 76px 1fr;
            gap: 10px;
            padding: 12px 0;
          }

          .stream-row > i {
            display: none;
          }

          .stream-row strong {
            grid-column: 2;
          }

          .stream-row em {
            grid-column: 2;
            text-align: left;
          }

          .final-section {
            min-height: 650px;
            padding: 100px 20px;
          }

          .final-content h2 {
            font-size: 72px;
          }

          .final-content p {
            max-width: 320px;
          }

          .final-orbit {
            right: -270px;
            opacity: 0.3;
          }

          .site-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .footer-top,
          .footer-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer-bottom > div {
            gap: 20px;
          }
        }

        /* ======================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 420px) {
          .hero {
            padding-left: 16px;
            padding-right: 16px;
          }

          .hero h1 {
            font-size: 54px;
          }

          .hero-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .hero-meta {
            font-size: 6px;
          }

          .hero-scroll span {
            font-size: 6px;
          }

          .intro-section,
          .architecture,
          .control-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .intro-title h2,
          .architecture-header h2,
          .control-title h2 {
            font-size: 45px;
          }

          .system-map {
            height: 360px;
          }

          .ring-a {
            width: 135px;
            height: 135px;
          }

          .ring-b {
            width: 220px;
            height: 220px;
          }

          .ring-c {
            width: 300px;
            height: 300px;
          }

          .map-node {
            width: 92px;
            min-height: 61px;
          }

          .module-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .module-copy h2 {
            font-size: 45px;
          }

          .visual-card {
            min-height: 400px;
          }

          .sales-stack {
            transform: scale(0.68);
            margin-top: -10px;
            margin-bottom: -65px;
          }

          .risk-radar {
            width: 205px;
            height: 205px;
          }

          .final-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .final-content h2 {
            font-size: 61px;
          }
        }

        /* ======================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          [data-reveal],
          .hero-screen[data-reveal],
          .procurement-step {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}
