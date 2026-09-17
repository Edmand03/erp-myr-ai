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
    code: "01 // SLS",
    title: "Sales & Client Invoicing",
    summary:
      "End-to-end billing pipeline with automated ledger synchronization.",
    metric: "142,850",
    metricLabel: "Processed Volume",
    status: "Real-Time Synced",
    bullets: [
      "PDF & digital invoice dispatch",
      "Tax & multi-currency support",
      "Client payment tracking",
      "Line-item discounts & SKU control",
    ],
  },
  {
    id: "warehouse",
    code: "02 // WHS",
    title: "Warehouse & Inventory",
    summary: "Multi-location stock routing with automated valuation models.",
    metric: "1,240",
    metricLabel: "Units In Stock",
    status: "Optimized",
    bullets: [
      "PDF inventory importer",
      "Low-stock detection & alerts",
      "FIFO / LIFO / Weighted Average",
      "Barcode & serial traceability",
    ],
  },
  {
    id: "procurement",
    code: "03 // PRC",
    title: "Procurement & Purchase Orders",
    summary: "Transparent vendor commitment tracking and expense management.",
    metric: "38,400",
    metricLabel: "Open Commitments",
    status: "Monitored",
    bullets: [
      "Supplier performance tracking",
      "PO-to-inventory matching",
      "Expense categories linked to ledgers",
      "Vendor approvals & spending caps",
    ],
  },
  {
    id: "risk",
    code: "04 // RSK",
    title: "AR Aging & Risk Control",
    summary:
      "Advanced accounts receivable bucketing to safeguard enterprise cash flow.",
    metric: "12,150",
    metricLabel: "Outstanding Risk",
    status: "Secured",
    bullets: [
      "Automated aging breakdown",
      "Customer risk scoring",
      "Collection reminders & statements",
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
    let raf = 0;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(max > 0 ? window.scrollY / max : 0);
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
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

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1100;

    const animate = (time: number) => {
      const progress = clamp((time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {display.toLocaleString()}
      {suffix}
    </>
  );
}

function Noise() {
  return <div className="noise" aria-hidden="true" />;
}

function DataPulse() {
  return (
    <div className="data-pulse" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function DashboardScreen({
  activeModule,
  pointer,
}: {
  activeModule: number;
  pointer: { x: number; y: number };
}) {
  const module = modules[activeModule];

  return (
    <div
      className="screen-wrap"
      style={{
        transform: `
          perspective(1400px)
          rotateX(${pointer.y * -1.5}deg)
          rotateY(${pointer.x * 2.5}deg)
        `,
      }}
    >
      <div className="screen-glow" />

      <div className="dashboard-screen">
        <div className="screen-top">
          <div className="screen-brand">
            <span className="brand-square" />
            ERP_CORE
          </div>

          <div className="screen-path">/ operations / {module.id}</div>

          <div className="screen-live">
            <i />
            LIVE
          </div>
        </div>

        <div className="screen-body">
          <aside className="screen-sidebar">
            {modules.map((item, index) => (
              <div
                key={item.id}
                className={`side-module ${
                  activeModule === index ? "selected" : ""
                }`}
              >
                <span>{item.code.split(" ")[0]}</span>
                <strong>{item.title.split(" ")[0]}</strong>
              </div>
            ))}
          </aside>

          <main className="screen-main">
            <div className="screen-heading">
              <div>
                <span>ACTIVE SUBSYSTEM</span>
                <h3>{module.title}</h3>
              </div>

              <div className="screen-date">
                18 SEP 2026
                <br />
                17:42:08
              </div>
            </div>

            <div className="screen-metrics">
              <div>
                <span>PRIMARY METRIC</span>
                <strong>{module.metric}</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>{module.status}</strong>
              </div>

              <div>
                <span>SYNC</span>
                <strong>99.98%</strong>
              </div>
            </div>

            <div className="screen-visual">
              <div className="visual-grid" />

              <div className="chart-line">
                <svg viewBox="0 0 700 200" preserveAspectRatio="none">
                  <path
                    d="M0 160 C40 150 50 100 90 115 C125 128 135 70 175 86 C210 101 220 50 260 62 C300 74 310 116 350 95 C390 73 405 110 440 83 C480 52 495 90 530 68 C570 45 590 70 620 42 C650 20 670 34 700 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div className="chart-label label-one">{module.metricLabel}</div>

              <div className="chart-label label-two">+18.4%</div>

              <div className="chart-point point-one" />
              <div className="chart-point point-two" />
              <div className="chart-point point-three" />
            </div>

            <div className="screen-bottom">
              <div className="mini-bars">
                {[48, 72, 55, 88, 64, 91, 76, 100, 83, 96].map(
                  (height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ),
                )}
              </div>

              <div className="screen-log">
                <div>
                  <i />
                  Ledger synchronization complete
                </div>
                <div>
                  <i />
                  Automated reconciliation running
                </div>
              </div>
            </div>
          </main>
        </div>

        <div className="screen-footer">
          <span>ENCRYPTED SESSION</span>
          <span>API LATENCY 23ms</span>
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}

function OrbitSystem({
  activeModule,
  setActiveModule,
}: {
  activeModule: number;
  setActiveModule: (index: number) => void;
}) {
  return (
    <div className="orbit-system">
      <div className="orbit-ring ring-one" />
      <div className="orbit-ring ring-two" />
      <div className="orbit-ring ring-three" />

      <div className="orbit-center">
        <div className="center-core">
          <span />
          <strong>ERP</strong>
          <small>CORE</small>
        </div>
      </div>

      {modules.map((module, index) => {
        const positions = [
          { top: "5%", left: "50%" },
          { top: "50%", right: "2%" },
          { bottom: "4%", left: "50%" },
          { top: "50%", left: "2%" },
        ];

        return (
          <button
            key={module.id}
            onClick={() => setActiveModule(index)}
            className={`orbit-node ${activeModule === index ? "active" : ""}`}
            style={positions[index]}
          >
            <span className="node-index">{module.code.slice(0, 2)}</span>
            <span className="node-title">{module.title.split("&")[0]}</span>
            <span className="node-status">{module.status}</span>
          </button>
        );
      })}
    </div>
  );
}

function SalesVisual() {
  const invoices = [
    ["INV-02481", "12,840", "PAID"],
    ["INV-02480", "8,420", "PAID"],
    ["INV-02479", "18,920", "PENDING"],
    ["INV-02478", "6,180", "PAID"],
    ["INV-02477", "14,720", "PENDING"],
  ];

  return (
    <div className="module-visual sales-visual">
      <div className="invoice-stack">
        {invoices.map(([id, amount, status], index) => (
          <div
            key={id}
            className="invoice-card"
            style={{
              transform: `translateY(${index * 10}px) translateX(${
                index * 8
              }px) rotate(${index % 2 === 0 ? -1 : 1}deg)`,
            }}
          >
            <div className="invoice-head">
              <span>{id}</span>
              <span className={status === "PAID" ? "paid" : "pending"}>
                {status}
              </span>
            </div>

            <strong>{amount}</strong>

            <div className="invoice-line">
              <span />
              <span />
              <span />
            </div>

            <small>CLIENT LEDGER / SYNCHRONIZED</small>
          </div>
        ))}
      </div>

      <div className="visual-side-data">
        <span>TRANSACTION FLOW</span>

        <div className="flow-line">
          <i />
          <div>
            <strong>Invoice</strong>
            <small>Generated</small>
          </div>
        </div>

        <div className="flow-line">
          <i />
          <div>
            <strong>Ledger</strong>
            <small>Synchronized</small>
          </div>
        </div>

        <div className="flow-line">
          <i />
          <div>
            <strong>Payment</strong>
            <small>Reconciled</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarehouseVisual() {
  const cells = Array.from({ length: 64 });

  return (
    <div className="module-visual warehouse-visual">
      <div className="warehouse-grid">
        {cells.map((_, index) => (
          <span
            key={index}
            className={
              index % 9 === 0 ? "occupied" : index % 13 === 0 ? "warning" : ""
            }
          >
            {index % 9 === 0 ? <b /> : index % 13 === 0 ? <i /> : null}
          </span>
        ))}
      </div>

      <div className="warehouse-scan">
        <div className="scan-beam" />

        <div className="scan-target">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="scan-label">
          <strong>LOCATION A-14</strong>
          <small>BARCODE VERIFIED</small>
        </div>
      </div>

      <div className="warehouse-stats">
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
    <div className="module-visual procurement-visual">
      <div className="procurement-line">
        <div className="line-progress" />
      </div>

      <div className="procurement-chain">
        {steps.map(([label, id], index) => (
          <div
            className="procurement-step"
            key={label}
            style={{
              animationDelay: `${index * 120}ms`,
            }}
          >
            <div className="procurement-node">
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>

            <small>{label}</small>
            <strong>{id}</strong>
          </div>
        ))}
      </div>

      <div className="vendor-panel">
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
    <div className="module-visual risk-visual">
      <div className="radar">
        <div className="radar-ring r1" />
        <div className="radar-ring r2" />
        <div className="radar-ring r3" />
        <div className="radar-cross cross-x" />
        <div className="radar-cross cross-y" />

        <div className="radar-sweep" />

        <span className="risk-dot dot-a" />
        <span className="risk-dot dot-b" />
        <span className="risk-dot dot-c" />
        <span className="risk-dot dot-d" />
        <span className="risk-dot dot-e" />

        <div className="radar-center">AR</div>
      </div>

      <div className="risk-panel">
        <span>PORTFOLIO EXPOSURE</span>

        <strong>
          12,150
          <small>OUTSTANDING</small>
        </strong>

        <div className="risk-bars">
          <div>
            <span>0–30</span>
            <i style={{ width: "82%" }} />
          </div>

          <div>
            <span>31–60</span>
            <i style={{ width: "54%" }} />
          </div>

          <div>
            <span>61–90</span>
            <i style={{ width: "29%" }} />
          </div>

          <div>
            <span>90+</span>
            <i style={{ width: "12%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleVisual({ moduleIndex }: { moduleIndex: number }) {
  switch (moduleIndex) {
    case 0:
      return <SalesVisual />;
    case 1:
      return <WarehouseVisual />;
    case 2:
      return <ProcurementVisual />;
    default:
      return <RiskVisual />;
  }
}

export default function Home() {
  const scrollProgress = useScrollProgress();
  const pointer = usePointer();

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

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const active = modules[activeModule];

  const heroTransform = useMemo(() => {
    const local = clamp(scrollProgress * 4);

    return {
      opacity: 1 - local * 0.75,
      transform: `
        translateY(${local * -70}px)
        scale(${1 - local * 0.035})
      `,
    };
  }, [scrollProgress]);

  return (
    <main className="page">
      <Noise />

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* HEADER */}

      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">
              <i />
              <i />
              <i />
            </span>

            <span>LedgerCore</span>
          </Link>

          <div className="header-center">
            <span className="status-dot" />
            <span>SYSTEM OPERATIONAL</span>
            <em>v2.4.0</em>
          </div>

          <nav className={menuOpen ? "header-nav open" : "header-nav"}>
            <Link href="#systems">Systems</Link>
            <Link href="#modules">Modules</Link>
            <Link href="#architecture">Architecture</Link>

            <Link href="/login" className="sign-in">
              Sign In
            </Link>

            {/* <Link href="/dashboard-redirect" className="dashboard-link">
              Launch Dashboard
              <span>↗</span>
            </Link> */}
            <Link href="#" className="dashboard-link">
              Coming soon
              <span>↗</span>
            </Link>
          </nav>

          <button
            className="menu-button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* HERO */}

      <section className="hero">
        <div className="hero-grid" />

        <div className="hero-content" style={heroTransform}>
          <div className="eyebrow">
            <span>ERP / OPERATING SYSTEM</span>
            <i />
            <span>FOR MODERN ENTERPRISE</span>
          </div>

          <h1>
            Business,
            <br />
            <span>in motion.</span>
          </h1>

          <p className="hero-copy">
            One operational layer for sales, inventory, procurement and
            financial control. Built to make every movement of your business
            visible.
          </p>

          <div className="hero-meta">
            <div>
              <span>01</span>
              <strong>CONTROL</strong>
            </div>

            <div>
              <span>02</span>
              <strong>CONNECT</strong>
            </div>

            <div>
              <span>03</span>
              <strong>COMPOUND</strong>
            </div>
          </div>
        </div>

        <div className="hero-screen">
          <DashboardScreen activeModule={activeModule} pointer={pointer} />
        </div>

        <div className="hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-indicator">
            <i />
          </div>
          <span>01 / 05</span>
        </div>
      </section>

      {/* MANIFESTO */}

      <section className="manifesto" id="systems">
        <div className="manifesto-grid">
          <div className="section-number">01</div>

          <div className="manifesto-title">
            <span>THE OPERATING LAYER</span>

            <h2>
              Every transaction
              <br />
              leaves a trace.
            </h2>
          </div>

          <div className="manifesto-copy">
            <p>
              Modern businesses generate thousands of operational events every
              day.
            </p>

            <p>
              ERP_CORE turns those events into one continuous system of record —
              connecting commercial activity directly to inventory and financial
              outcomes.
            </p>

            <div className="telemetry">
              <DataPulse />

              <div>
                <strong>
                  <Counter value={9998} />%
                </strong>

                <span>DATA INTEGRITY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM MAP */}

      <section className="system-section" id="architecture">
        <div className="system-header">
          <div>
            <span className="eyebrow-small">02 // SYSTEM ARCHITECTURE</span>

            <h2>
              Four systems.
              <br />
              One source of truth.
            </h2>
          </div>

          <div className="system-description">
            Select a subsystem.
            <br />
            The operating layer reorganizes around it.
          </div>
        </div>

        <OrbitSystem
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />

        <div className="system-footer">
          <span>ACTIVE SYSTEM</span>

          <strong>
            {active.code} — {active.title}
          </strong>

          <span>CONNECTED / 04</span>
        </div>
      </section>

      {/* MODULES */}

      <section className="modules" id="modules">
        {modules.map((module, index) => {
          const isActive = activeModule === index;

          return (
            <section
              key={module.id}
              ref={(element) => {
                moduleRefs.current[index] = element;
              }}
              className={`module-section ${isActive ? "is-active" : ""}`}
            >
              <div className="module-top">
                <span>{module.code}</span>

                <span>SYSTEM {String(index + 1).padStart(2, "0")} / 04</span>
              </div>

              <div className="module-layout">
                <div className="module-copy">
                  <div className="module-label">
                    <i />
                    {module.status}
                  </div>

                  <h2>{module.title}</h2>

                  <p>{module.summary}</p>

                  <div className="module-metric">
                    <span>{module.metricLabel}</span>
                    <strong>{module.metric}</strong>
                  </div>

                  <div className="module-bullets">
                    {module.bullets.map((bullet, bulletIndex) => (
                      <div key={bullet}>
                        <span>{String(bulletIndex + 1).padStart(2, "0")}</span>
                        <p>{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="module-stage">
                  <ModuleVisual moduleIndex={index} />

                  <div className="stage-coordinate">
                    X: {String(21 + index * 18).padStart(3, "0")}
                    &nbsp;&nbsp; Y: {String(74 - index * 7).padStart(3, "0")}
                  </div>

                  <div className="stage-status">
                    <span />
                    PROCESSING
                  </div>
                </div>
              </div>

              <div className="module-bottom">
                <span>ERP_CORE / {module.code}</span>

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
            </section>
          );
        })}
      </section>

      {/* CONTROL STRIP */}

      <section className="control-strip">
        <div className="control-strip-inner">
          <div className="control-intro">
            <span>03 // CONTINUOUS CONTROL</span>
            <h2>
              The numbers
              <br />
              move with you.
            </h2>
          </div>

          <div className="control-stream">
            <div className="stream-row">
              <span>SALES</span>
              <i />
              <strong>142,850</strong>
              <em>+18.4%</em>
            </div>

            <div className="stream-row">
              <span>INVENTORY</span>
              <i />
              <strong>1,240 UNITS</strong>
              <em>+6.8%</em>
            </div>

            <div className="stream-row">
              <span>PROCUREMENT</span>
              <i />
              <strong>38,400</strong>
              <em>12 OPEN</em>
            </div>

            <div className="stream-row">
              <span>AR RISK</span>
              <i />
              <strong>12,150</strong>
              <em>3 OVERDUE</em>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}

      <section className="final">
        <div className="final-grid" />

        <div className="final-content">
          <span className="eyebrow-small">
            04 // DEPLOY YOUR OPERATING LAYER
          </span>

          <h2>
            Make the
            <br />
            <span>business visible.</span>
          </h2>

          <p>
            Replace disconnected workflows with one system that understands how
            every part of your business moves.
          </p>

          {/* <Link href="/dashboard-redirect" className="final-button">
            <span>Enter ERP_CORE</span>
            <strong>↗</strong>
          </Link> */}
          <Link href="#" className="final-button">
            <span>Coming Soon</span>
            <strong>↗</strong>
          </Link>
        </div>

        <div className="final-orbit">
          <div />
          <div />
          <div />
          <span>ERP</span>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-logo">
            <span className="logo-mark">
              <i />
              <i />
              <i />
            </span>
            LedgerCore
          </div>

          <span>OPERATIONAL INTELLIGENCE / 2026</span>

          <span>ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="footer-bottom">
          <span>© 2026 ERP_CORE</span>

          <div>
            <Link href="/login">SIGN IN</Link>
            <Link href="/dashboard-redirect">DASHBOARD ↗</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --bg: #050505;
          --panel: #0a0a0a;
          --panel-2: #0f0f0f;
          --line: rgba(255, 255, 255, 0.1);
          --line-soft: rgba(255, 255, 255, 0.055);
          --text: #f5f5f5;
          --muted: #858585;
          --dim: #454545;
          --accent: #d9ff43;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          background: var(--bg);
        }

        body {
          margin: 0;
          background: var(--bg);
          color: var(--text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
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
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 255, 255, 0.045),
              transparent 28%
            ),
            var(--bg);
          overflow: hidden;
        }

        .noise {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E");
          mix-blend-mode: screen;
        }

        .ambient {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(100px);
          opacity: 0.12;
        }

        .ambient-one {
          width: 400px;
          height: 400px;
          top: 15%;
          left: -220px;
          background: white;
        }

        .ambient-two {
          width: 500px;
          height: 500px;
          top: 45%;
          right: -300px;
          background: var(--accent);
          opacity: 0.035;
        }

        /* HEADER */

        .header {
          position: fixed;
          z-index: 90;
          top: 16px;
          left: 50%;
          width: min(1180px, calc(100% - 32px));
          transform: translateX(-50%);
        }

        .header-inner {
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 8px 0 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(7, 7, 7, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 999px;
          box-shadow:
            0 10px 50px rgba(0, 0, 0, 0.35),
            inset 0 1px rgba(255, 255, 255, 0.04);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 12px;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .logo > span:last-child span {
          color: #686868;
        }

        .logo-mark {
          position: relative;
          width: 23px;
          height: 23px;
          display: flex;
          gap: 3px;
          align-items: end;
        }

        .logo-mark i {
          display: block;
          width: 5px;
          background: white;
          border-radius: 2px;
        }

        .logo-mark i:nth-child(1) {
          height: 8px;
          opacity: 0.45;
        }

        .logo-mark i:nth-child(2) {
          height: 15px;
          opacity: 0.7;
        }

        .logo-mark i:nth-child(3) {
          height: 22px;
        }

        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          color: #777;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .header-center em {
          padding-left: 7px;
          border-left: 1px solid #303030;
          color: #4e4e4e;
          font-style: normal;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(217, 255, 67, 0.6);
          animation: blink 2s infinite;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          color: #888;
        }

        .header-nav a {
          transition:
            color 0.25s ease,
            opacity 0.25s ease;
        }

        .header-nav a:hover {
          color: white;
        }

        .sign-in {
          margin-left: 4px;
          color: #aaa;
        }

        .dashboard-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 13px;
          border-radius: 999px;
          background: white;
          color: black !important;
          font-weight: 600;
        }

        .dashboard-link span {
          font-size: 13px;
        }

        .menu-button {
          display: none;
        }

        /* HERO */

        .hero {
          position: relative;
          min-height: 115vh;
          padding: 150px 24px 80px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          isolation: isolate;
        }

        .hero-grid,
        .final-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.35;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.045) 1px,
              transparent 1px
            );
          background-size: 80px 80px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        .hero-content {
          position: relative;
          z-index: 3;
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .eyebrow,
        .eyebrow-small {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          letter-spacing: 0.13em;
          color: #747474;
        }

        .eyebrow i {
          width: 24px;
          height: 1px;
          background: #454545;
        }

        .hero h1 {
          max-width: 1050px;
          margin: 26px 0 0;
          font-size: clamp(72px, 11.5vw, 170px);
          line-height: 0.82;
          letter-spacing: -0.085em;
          font-weight: 500;
        }

        .hero h1 span {
          color: #6b6b6b;
        }

        .hero-copy {
          width: 390px;
          margin: 32px 0 0 6px;
          color: #818181;
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-meta {
          display: flex;
          gap: 38px;
          margin-top: 35px;
          margin-left: 6px;
        }

        .hero-meta div {
          display: flex;
          gap: 9px;
          align-items: center;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
        }

        .hero-meta span {
          color: #484848;
        }

        .hero-meta strong {
          color: #9a9a9a;
          font-weight: 500;
        }

        .hero-screen {
          position: relative;
          z-index: 4;
          width: min(1020px, 92%);
          margin: 70px auto 0;
        }

        .screen-wrap {
          position: relative;
          transition: transform 0.2s ease-out;
          transform-style: preserve-3d;
        }

        .screen-glow {
          position: absolute;
          width: 70%;
          height: 55%;
          left: 15%;
          bottom: -15%;
          background: rgba(255, 255, 255, 0.12);
          filter: blur(80px);
          opacity: 0.3;
        }

        .dashboard-screen {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 18px;
          overflow: hidden;
          background: #080808;
          box-shadow:
            0 60px 120px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.025);
        }

        .screen-top {
          height: 44px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid var(--line);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
        }

        .screen-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c7c7c7;
        }

        .brand-square {
          width: 6px;
          height: 6px;
          background: var(--accent);
          box-shadow: 0 0 12px rgba(217, 255, 67, 0.5);
        }

        .screen-path {
          text-align: center;
          color: #4d4d4d;
        }

        .screen-live {
          justify-self: end;
          display: flex;
          gap: 6px;
          align-items: center;
          color: #666;
        }

        .screen-live i {
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
        }

        .screen-body {
          min-height: 390px;
          display: grid;
          grid-template-columns: 150px 1fr;
        }

        .screen-sidebar {
          padding: 18px 0;
          border-right: 1px solid var(--line);
        }

        .side-module {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 18px;
          opacity: 0.35;
          border-left: 1px solid transparent;
          transition: 0.3s ease;
        }

        .side-module.selected {
          opacity: 1;
          border-left-color: var(--accent);
          background: rgba(255, 255, 255, 0.025);
        }

        .side-module span {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          color: #555;
        }

        .side-module strong {
          font-size: 9px;
          font-weight: 500;
        }

        .screen-main {
          padding: 22px 26px;
        }

        .screen-heading {
          display: flex;
          justify-content: space-between;
        }

        .screen-heading span,
        .screen-metrics span {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .screen-heading h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.03em;
        }

        .screen-date {
          text-align: right;
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          line-height: 1.7;
        }

        .screen-metrics {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 1px;
          margin-top: 22px;
          border: 1px solid var(--line);
          background: var(--line);
        }

        .screen-metrics > div {
          padding: 13px;
          background: #0a0a0a;
        }

        .screen-metrics strong {
          font-size: 12px;
          font-weight: 500;
        }

        .screen-visual {
          position: relative;
          height: 165px;
          margin-top: 1px;
          overflow: hidden;
          background: #090909;
          border: 1px solid var(--line);
        }

        .visual-grid {
          position: absolute;
          inset: 0;
          opacity: 0.4;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
        }

        .chart-line {
          position: absolute;
          inset: 25px 20px 20px;
          color: rgba(255, 255, 255, 0.7);
          animation: chartFloat 5s ease-in-out infinite;
        }

        .chart-line svg {
          width: 100%;
          height: 100%;
        }

        .chart-label {
          position: absolute;
          padding: 5px 7px;
          border: 1px solid var(--line);
          background: #0a0a0a;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          color: #777;
        }

        .label-one {
          left: 18px;
          top: 14px;
        }

        .label-two {
          right: 20px;
          top: 25px;
          color: var(--accent);
        }

        .chart-point {
          position: absolute;
          width: 6px;
          height: 6px;
          border: 1px solid #aaa;
          background: #080808;
          border-radius: 50%;
        }

        .point-one {
          left: 38%;
          top: 67%;
        }

        .point-two {
          left: 68%;
          top: 48%;
        }

        .point-three {
          right: 9%;
          top: 18%;
        }

        .screen-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          margin-top: 1px;
        }

        .mini-bars,
        .screen-log {
          height: 72px;
          padding: 13px;
          border: 1px solid var(--line);
          background: #090909;
        }

        .mini-bars {
          display: flex;
          align-items: end;
          gap: 5px;
        }

        .mini-bars span {
          flex: 1;
          min-width: 2px;
          background: #343434;
          transition: background 0.3s ease;
        }

        .mini-bars span:nth-child(8),
        .mini-bars span:nth-child(10) {
          background: #777;
        }

        .screen-log {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          color: #5d5d5d;
        }

        .screen-log div {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .screen-log i {
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
        }

        .screen-footer {
          display: flex;
          justify-content: space-between;
          padding: 9px 15px;
          border-top: 1px solid var(--line);
          color: #404040;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          letter-spacing: 0.08em;
        }

        .hero-bottom {
          position: relative;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: min(1120px, 100%);
          margin: 45px auto 0;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          color: #4b4b4b;
        }

        .scroll-indicator {
          position: absolute;
          left: 50%;
          width: 1px;
          height: 45px;
          transform: translateX(-50%);
          background: #252525;
          overflow: hidden;
        }

        .scroll-indicator i {
          position: absolute;
          top: -20px;
          width: 1px;
          height: 20px;
          background: white;
          animation: scrollLine 2s infinite;
        }

        /* MANIFESTO */

        .manifesto {
          position: relative;
          min-height: 65vh;
          display: flex;
          align-items: center;
          padding: 100px 24px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .manifesto-grid {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 80px 1.4fr 0.8fr;
          gap: 40px;
        }

        .section-number {
          padding-top: 7px;
          color: #404040;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
        }

        .manifesto-title span {
          color: #525252;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          letter-spacing: 0.12em;
        }

        .manifesto-title h2,
        .system-header h2,
        .control-intro h2 {
          margin: 25px 0 0;
          font-size: clamp(48px, 6vw, 82px);
          line-height: 0.92;
          letter-spacing: -0.065em;
          font-weight: 450;
        }

        .manifesto-copy {
          padding-top: 45px;
          color: #777;
          font-size: 13px;
          line-height: 1.8;
        }

        .manifesto-copy p {
          margin: 0 0 18px;
        }

        .telemetry {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-top: 45px;
        }

        .telemetry strong {
          display: block;
          color: #eee;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 20px;
          font-weight: 400;
        }

        .telemetry span {
          color: #4c4c4c;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .data-pulse {
          position: relative;
          width: 100px;
          height: 30px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .data-pulse span {
          flex: 1;
          height: 1px;
          background: #555;
          animation: pulseData 1.8s infinite;
        }

        .data-pulse span:nth-child(2) {
          animation-delay: 0.1s;
        }

        .data-pulse span:nth-child(3) {
          animation-delay: 0.2s;
        }

        .data-pulse span:nth-child(4) {
          animation-delay: 0.3s;
        }

        .data-pulse span:nth-child(5) {
          animation-delay: 0.4s;
        }

        /* SYSTEM */

        .system-section {
          position: relative;
          min-height: 90vh;
          padding: 90px 24px;
          border-bottom: 1px solid var(--line);
        }

        .system-header {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
        }

        .system-description {
          align-self: end;
          width: 220px;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          line-height: 1.8;
          text-transform: uppercase;
        }

        .orbit-system {
          position: relative;
          width: min(680px, 90vw);
          height: 500px;
          margin: 25px auto 0;
        }

        .orbit-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-one {
          width: 250px;
          height: 250px;
          animation: orbitSpin 24s linear infinite;
        }

        .ring-two {
          width: 390px;
          height: 390px;
          border-style: dashed;
          animation: orbitSpinReverse 35s linear infinite;
        }

        .ring-three {
          width: 540px;
          height: 540px;
          opacity: 0.5;
          animation: orbitSpin 45s linear infinite;
        }

        .orbit-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 130px;
          height: 130px;
          display: grid;
          place-items: center;
          transform: translate(-50%, -50%);
        }

        .center-core {
          position: relative;
          width: 82px;
          height: 82px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          background: #080808;
          box-shadow: 0 0 70px rgba(255, 255, 255, 0.07);
        }

        .center-core span {
          position: absolute;
          top: 12px;
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(217, 255, 67, 0.8);
        }

        .center-core strong {
          margin-top: 3px;
          font-size: 15px;
          font-weight: 500;
        }

        .center-core small {
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          letter-spacing: 0.15em;
        }

        .orbit-node {
          position: absolute;
          width: 130px;
          min-height: 82px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 12px;
          border: 1px solid var(--line);
          background: rgba(9, 9, 9, 0.85);
          color: #777;
          text-align: left;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition:
            border 0.35s ease,
            background 0.35s ease,
            color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .orbit-node:hover,
        .orbit-node.active {
          border-color: rgba(255, 255, 255, 0.35);
          color: white;
          background: #0d0d0d;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
        }

        .node-index,
        .node-status {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
          color: #4e4e4e;
        }

        .node-title {
          margin-top: 7px;
          font-size: 10px;
        }

        .node-status {
          margin-top: auto;
          color: #666;
        }

        .orbit-node.active .node-status {
          color: var(--accent);
        }

        .system-footer {
          width: min(680px, 90vw);
          margin: -10px auto 0;
          display: flex;
          justify-content: space-between;
          color: #484848;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .system-footer strong {
          color: #8a8a8a;
          font-weight: 400;
        }

        /* MODULES */

        .modules {
          position: relative;
        }

        .module-section {
          position: relative;
          min-height: 100vh;
          padding: 100px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
          transition: background 0.7s ease;
        }

        .module-section.is-active {
          background: radial-gradient(
            circle at 70% 50%,
            rgba(255, 255, 255, 0.025),
            transparent 35%
          );
        }

        .module-top,
        .module-bottom {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          letter-spacing: 0.08em;
        }

        .module-layout {
          width: min(1120px, 100%);
          margin: 60px auto 65px;
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 70px;
          align-items: center;
        }

        .module-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          text-transform: uppercase;
        }

        .module-label i {
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(217, 255, 67, 0.4);
        }

        .module-copy h2 {
          margin: 20px 0 18px;
          max-width: 450px;
          font-size: clamp(48px, 5.3vw, 74px);
          line-height: 0.91;
          letter-spacing: -0.065em;
          font-weight: 450;
        }

        .module-copy > p {
          max-width: 390px;
          margin: 0;
          color: #717171;
          font-size: 13px;
          line-height: 1.7;
        }

        .module-metric {
          margin-top: 40px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .module-metric span {
          display: block;
          margin-bottom: 7px;
          color: #4e4e4e;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
          text-transform: uppercase;
        }

        .module-metric strong {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 25px;
          font-weight: 400;
          letter-spacing: -0.03em;
        }

        .module-bullets {
          margin-top: 35px;
          border-top: 1px solid var(--line-soft);
        }

        .module-bullets > div {
          display: grid;
          grid-template-columns: 30px 1fr;
          align-items: center;
          min-height: 39px;
          border-bottom: 1px solid var(--line-soft);
        }

        .module-bullets span {
          color: #3e3e3e;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .module-bullets p {
          margin: 0;
          color: #818181;
          font-size: 10px;
        }

        .module-stage {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent 45%),
            #080808;
          overflow: hidden;
        }

        .module-stage::before,
        .module-stage::after {
          content: "";
          position: absolute;
          pointer-events: none;
        }

        .module-stage::before {
          inset: 0;
          opacity: 0.25;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size: 60px 60px;
        }

        .module-stage::after {
          width: 250px;
          height: 250px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 50%;
        }

        .stage-coordinate {
          position: absolute;
          left: 15px;
          bottom: 13px;
          color: #383838;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .stage-status {
          position: absolute;
          top: 14px;
          right: 15px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #454545;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .stage-status span {
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
        }

        .module-bottom {
          align-items: center;
        }

        .module-progress {
          width: 280px;
          height: 1px;
          background: #202020;
        }

        .module-progress i {
          display: block;
          height: 1px;
          background: #aaa;
        }

        /* SALES */

        .module-visual {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
        }

        .sales-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 45px;
          padding: 45px;
        }

        .invoice-stack {
          position: relative;
          width: 260px;
          height: 290px;
        }

        .invoice-card {
          position: absolute;
          left: 0;
          top: 20px;
          width: 250px;
          min-height: 180px;
          padding: 17px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: #0c0c0c;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          transition: 0.5s ease;
        }

        .invoice-card:first-child {
          z-index: 6;
          transform: none !important;
        }

        .invoice-head {
          display: flex;
          justify-content: space-between;
          color: #555;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .invoice-head .paid {
          color: var(--accent);
        }

        .invoice-head .pending {
          color: #777;
        }

        .invoice-card strong {
          display: block;
          margin-top: 32px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 23px;
          font-weight: 400;
        }

        .invoice-line {
          display: flex;
          gap: 5px;
          margin-top: 25px;
        }

        .invoice-line span {
          height: 3px;
          background: #292929;
        }

        .invoice-line span:nth-child(1) {
          width: 55%;
        }

        .invoice-line span:nth-child(2) {
          width: 20%;
        }

        .invoice-line span:nth-child(3) {
          width: 15%;
        }

        .invoice-card small {
          display: block;
          margin-top: 25px;
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .visual-side-data {
          width: 150px;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .visual-side-data > span {
          color: #444;
          font-size: 6px;
        }

        .flow-line {
          position: relative;
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-bottom: 20px;
        }

        .flow-line:not(:last-child)::after {
          content: "";
          position: absolute;
          left: 2px;
          top: 9px;
          width: 1px;
          height: 36px;
          background: #292929;
        }

        .flow-line i {
          position: relative;
          z-index: 2;
          width: 5px;
          height: 5px;
          margin-top: 2px;
          background: white;
          border-radius: 50%;
        }

        .flow-line strong,
        .flow-line small {
          display: block;
        }

        .flow-line strong {
          color: #aaa;
          font-size: 8px;
          font-weight: 400;
        }

        .flow-line small {
          margin-top: 4px;
          color: #4c4c4c;
          font-size: 6px;
        }

        /* WAREHOUSE */

        .warehouse-visual {
          padding: 60px;
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 30px;
          align-items: center;
        }

        .warehouse-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 5px;
        }

        .warehouse-grid span {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.015);
        }

        .warehouse-grid span.occupied {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .warehouse-grid span.warning {
          border-color: rgba(217, 255, 67, 0.4);
        }

        .warehouse-grid b,
        .warehouse-grid i {
          position: absolute;
          inset: 25%;
          background: #777;
        }

        .warehouse-grid i {
          background: var(--accent);
          opacity: 0.75;
        }

        .warehouse-scan {
          position: relative;
          height: 280px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
        }

        .scan-beam {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--accent);
          box-shadow: 0 0 20px var(--accent);
          animation: scan 2.5s linear infinite;
        }

        .scan-target {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 90px;
          height: 90px;
          transform: translate(-50%, -50%);
        }

        .scan-target span {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: #aaa;
        }

        .scan-target span:nth-child(1) {
          top: 0;
          left: 0;
          border-top: 1px solid;
          border-left: 1px solid;
        }

        .scan-target span:nth-child(2) {
          top: 0;
          right: 0;
          border-top: 1px solid;
          border-right: 1px solid;
        }

        .scan-target span:nth-child(3) {
          bottom: 0;
          left: 0;
          border-bottom: 1px solid;
          border-left: 1px solid;
        }

        .scan-target span:nth-child(4) {
          bottom: 0;
          right: 0;
          border-bottom: 1px solid;
          border-right: 1px solid;
        }

        .scan-label {
          position: absolute;
          bottom: 18px;
          left: 18px;
        }

        .scan-label strong,
        .scan-label small {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .scan-label strong {
          font-size: 8px;
        }

        .scan-label small {
          margin-top: 5px;
          color: var(--accent);
          font-size: 6px;
        }

        .warehouse-stats {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--line);
        }

        .warehouse-stats div {
          padding-top: 15px;
          border-right: 1px solid var(--line);
        }

        .warehouse-stats div:last-child {
          border: 0;
          padding-left: 15px;
        }

        .warehouse-stats span,
        .warehouse-stats strong {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .warehouse-stats span {
          color: #444;
          font-size: 6px;
        }

        .warehouse-stats strong {
          margin-top: 7px;
          font-size: 16px;
          font-weight: 400;
        }

        /* PROCUREMENT */

        .procurement-visual {
          padding: 60px 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .procurement-line {
          position: relative;
          height: 1px;
          background: #292929;
        }

        .line-progress {
          position: absolute;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #aaa, transparent);
          animation: progressLine 2.5s infinite;
        }

        .procurement-chain {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          margin-top: -15px;
        }

        .procurement-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: nodeAppear 0.8s ease both;
        }

        .procurement-node {
          position: relative;
          z-index: 2;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 1px solid #555;
          border-radius: 50%;
          background: #080808;
        }

        .procurement-node span {
          color: #777;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .procurement-step small,
        .procurement-step strong {
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .procurement-step small {
          margin-top: 15px;
          color: #484848;
          font-size: 6px;
        }

        .procurement-step strong {
          margin-top: 5px;
          color: #999;
          font-size: 7px;
          font-weight: 400;
        }

        .vendor-panel {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          margin-top: 70px;
          border: 1px solid var(--line);
        }

        .vendor-panel div {
          padding: 18px;
          border-right: 1px solid var(--line);
        }

        .vendor-panel div:last-child {
          border: 0;
        }

        .vendor-panel span,
        .vendor-panel strong {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
        }

        .vendor-panel span {
          color: #444;
          font-size: 6px;
        }

        .vendor-panel strong {
          margin-top: 7px;
          color: #aaa;
          font-size: 9px;
          font-weight: 400;
        }

        /* RISK */

        .risk-visual {
          padding: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 80px;
        }

        .radar {
          position: relative;
          width: 300px;
          height: 300px;
          border-radius: 50%;
        }

        .radar-ring {
          position: absolute;
          inset: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .r1 {
          width: 100%;
          height: 100%;
        }

        .r2 {
          width: 68%;
          height: 68%;
        }

        .r3 {
          width: 34%;
          height: 34%;
        }

        .radar-cross {
          position: absolute;
          background: rgba(255, 255, 255, 0.06);
        }

        .cross-x {
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
        }

        .cross-y {
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
          animation: radarSweep 3s linear infinite;
        }

        .risk-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #999;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
          animation: riskPulse 2s infinite;
        }

        .dot-a {
          top: 25%;
          left: 64%;
        }

        .dot-b {
          top: 62%;
          left: 25%;
        }

        .dot-c {
          top: 73%;
          left: 69%;
        }

        .dot-d {
          top: 35%;
          left: 32%;
          background: var(--accent);
        }

        .dot-e {
          top: 54%;
          left: 77%;
        }

        .radar-center {
          position: absolute;
          top: 50%;
          left: 50%;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          transform: translate(-50%, -50%);
          border: 1px solid #555;
          border-radius: 50%;
          background: #080808;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
        }

        .risk-panel {
          width: 190px;
        }

        .risk-panel > span {
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .risk-panel > strong {
          display: block;
          margin-top: 14px;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 25px;
          font-weight: 400;
        }

        .risk-panel > strong small {
          display: block;
          margin-top: 5px;
          color: #444;
          font-size: 6px;
          font-weight: 400;
        }

        .risk-bars {
          margin-top: 30px;
        }

        .risk-bars div {
          display: grid;
          grid-template-columns: 35px 1fr;
          align-items: center;
          gap: 10px;
          margin-bottom: 13px;
        }

        .risk-bars span {
          color: #4d4d4d;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 6px;
        }

        .risk-bars i {
          display: block;
          height: 2px;
          background: #666;
        }

        .risk-bars div:last-child i {
          background: var(--accent);
        }

        /* CONTROL STRIP */

        .control-strip {
          position: relative;
          padding: 110px 24px;
          border-bottom: 1px solid var(--line);
        }

        .control-strip-inner {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
          align-items: center;
        }

        .control-intro span {
          color: #484848;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
        }

        .control-stream {
          border-top: 1px solid var(--line);
        }

        .stream-row {
          display: grid;
          grid-template-columns: 100px 1fr 130px 80px;
          gap: 15px;
          align-items: center;
          min-height: 55px;
          border-bottom: 1px solid var(--line);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .stream-row > span {
          color: #555;
        }

        .stream-row i {
          height: 1px;
          background: #282828;
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

        /* FINAL */

        .final {
          position: relative;
          min-height: 75vh;
          display: flex;
          align-items: center;
          padding: 100px 24px;
          overflow: hidden;
        }

        .final-grid {
          opacity: 0.25;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black,
            transparent
          );
        }

        .final-content {
          position: relative;
          z-index: 3;
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .final-content h2 {
          margin: 25px 0;
          font-size: clamp(70px, 10vw, 145px);
          line-height: 0.8;
          letter-spacing: -0.085em;
          font-weight: 450;
        }

        .final-content h2 span {
          color: #656565;
        }

        .final-content p {
          width: 340px;
          color: #707070;
          font-size: 13px;
          line-height: 1.7;
        }

        .final-button {
          display: inline-flex;
          align-items: center;
          gap: 35px;
          margin-top: 25px;
          padding: 15px 18px;
          border: 1px solid #555;
          background: #eee;
          color: #050505;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          transition:
            transform 0.3s ease,
            background 0.3s ease;
        }

        .final-button:hover {
          transform: translateY(-3px);
          background: white;
        }

        .final-button strong {
          font-size: 15px;
          font-weight: 400;
        }

        .final-orbit {
          position: absolute;
          width: 550px;
          height: 550px;
          right: -80px;
          top: 50%;
          transform: translateY(-50%);
        }

        .final-orbit div {
          position: absolute;
          inset: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .final-orbit div:nth-child(1) {
          width: 100%;
          height: 100%;
          animation: orbitSpin 25s linear infinite;
        }

        .final-orbit div:nth-child(2) {
          width: 65%;
          height: 65%;
          animation: orbitSpinReverse 18s linear infinite;
        }

        .final-orbit div:nth-child(3) {
          width: 30%;
          height: 30%;
          border-color: rgba(217, 255, 67, 0.25);
        }

        .final-orbit span {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 80px;
          display: grid;
          place-items: center;
          transform: translate(-50%, -50%);
          border: 1px solid #333;
          border-radius: 50%;
          background: #080808;
          color: #aaa;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
        }

        /* FOOTER */

        .footer {
          padding: 20px 24px 30px;
          border-top: 1px solid var(--line);
          color: #444;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 7px;
        }

        .footer-top,
        .footer-bottom {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-top {
          padding-bottom: 22px;
          border-bottom: 1px solid var(--line);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #777;
        }

        .footer-logo .logo-mark {
          transform: scale(0.7);
        }

        .footer-bottom {
          padding-top: 22px;
        }

        .footer-bottom div {
          display: flex;
          gap: 25px;
        }

        .footer-bottom a:hover {
          color: #aaa;
        }

        /* ANIMATIONS */

        @keyframes blink {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes scrollLine {
          0% {
            transform: translateY(-20px);
          }

          100% {
            transform: translateY(65px);
          }
        }

        @keyframes chartFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes pulseData {
          0%,
          100% {
            transform: scaleY(0.3);
            opacity: 0.3;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes orbitSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes orbitSpinReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes scan {
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
            transform: translateY(280px);
            opacity: 0;
          }
        }

        @keyframes progressLine {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        @keyframes nodeAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes radarSweep {
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
            opacity: 0.5;
          }

          50% {
            transform: scale(1.7);
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          .header-center {
            display: none;
          }

          .header-nav {
            gap: 12px;
          }

          .manifesto-grid {
            grid-template-columns: 45px 1fr;
          }

          .manifesto-copy {
            grid-column: 2;
            padding-top: 0;
          }

          .module-layout {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .module-stage {
            min-height: 440px;
          }

          .control-strip-inner {
            grid-template-columns: 1fr;
            gap: 50px;
          }

          .final-orbit {
            right: -200px;
            opacity: 0.45;
          }
        }

        @media (max-width: 700px) {
          .header {
            top: 10px;
            width: calc(100% - 20px);
          }

          .header-inner {
            height: 52px;
          }

          .header-nav {
            position: absolute;
            top: 62px;
            left: 0;
            right: 0;
            display: none;
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            border: 1px solid var(--line);
            border-radius: 18px;
            background: rgba(7, 7, 7, 0.95);
            backdrop-filter: blur(25px);
          }

          .header-nav.open {
            display: flex;
          }

          .header-nav a {
            padding: 10px 4px;
          }

          .menu-button {
            width: 40px;
            height: 40px;
            display: flex;
            margin-left: auto;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 5px;
            border: 0;
            background: transparent;
          }

          .menu-button span {
            width: 15px;
            height: 1px;
            background: #aaa;
          }

          .hero {
            min-height: auto;
            padding-top: 130px;
            padding-bottom: 60px;
          }

          .hero h1 {
            font-size: clamp(62px, 19vw, 100px);
          }

          .hero-copy {
            width: min(100%, 350px);
            font-size: 12px;
          }

          .hero-meta {
            gap: 20px;
          }

          .hero-screen {
            width: 100%;
            margin-top: 55px;
          }

          .dashboard-screen {
            border-radius: 12px;
          }

          .screen-body {
            grid-template-columns: 1fr;
          }

          .screen-sidebar {
            display: none;
          }

          .screen-main {
            padding: 15px;
          }

          .screen-metrics {
            grid-template-columns: 1fr;
          }

          .screen-metrics > div:not(:first-child) {
            display: none;
          }

          .screen-visual {
            height: 145px;
          }

          .screen-bottom {
            grid-template-columns: 1fr;
          }

          .screen-log {
            display: none;
          }

          .screen-footer span:nth-child(2) {
            display: none;
          }

          .manifesto {
            min-height: auto;
            padding: 90px 20px;
          }

          .manifesto-grid {
            display: block;
          }

          .section-number {
            margin-bottom: 25px;
          }

          .manifesto-title h2,
          .system-header h2,
          .control-intro h2 {
            font-size: 50px;
          }

          .manifesto-copy {
            margin-top: 35px;
          }

          .system-section {
            min-height: auto;
            padding: 80px 20px;
          }

          .system-header {
            display: block;
          }

          .system-description {
            margin-top: 30px;
          }

          .orbit-system {
            height: 410px;
            width: 100%;
          }

          .ring-one {
            width: 170px;
            height: 170px;
          }

          .ring-two {
            width: 275px;
            height: 275px;
          }

          .ring-three {
            width: 360px;
            height: 360px;
          }

          .orbit-node {
            width: 105px;
            min-height: 68px;
          }

          .node-title {
            font-size: 8px;
          }

          .system-footer {
            width: 100%;
            flex-wrap: wrap;
            gap: 10px;
          }

          .module-section {
            min-height: auto;
            padding: 80px 20px;
          }

          .module-layout {
            margin-top: 50px;
            margin-bottom: 50px;
          }

          .module-copy h2 {
            font-size: 54px;
          }

          .module-stage {
            min-height: 400px;
          }

          .sales-visual {
            padding: 25px;
            gap: 10px;
          }

          .invoice-stack {
            transform: scale(0.78);
          }

          .visual-side-data {
            transform: scale(0.8);
          }

          .warehouse-visual {
            padding: 30px;
            grid-template-columns: 1fr;
          }

          .warehouse-grid {
            gap: 3px;
          }

          .warehouse-scan {
            height: 180px;
          }

          .warehouse-stats {
            margin-top: 10px;
          }

          .procurement-visual {
            padding: 35px 15px;
          }

          .procurement-chain {
            gap: 2px;
          }

          .procurement-step small,
          .procurement-step strong {
            font-size: 5px;
          }

          .vendor-panel {
            margin-top: 45px;
            grid-template-columns: 1fr;
          }

          .vendor-panel div {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }

          .risk-visual {
            padding: 30px;
            flex-direction: column;
            gap: 30px;
          }

          .radar {
            width: 230px;
            height: 230px;
          }

          .risk-panel {
            width: 100%;
          }

          .module-progress {
            width: 100px;
          }

          .control-strip {
            padding: 80px 20px;
          }

          .stream-row {
            grid-template-columns: 75px 1fr;
            gap: 10px;
            padding: 10px 0;
          }

          .stream-row i {
            display: none;
          }

          .stream-row strong,
          .stream-row em {
            grid-column: 2;
          }

          .final {
            min-height: 650px;
            padding: 90px 20px;
          }

          .final-content h2 {
            font-size: 70px;
          }

          .final-orbit {
            right: -270px;
            opacity: 0.3;
          }

          .footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .footer-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .footer-bottom {
            gap: 20px;
            align-items: flex-start;
            flex-direction: column;
          }
        }

        /* FINAL MOBILE POLISH — desktop layout remains unchanged */
        @media (max-width: 700px) {
          .hero-content,
          .hero-bottom,
          .manifesto-grid,
          .system-header,
          .system-footer,
          .module-section,
          .control-strip-inner,
          .final-content,
          .footer-top,
          .footer-bottom {
            width: 100%;
            max-width: 100%;
          }

          .hero {
            overflow: hidden;
          }

          .hero h1 {
            max-width: 100%;
            word-break: normal;
          }

          .hero-copy {
            margin-left: 0;
          }

          .hero-meta {
            flex-wrap: wrap;
            margin-left: 0;
          }

          .hero-screen {
            max-width: 100%;
            overflow: visible;
          }

          .screen-wrap {
            width: 100%;
          }

          .dashboard-screen {
            width: 100%;
          }

          .screen-top {
            grid-template-columns: 1fr auto;
          }

          .screen-path {
            display: none;
          }

          .screen-live {
            grid-column: 2;
          }

          .screen-heading h3 {
            max-width: 210px;
            font-size: 16px;
          }

          .screen-metrics {
            grid-template-columns: 1fr;
          }

          .screen-metrics > div:not(:first-child) {
            display: none;
          }

          .screen-footer {
            overflow: hidden;
            white-space: nowrap;
          }

          .screen-footer span {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .module-top,
          .module-bottom {
            gap: 12px;
          }

          .module-top span:last-child,
          .module-bottom span:last-child {
            flex-shrink: 0;
          }

          .module-copy {
            min-width: 0;
          }

          .module-copy h2 {
            max-width: 100%;
          }

          .module-stage {
            width: 100%;
            overflow: hidden;
          }

          .sales-visual,
          .warehouse-visual,
          .procurement-visual,
          .risk-visual {
            width: 100%;
            max-width: 100%;
          }

          .invoice-stack {
            max-width: 100%;
          }

          .invoice-card {
            max-width: 100%;
          }

          .warehouse-stats {
            width: 100%;
          }

          .control-stream,
          .stream-row {
            width: 100%;
            min-width: 0;
          }

          .stream-row strong,
          .stream-row em {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .final-content {
            position: relative;
            z-index: 3;
          }

          .final-content h2 {
            max-width: 100%;
            word-break: normal;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
