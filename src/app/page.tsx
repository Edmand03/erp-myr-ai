"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const modules = [
  {
    id: "01",
    name: "Sales",
    short: "SALES / 01",
    title: "Every sale leaves a signal.",
    desc: "Create invoices, follow what has been paid, and see which customers are buying more or less.",
    metric: "128",
    metricLabel: "INVOICES TRACKED",
    bars: [32, 54, 42, 70, 49, 82, 63, 91, 71, 100, 78, 89],
  },
  {
    id: "02",
    name: "Inventory",
    short: "STOCK / 02",
    title: "Know what moves. Before it runs out.",
    desc: "Spot fast-moving products, low stock, and items sitting on shelves for too long.",
    metric: "26",
    metricLabel: "ITEMS TO CHECK",
    bars: [78, 62, 89, 55, 47, 73, 35, 60, 41, 80, 51, 67],
  },
  {
    id: "03",
    name: "Purchasing",
    short: "SUPPLY / 03",
    title: "Keep supply in step with demand.",
    desc: "Follow supplier orders and incoming stock without chasing updates across spreadsheets.",
    metric: "14",
    metricLabel: "OPEN ORDERS",
    bars: [27, 43, 36, 59, 46, 67, 52, 78, 64, 71, 83, 92],
  },
  {
    id: "04",
    name: "Receivables",
    short: "CASHFLOW / 04",
    title: "See the money that has not arrived.",
    desc: "Know who owes you, which invoices are late, and what deserves a follow-up first.",
    metric: "08",
    metricLabel: "FOLLOW-UPS DUE",
    bars: [88, 70, 76, 60, 69, 51, 58, 42, 47, 34, 41, 25],
  },
];

function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function SignalLine({ values }: { values: number[] }) {
  return (
    <div className="signal-line" aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} style={{ height: `${v}%`, animationDelay: `${i * 45}ms` }} />
      ))}
    </div>
  );
}

function useInView() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-enter]");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("entered"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("entered");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
}

function PulseGraphic() {
  return (
    <div
      className="pulse-graphic"
      aria-label="Illustration of connected business signals"
    >
      <div className="pulse-ring ring-a" />
      <div className="pulse-ring ring-b" />
      <div className="pulse-ring ring-c" />
      <svg
        className="pulse-wires"
        viewBox="0 0 520 410"
        fill="none"
        aria-hidden="true"
      >
        <path d="M40 280 L135 280 L182 210 L260 210 L312 118 L400 118 L465 64" />
        <path d="M82 85 L145 85 L196 142 L262 142 L325 260 L410 260 L472 320" />
        <path d="M55 360 L126 360 L178 314 L260 314 L310 350 L382 350 L430 300" />
        <circle cx="182" cy="210" r="5" />
        <circle cx="312" cy="118" r="5" />
        <circle cx="196" cy="142" r="5" />
        <circle cx="325" cy="260" r="5" />
        <circle cx="310" cy="350" r="5" />
      </svg>
      <div className="pulse-core">
        <Mark />
        <span>
          BUSINESS
          <br />
          PULSE
        </span>
        <b>LIVE</b>
      </div>
      <div className="node node-sales">
        <span className="node-dot" />
        <small>SALES</small>
        <strong>+12.4%</strong>
        <em>↑ trending</em>
      </div>
      <div className="node node-stock">
        <span className="node-dot orange" />
        <small>STOCK</small>
        <strong>26 items</strong>
        <em>need a look</em>
      </div>
      <div className="node node-cash">
        <span className="node-dot" />
        <small>RECEIVABLES</small>
        <strong>08 due</strong>
        <em>follow-up</em>
      </div>
      <div className="graphic-coordinate">LC / SYSTEM MAP 001</div>
    </div>
  );
}

function AttentionStrip() {
  return (
    <div className="attention-strip">
      <div className="strip-label">
        <span className="tiny-live" /> TODAY'S SIGNALS
      </div>
      <div className="strip-item">
        <b>03</b>
        <span>customers overdue</span>
        <i>↗</i>
      </div>
      <div className="strip-item">
        <b>04</b>
        <span>products running low</span>
        <i>↗</i>
      </div>
      <div className="strip-item">
        <b>02</b>
        <span>margins have shifted</span>
        <i>↗</i>
      </div>
    </div>
  );
}

export default function Home() {
  useInView();
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiScenario, setAiScenario] = useState(0);
  const selected = modules[active];
  const aiScenarios = [
    {
      id: "01",
      label: "MARGINS",
      question: "Why are my margins changing?",
      title: "A margin shift is worth checking.",
      detail:
        "Compare recent selling prices with supplier costs to find which products are contributing to the change.",
      signal: "PRICE ↔ COST",
      action: "Review affected products",
      tone: "orange",
    },
    {
      id: "02",
      label: "INVENTORY",
      question: "What might run out next?",
      title: "A few products may need attention.",
      detail:
        "Review recent sales velocity alongside current stock before preparing your next purchase order.",
      signal: "DEMAND ↔ STOCK",
      action: "Review stock levels",
      tone: "lime",
    },
    {
      id: "03",
      label: "CASH FLOW",
      question: "Who should I follow up with?",
      title: "Start with overdue invoices.",
      detail:
        "Group outstanding invoices by due date and amount, then prepare a focused follow-up list.",
      signal: "INVOICES ↔ DUE DATES",
      action: "Review overdue accounts",
      tone: "orange",
    },
  ];
  const currentAI = aiScenarios[aiScenario];

  return (
    <main className="site-shell">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap");
        :root {
          --paper: #f0efe9;
          --ink: #171916;
          --muted: #777970;
          --line: #d3d4cb;
          --acid: #c6f36a;
          --orange: #ff653d;
          --mono: "DM Mono", monospace;
          --sans: "Manrope", sans-serif;
        }
        * {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 90px;
        }
        body {
          margin: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        button {
          font: inherit;
        }
        .site-shell {
          overflow: hidden;
          background: var(--paper);
        }
        .topbar {
          height: 76px;
          padding: 0 5vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
          position: relative;
          z-index: 10;
          background: var(--paper);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }
        .brand small {
          font: 10px var(--mono);
          letter-spacing: 0;
          color: var(--muted);
          margin-left: 4px;
        }
        .mark {
          display: inline-flex;
          align-items: flex-end;
          gap: 3px;
          width: 24px;
          height: 23px;
          padding: 3px 0;
        }
        .mark i {
          display: block;
          width: 5px;
          background: var(--ink);
          border-radius: 1px;
          transform-origin: bottom;
          animation: markbeat 2.6s ease-in-out infinite;
        }
        .mark i:nth-child(1) {
          height: 55%;
          animation-delay: -0.5s;
        }
        .mark i:nth-child(2) {
          height: 100%;
          animation-delay: -1.2s;
        }
        .mark i:nth-child(3) {
          height: 72%;
          animation-delay: -0.8s;
        }
        @keyframes markbeat {
          0%,
          100% {
            transform: scaleY(0.65);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 30px;
          font-size: 12px;
          font-weight: 700;
        }
        .nav a:not(.nav-cta) {
          color: #5e6158;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: var(--ink);
        }
        .nav-cta {
          background: var(--ink);
          color: white;
          padding: 13px 17px;
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .nav-cta span {
          color: var(--acid);
          font-size: 17px;
        }
        .menu-toggle {
          display: none;
          border: 1px solid var(--line);
          background: transparent;
          width: 42px;
          height: 42px;
          font-size: 20px;
        }
        .hero {
          padding: clamp(48px, 7vw, 106px) 5vw 0;
          position: relative;
        }
        .hero-topline {
          display: flex;
          align-items: center;
          gap: 12px;
          font: 10px var(--mono);
          letter-spacing: 1.4px;
          color: #5e6158;
          text-transform: uppercase;
        }
        .hero-topline:before {
          content: "";
          width: 27px;
          height: 1px;
          background: var(--orange);
        }
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
          gap: 2vw;
          align-items: center;
          margin-top: 20px;
        }
        .hero h1 {
          font-size: clamp(62px, 8.7vw, 142px);
          line-height: 0.88;
          letter-spacing: -0.105em;
          font-weight: 600;
          margin: 0;
          max-width: 850px;
        }
        .hero h1 .outline {
          color: transparent;
          -webkit-text-stroke: 1.4px var(--ink);
          font-weight: 500;
        }
        .hero-copy {
          max-width: 450px;
          font-size: 15px;
          line-height: 1.8;
          color: #62655d;
          margin: 30px 0 27px;
        }
        .hero-actions {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        .primary-link {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 35px;
          background: var(--acid);
          padding: 16px 18px;
          font-size: 12px;
          font-weight: 800;
          min-width: 190px;
          border: 1px solid var(--ink);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }
        .primary-link:hover {
          transform: translate(-3px, -3px);
          box-shadow: 4px 4px 0 var(--ink);
        }
        .primary-link span {
          font-size: 18px;
        }
        .text-link {
          font-size: 12px;
          font-weight: 700;
          border-bottom: 1px solid #a4a69b;
          padding-bottom: 5px;
        }
        .hero-note {
          margin-top: 31px;
          display: flex;
          align-items: center;
          gap: 9px;
          font: 10px var(--mono);
          color: var(--muted);
        }
        .hero-note i {
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
          animation: blink 1.7s infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0.25;
          }
        }
        .pulse-graphic {
          height: 500px;
          position: relative;
          isolation: isolate;
          margin-right: -3vw;
          overflow: hidden;
          background-image:
            linear-gradient(rgba(23, 25, 22, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23, 25, 22, 0.055) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 10%,
            #000 92%,
            transparent
          );
        }
        .pulse-graphic:before {
          content: "";
          position: absolute;
          width: 310px;
          height: 310px;
          border-radius: 50%;
          background: var(--acid);
          opacity: 0.22;
          filter: blur(40px);
          left: 34%;
          top: 22%;
          z-index: -1;
          animation: glow 6s ease-in-out infinite alternate;
        }
        @keyframes glow {
          to {
            transform: translate(30px, -18px) scale(1.15);
            opacity: 0.38;
          }
        }
        .pulse-ring {
          position: absolute;
          border: 1px solid rgba(23, 25, 22, 0.16);
          border-radius: 50%;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          aspect-ratio: 1;
        }
        .ring-a {
          width: 190px;
          animation: spin 24s linear infinite;
        }
        .ring-b {
          width: 300px;
          border-style: dashed;
          animation: spin 34s linear infinite reverse;
        }
        .ring-c {
          width: 410px;
          border-color: rgba(23, 25, 22, 0.09);
        }
        @keyframes spin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .pulse-wires {
          position: absolute;
          width: 100%;
          height: 100%;
          inset: 0;
          overflow: visible;
        }
        .pulse-wires path {
          stroke: #a7aaa0;
          stroke-width: 1;
          stroke-dasharray: 5 7;
          animation: wireflow 16s linear infinite;
        }
        .pulse-wires circle {
          fill: var(--orange);
          stroke: var(--paper);
          stroke-width: 3;
          animation: blink 2s infinite;
        }
        @keyframes wireflow {
          to {
            stroke-dashoffset: -120;
          }
        }
        .pulse-core {
          position: absolute;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          width: 126px;
          height: 126px;
          border-radius: 50%;
          background: var(--ink);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 10px rgba(23, 25, 22, 0.04),
            0 0 0 22px rgba(23, 25, 22, 0.025);
          animation: corefloat 5s ease-in-out infinite;
        }
        .pulse-core .mark {
          filter: invert(1);
          transform: scale(0.75);
          height: 17px;
        }
        .pulse-core .mark i {
          background: var(--acid);
        }
        .pulse-core span:not(.mark) {
          font: 9px/1.35 var(--mono);
          letter-spacing: 1px;
          text-align: center;
        }
        .pulse-core b {
          font: 7px var(--mono);
          color: var(--acid);
          letter-spacing: 1px;
          margin-top: 6px;
        }
        @keyframes corefloat {
          50% {
            translate: 0 -7px;
          }
        }
        .node {
          position: absolute;
          background: var(--paper);
          border: 1px solid #c8c9c0;
          padding: 13px 15px;
          min-width: 132px;
          box-shadow: 5px 5px 0 rgba(23, 25, 22, 0.06);
          animation: nodefloat 5s ease-in-out infinite;
        }
        .node small {
          display: block;
          font: 9px var(--mono);
          color: var(--muted);
          letter-spacing: 0.7px;
          margin: 0 0 8px;
        }
        .node strong {
          display: block;
          font-size: 18px;
          letter-spacing: -1px;
        }
        .node em {
          display: block;
          font: 9px var(--mono);
          color: #73766d;
          font-style: normal;
          margin-top: 4px;
        }
        .node-dot {
          position: absolute;
          right: 13px;
          top: 15px;
          width: 6px;
          height: 6px;
          background: #8ebc36;
          border-radius: 50%;
          box-shadow: 0 0 0 3px #8ebc3625;
        }
        .node-dot.orange {
          background: var(--orange);
          box-shadow: 0 0 0 3px #ff653d25;
        }
        .node-sales {
          top: 12%;
          left: 8%;
          animation-delay: -1.3s;
        }
        .node-stock {
          top: 27%;
          right: 3%;
          animation-delay: -2.6s;
        }
        .node-cash {
          bottom: 13%;
          left: 18%;
          animation-delay: -0.5s;
        }
        .graphic-coordinate {
          position: absolute;
          right: 5%;
          bottom: 5%;
          font: 9px var(--mono);
          letter-spacing: 1px;
          color: #898c82;
        }
        @keyframes nodefloat {
          50% {
            translate: 0 -7px;
          }
        }
        .ticker {
          margin-top: 40px;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          display: flex;
          align-items: center;
          gap: 0;
          min-height: 66px;
          overflow: hidden;
        }
        .ticker-label {
          flex: none;
          background: var(--ink);
          color: var(--acid);
          height: 66px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          font: 10px var(--mono);
          letter-spacing: 1px;
        }
        .ticker-track {
          display: flex;
          align-items: center;
          gap: 34px;
          white-space: nowrap;
          min-width: max-content;
          animation: ticker 30s linear infinite;
          padding-left: 30px;
          font: 10px var(--mono);
          letter-spacing: 0.7px;
          color: #64675e;
        }
        .ticker-track b {
          font-weight: 400;
          color: var(--ink);
        }
        .ticker-track i {
          color: var(--orange);
          font-style: normal;
        }
        @keyframes ticker {
          to {
            transform: translateX(-35%);
          }
        }
        .section {
          padding: clamp(75px, 10vw, 145px) 5vw;
        }
        .section-kicker {
          font: 10px var(--mono);
          letter-spacing: 1.3px;
          color: #74776e;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
        }
        .section-kicker b {
          color: var(--orange);
          font-weight: 400;
        }
        .problem {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 9vw;
        }
        .problem h2,
        .modules-heading h2,
        .closing h2 {
          font-size: clamp(44px, 6vw, 90px);
          line-height: 0.97;
          letter-spacing: -0.085em;
          font-weight: 600;
          margin: 25px 0 0;
        }
        .problem h2 em,
        .modules-heading h2 em,
        .closing h2 em {
          font-style: normal;
          color: #92958b;
        }
        .problem-content {
          padding-top: 35px;
        }
        .problem-intro {
          font-size: 19px;
          line-height: 1.65;
          max-width: 540px;
          margin: 0 0 38px;
          letter-spacing: -0.5px;
        }
        .problem-list {
          border-top: 1px solid var(--line);
        }
        .problem-row {
          display: grid;
          grid-template-columns: 35px 1fr 25px;
          gap: 15px;
          padding: 19px 0;
          border-bottom: 1px solid var(--line);
          align-items: start;
        }
        .problem-row small {
          font: 10px var(--mono);
          color: var(--orange);
          padding-top: 3px;
        }
        .problem-row b {
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
        }
        .problem-row span {
          font-size: 12px;
          line-height: 1.6;
          color: var(--muted);
        }
        .problem-row i {
          font-style: normal;
          font-size: 18px;
        }
        .signal-section {
          background: var(--ink);
          color: var(--paper);
          padding: 0 5vw;
        }
        .signal-top {
          padding: 85px 0 42px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 30px;
        }
        .signal-top h2 {
          font-size: clamp(43px, 6vw, 86px);
          line-height: 0.95;
          letter-spacing: -0.08em;
          font-weight: 500;
          margin: 20px 0 0;
          max-width: 700px;
        }
        .signal-top h2 span {
          color: var(--acid);
        }
        .signal-top p {
          max-width: 270px;
          color: #a5a89e;
          font-size: 12px;
          line-height: 1.8;
          margin: 0 0 5px;
        }
        .attention-strip {
          display: grid;
          grid-template-columns: 1.15fr repeat(3, 1fr);
          border-top: 1px solid #454840;
          border-bottom: 1px solid #454840;
        }
        .strip-label,
        .strip-item {
          padding: 22px 18px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-right: 1px solid #454840;
        }
        .strip-label {
          font: 9px var(--mono);
          letter-spacing: 1px;
          color: #c5c8bd;
          padding-left: 0;
        }
        .tiny-live {
          width: 6px;
          height: 6px;
          background: var(--acid);
          border-radius: 50%;
          box-shadow: 0 0 0 4px #c6f36a20;
        }
        .strip-item b {
          font: 19px var(--mono);
          color: var(--acid);
          font-weight: 400;
        }
        .strip-item span {
          font-size: 10px;
          line-height: 1.4;
          color: #c3c6bb;
        }
        .strip-item i {
          font-style: normal;
          color: var(--orange);
          margin-left: auto;
        }
        .signal-foot {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 0 25px;
          font: 9px var(--mono);
          color: #898d82;
          letter-spacing: 0.6px;
        }
        .ai-section {
          background: #dfe0d6;
          border-top: 1px solid #c7c9be;
          border-bottom: 1px solid #c7c9be;
          padding: clamp(72px, 9vw, 124px) 5vw;
        }
        .ai-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 8vw;
          align-items: center;
        }
        .ai-intro h2 {
          font-size: clamp(48px, 6.4vw, 90px);
          line-height: 0.91;
          letter-spacing: -0.09em;
          font-weight: 600;
          margin: 24px 0;
        }
        .ai-intro h2 em {
          font-style: normal;
          color: #777b70;
        }
        .ai-intro > p {
          max-width: 390px;
          color: #65695f;
          font-size: 13px;
          line-height: 1.85;
        }
        .ai-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #b7baae;
          padding: 9px 11px;
          margin-top: 18px;
          font: 9px var(--mono);
          letter-spacing: 0.7px;
        }
        .ai-status i {
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
        }
        .ai-console {
          background: #171916;
          color: #f0efe9;
          position: relative;
          min-width: 0;
          box-shadow: 9px 9px 0 rgba(23, 25, 22, 0.09);
        }
        .ai-console-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid #41443c;
          font: 9px var(--mono);
          letter-spacing: 0.8px;
        }
        .ai-console-head span:last-child {
          color: var(--acid);
        }
        .ai-console-body {
          padding: 22px 22px 20px;
        }
        .ai-console-label {
          font: 9px var(--mono);
          color: #999d91;
          letter-spacing: 1px;
          margin-bottom: 13px;
        }
        .ai-question-list {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .ai-question {
          background: transparent;
          border: 1px solid #44473f;
          color: #c8cbc0;
          padding: 10px 11px;
          text-align: left;
          font-size: 10px;
          line-height: 1.35;
          cursor: pointer;
          transition:
            background 0.2s,
            color 0.2s,
            border-color 0.2s;
        }
        .ai-question:hover,
        .ai-question.active {
          background: var(--acid);
          border-color: var(--acid);
          color: var(--ink);
        }
        .ai-answer {
          border-left: 2px solid var(--acid);
          padding: 2px 0 3px 17px;
          animation: appear 0.3s ease;
        }
        .ai-answer-top {
          display: flex;
          align-items: center;
          gap: 8px;
          font: 9px var(--mono);
          color: var(--acid);
          letter-spacing: 0.8px;
          margin-bottom: 13px;
        }
        .ai-answer h3 {
          font-size: clamp(19px, 2.2vw, 27px);
          line-height: 1.15;
          letter-spacing: -0.8px;
          font-weight: 500;
          margin: 0 0 10px;
          max-width: 410px;
        }
        .ai-answer p {
          font-size: 11px;
          line-height: 1.8;
          color: #aeb1a7;
          max-width: 420px;
          margin: 0;
        }
        .ai-answer-foot {
          margin: 20px 0 0 19px;
          padding-top: 15px;
          border-top: 1px solid #41443c;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font: 8px var(--mono);
          letter-spacing: 0.5px;
          color: #92968a;
        }
        .ai-answer-foot strong {
          color: var(--acid);
          font-weight: 400;
        }
        .ai-disclaimer {
          font-size: 9px;
          line-height: 1.6;
          color: #85897e;
          padding: 0 22px 17px;
        }
        .ai-bottomline {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 26px;
          font: 9px var(--mono);
          letter-spacing: 0.6px;
          color: #6f7369;
        }
        .ai-bottomline span:first-child {
          color: var(--orange);
        }
        .modules-section {
          padding-bottom: 100px;
        }
        .modules-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 46px;
        }
        .modules-heading h2 {
          max-width: 690px;
        }
        .modules-heading p {
          max-width: 260px;
          font-size: 12px;
          line-height: 1.8;
          color: var(--muted);
          margin: 0 0 5px;
        }
        .module-explorer {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          min-height: 400px;
        }
        .module-tabs {
          border-right: 1px solid var(--line);
          padding: 13px 20px 13px 0;
          display: flex;
          flex-direction: column;
        }
        .module-tab {
          display: grid;
          grid-template-columns: 28px 1fr 20px;
          gap: 10px;
          align-items: center;
          text-align: left;
          background: none;
          border: 0;
          border-bottom: 1px solid var(--line);
          padding: 21px 10px 21px 0;
          color: #777970;
          cursor: pointer;
          transition: color 0.2s;
        }
        .module-tab:last-child {
          border-bottom: 0;
        }
        .module-tab .num {
          font: 10px var(--mono);
        }
        .module-tab strong {
          font-size: 13px;
        }
        .module-tab .arrow {
          font-size: 17px;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s;
        }
        .module-tab.active {
          color: var(--ink);
        }
        .module-tab.active .num {
          color: var(--orange);
        }
        .module-tab.active .arrow {
          opacity: 1;
          transform: none;
          color: var(--orange);
        }
        .module-detail {
          padding: 35px 0 35px 5vw;
          display: grid;
          grid-template-columns: 1fr 0.85fr;
          gap: 5vw;
          align-items: center;
          animation: appear 0.4s ease;
        }
        .module-index {
          font: 10px var(--mono);
          color: var(--orange);
          letter-spacing: 1px;
        }
        .module-detail h3 {
          font-size: clamp(30px, 3.7vw, 54px);
          line-height: 1;
          letter-spacing: -0.07em;
          font-weight: 600;
          margin: 22px 0 16px;
          max-width: 450px;
        }
        .module-detail p {
          font-size: 12px;
          line-height: 1.9;
          color: var(--muted);
          max-width: 420px;
        }
        .module-mini {
          border: 1px solid var(--line);
          padding: 20px;
          min-height: 225px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .mini-head {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font: 9px var(--mono);
          letter-spacing: 0.7px;
          color: var(--muted);
        }
        .mini-live {
          color: #729a2b;
        }
        .mini-number {
          font-size: 58px;
          letter-spacing: -5px;
          line-height: 1;
          margin-top: 23px;
        }
        .mini-label {
          font: 9px var(--mono);
          color: var(--muted);
          letter-spacing: 1px;
          margin-top: 7px;
        }
        .signal-line {
          height: 56px;
          display: flex;
          align-items: end;
          gap: 5px;
          border-bottom: 1px solid var(--line);
          padding-top: 5px;
        }
        .signal-line i {
          display: block;
          flex: 1;
          background: var(--ink);
          transform-origin: bottom;
          animation: bar-rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .signal-line i:nth-child(3n) {
          background: var(--orange);
        }
        @keyframes bar-rise {
          from {
            transform: scaleY(0.05);
          }
          to {
            transform: scaleY(1);
          }
        }
        @keyframes appear {
          from {
            opacity: 0;
            translate: 0 8px;
          }
          to {
            opacity: 1;
            translate: 0 0;
          }
        }
        .workflow {
          background: #e5e5dc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .workflow-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 10vw;
        }
        .workflow-title h2 {
          font-size: clamp(43px, 6vw, 82px);
          line-height: 0.95;
          letter-spacing: -0.08em;
          font-weight: 600;
          margin: 24px 0;
        }
        .workflow-title p {
          font-size: 12px;
          line-height: 1.9;
          color: var(--muted);
          max-width: 300px;
        }
        .steps {
          border-top: 1px solid #c4c6bb;
        }
        .step {
          display: grid;
          grid-template-columns: 42px 1fr 25px;
          gap: 15px;
          padding: 24px 0;
          border-bottom: 1px solid #c4c6bb;
          align-items: start;
        }
        .step .step-no {
          font: 10px var(--mono);
          color: var(--orange);
          padding-top: 3px;
        }
        .step h3 {
          font-size: 16px;
          letter-spacing: -0.4px;
          margin: 0 0 7px;
        }
        .step p {
          font-size: 12px;
          line-height: 1.7;
          color: var(--muted);
          margin: 0;
          max-width: 420px;
        }
        .step .step-icon {
          font-size: 18px;
        }
        .audience {
          padding-top: 90px;
          padding-bottom: 90px;
        }
        .audience-top {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 25px;
          margin-bottom: 32px;
        }
        .audience-top h2 {
          font-size: clamp(36px, 5vw, 68px);
          letter-spacing: -0.08em;
          line-height: 0.96;
          font-weight: 600;
          margin: 18px 0 0;
        }
        .audience-top p {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.8;
          max-width: 260px;
        }
        .audience-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--ink);
          border-left: 1px solid var(--ink);
        }
        .audience-item {
          min-height: 160px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          transition: background 0.25s;
        }
        .audience-item:hover {
          background: var(--acid);
        }
        .audience-item small {
          font: 10px var(--mono);
          color: var(--orange);
        }
        .audience-item strong {
          font-size: clamp(17px, 2vw, 25px);
          letter-spacing: -1px;
          font-weight: 600;
        }
        .audience-item span {
          font-size: 11px;
          line-height: 1.6;
          color: #777970;
          max-width: 240px;
        }
        .closing {
          margin: 0 5vw 5vw;
          background: var(--acid);
          padding: clamp(36px, 6vw, 82px);
          position: relative;
          overflow: hidden;
        }
        .closing:after {
          content: "LC";
          position: absolute;
          right: -20px;
          bottom: -110px;
          font-size: clamp(180px, 28vw, 410px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.13em;
          color: rgba(23, 25, 22, 0.055);
          pointer-events: none;
        }
        .closing-inner {
          position: relative;
          z-index: 1;
          max-width: 800px;
        }
        .closing .section-kicker {
          color: #5b6748;
        }
        .closing h2 {
          font-size: clamp(52px, 8vw, 112px);
          max-width: 760px;
          margin: 23px 0 26px;
        }
        .closing p {
          font-size: 13px;
          line-height: 1.8;
          color: #4c5640;
          max-width: 440px;
          margin-bottom: 28px;
        }
        .closing .primary-link {
          background: var(--ink);
          color: white;
          border-color: var(--ink);
        }
        .closing .primary-link span {
          color: var(--acid);
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 5vw 30px;
          font: 9px var(--mono);
          color: var(--muted);
          letter-spacing: 0.5px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--ink);
          font: 700 13px var(--sans);
          letter-spacing: -0.5px;
        }
        [data-enter] {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 0.7s ease,
            transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        [data-enter].entered {
          opacity: 1;
          transform: translateY(0);
        }
        @media (min-width: 1500px) {
          .hero,
          .section,
          .signal-section {
            padding-left: max(5vw, calc((100vw - 1450px) / 2));
            padding-right: max(5vw, calc((100vw - 1450px) / 2));
          }
          .topbar {
            padding-left: max(5vw, calc((100vw - 1450px) / 2));
            padding-right: max(5vw, calc((100vw - 1450px) / 2));
          }
          .closing {
            margin-left: max(5vw, calc((100vw - 1450px) / 2));
            margin-right: max(5vw, calc((100vw - 1450px) / 2));
          }
        }
        @media (max-width: 950px) {
          .ai-layout {
            grid-template-columns: 1fr 1fr;
            gap: 4vw;
          }
          .ai-intro h2 {
            font-size: clamp(46px, 6vw, 66px);
          }
          .ai-console-body {
            padding: 18px;
          }
          .hero-grid {
            grid-template-columns: 1fr 0.9fr;
            gap: 0;
          }
          .hero h1 {
            font-size: clamp(60px, 9vw, 92px);
          }
          .pulse-graphic {
            height: 420px;
            margin-right: -5vw;
          }
          .node {
            min-width: 115px;
            padding: 11px;
          }
          .node strong {
            font-size: 15px;
          }
          .ring-c {
            width: 340px;
          }
          .ring-b {
            width: 255px;
          }
          .ring-a {
            width: 165px;
          }
          .module-explorer {
            grid-template-columns: 190px 1fr;
          }
          .module-detail {
            padding-left: 28px;
            gap: 25px;
          }
          .module-mini {
            padding: 15px;
          }
          .strip-label,
          .strip-item {
            padding: 16px 10px;
          }
          .strip-item {
            gap: 7px;
          }
          .strip-item b {
            font-size: 16px;
          }
        }
        @media (max-width: 680px) {
          .ai-section {
            padding: 70px 20px;
          }
          .ai-layout {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 32px;
          }
          .ai-intro h2 {
            font-size: clamp(48px, 13vw, 68px);
            margin: 20px 0;
          }
          .ai-intro > p {
            font-size: 12px;
          }
          .ai-status {
            margin-top: 12px;
          }
          .ai-console {
            box-shadow: 5px 5px 0 rgba(23, 25, 22, 0.09);
          }
          .ai-console-head {
            padding: 14px;
            font-size: 8px;
          }
          .ai-console-body {
            padding: 17px 14px;
          }
          .ai-question-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 6px;
            margin-bottom: 22px;
          }
          .ai-question {
            padding: 12px;
            text-align: left;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .ai-question:after {
            content: "↗";
            font-size: 14px;
          }
          .ai-answer {
            padding-left: 12px;
          }
          .ai-answer h3 {
            font-size: 22px;
          }
          .ai-answer p {
            font-size: 11px;
          }
          .ai-answer-foot {
            margin-left: 14px;
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
          .ai-disclaimer {
            padding: 0 14px 15px;
          }
          .ai-bottomline {
            font-size: 8px;
            line-height: 1.5;
            flex-direction: column;
            gap: 7px;
            margin-top: 20px;
          }
          html {
            scroll-padding-top: 64px;
          }
          .topbar {
            height: 64px;
            padding: 0 20px;
          }
          .brand {
            font-size: 15px;
          }
          .brand small {
            display: none;
          }
          .menu-toggle {
            display: block;
          }
          .nav {
            display: none;
            position: absolute;
            top: 63px;
            left: 0;
            right: 0;
            background: var(--paper);
            padding: 18px 20px 22px;
            border-bottom: 1px solid var(--ink);
            align-items: stretch;
            gap: 0;
            flex-direction: column;
          }
          .nav.open {
            display: flex;
          }
          .nav a:not(.nav-cta) {
            padding: 14px 0;
            border-bottom: 1px solid var(--line);
          }
          .nav-cta {
            margin-top: 14px;
            justify-content: space-between;
          }
          .hero {
            padding: 42px 20px 0;
          }
          .hero-topline {
            font-size: 9px;
            letter-spacing: 0.9px;
          }
          .hero-grid {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            margin-top: 22px;
            gap: 0;
          }
          .hero-copy-wrap {
            position: relative;
            z-index: 2;
          }
          .hero h1 {
            font-size: clamp(60px, 17vw, 94px);
            line-height: 0.87;
            letter-spacing: -0.105em;
            max-width: 560px;
          }
          .hero-copy {
            font-size: 13px;
            line-height: 1.8;
            margin: 21px 0 20px;
            max-width: 360px;
          }
          .hero-actions {
            gap: 17px;
          }
          .primary-link {
            padding: 15px 15px;
            min-width: 176px;
            gap: 23px;
          }
          .text-link {
            font-size: 11px;
          }
          .hero-note {
            margin-top: 22px;
            font-size: 9px;
          }
          .pulse-graphic {
            height: 335px;
            margin: 12px -20px 0;
            mask-image: linear-gradient(
              90deg,
              transparent,
              #000 4%,
              #000 96%,
              transparent
            );
            background-size: 23px 23px;
          }
          .pulse-graphic:before {
            width: 230px;
            height: 230px;
            left: 24%;
            top: 20%;
          }
          .pulse-core {
            width: 98px;
            height: 98px;
            top: 49%;
          }
          .pulse-core span:not(.mark) {
            font-size: 8px;
          }
          .pulse-ring {
            top: 49%;
          }
          .ring-a {
            width: 145px;
          }
          .ring-b {
            width: 225px;
          }
          .ring-c {
            width: 300px;
          }
          .node {
            min-width: 102px;
            padding: 9px 10px;
            box-shadow: 3px 3px 0 rgba(23, 25, 22, 0.06);
          }
          .node small {
            font-size: 8px;
            margin-bottom: 6px;
          }
          .node strong {
            font-size: 14px;
          }
          .node em {
            font-size: 8px;
          }
          .node-dot {
            top: 11px;
            right: 10px;
            width: 5px;
            height: 5px;
          }
          .node-sales {
            top: 7%;
            left: 6%;
          }
          .node-stock {
            top: 25%;
            right: 2%;
          }
          .node-cash {
            bottom: 9%;
            left: 9%;
          }
          .graphic-coordinate {
            font-size: 7px;
            right: 5%;
            bottom: 4%;
          }
          .ticker {
            margin-top: 24px;
            min-height: 52px;
          }
          .ticker-label {
            height: 52px;
            padding: 0 13px;
            font-size: 8px;
          }
          .ticker-track {
            font-size: 9px;
            gap: 24px;
            padding-left: 20px;
          }
          .section {
            padding: 72px 20px;
          }
          .problem {
            display: block;
          }
          .problem h2,
          .modules-heading h2,
          .closing h2 {
            font-size: clamp(48px, 13vw, 70px);
            line-height: 0.94;
            margin-top: 20px;
          }
          .problem-content {
            padding-top: 25px;
          }
          .problem-intro {
            font-size: 17px;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .problem-row {
            grid-template-columns: 26px 1fr 18px;
            gap: 10px;
            padding: 16px 0;
          }
          .problem-row b {
            font-size: 12px;
          }
          .problem-row span {
            font-size: 11px;
          }
          .signal-section {
            padding: 0 20px;
          }
          .signal-top {
            padding: 66px 0 29px;
            display: block;
          }
          .signal-top h2 {
            font-size: clamp(45px, 12vw, 66px);
            margin-top: 19px;
            line-height: 0.97;
          }
          .signal-top p {
            font-size: 11px;
            margin-top: 18px;
            max-width: 320px;
          }
          .attention-strip {
            grid-template-columns: 1fr;
            border-bottom: 0;
          }
          .strip-label {
            border-right: 0;
            border-bottom: 1px solid #454840;
            padding: 16px 0;
          }
          .strip-item {
            border-right: 0;
            border-bottom: 1px solid #454840;
            padding: 16px 0;
            gap: 12px;
          }
          .strip-item b {
            font-size: 20px;
            min-width: 30px;
          }
          .strip-item span {
            font-size: 11px;
          }
          .signal-foot {
            font-size: 8px;
            line-height: 1.5;
            padding: 14px 0 22px;
          }
          .modules-section {
            padding-top: 70px;
            padding-bottom: 72px;
          }
          .modules-heading {
            display: block;
            margin-bottom: 28px;
          }
          .modules-heading p {
            margin-top: 17px;
            max-width: 330px;
          }
          .module-explorer {
            display: flex;
            flex-direction: column;
            border-bottom: 0;
          }
          .module-tabs {
            border-right: 0;
            border-bottom: 1px solid var(--ink);
            padding: 0;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
          }
          .module-tab {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
            border-bottom: 0;
            border-right: 1px solid var(--line);
            padding: 14px 6px 13px 0;
            min-width: 0;
          }
          .module-tab:last-child {
            border-right: 0;
          }
          .module-tab .num {
            font-size: 8px;
          }
          .module-tab strong {
            font-size: 10px;
            white-space: nowrap;
          }
          .module-tab .arrow {
            display: none;
          }
          .module-tab.active {
            box-shadow: inset 0 -3px var(--orange);
          }
          .module-detail {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 23px;
            padding: 25px 0 26px;
            animation: appear 0.35s ease;
          }
          .module-index {
            font-size: 9px;
          }
          .module-detail h3 {
            font-size: clamp(35px, 9vw, 48px);
            margin: 16px 0 12px;
            max-width: 420px;
          }
          .module-detail p {
            font-size: 12px;
            margin-bottom: 0;
          }
          .module-mini {
            min-height: 190px;
            padding: 16px;
          }
          .mini-head {
            font-size: 8px;
          }
          .mini-number {
            font-size: 53px;
            margin-top: 15px;
          }
          .mini-label {
            font-size: 8px;
          }
          .signal-line {
            height: 48px;
          }
          .workflow {
            padding: 0;
          }
          .workflow-grid {
            display: block;
          }
          .workflow-title h2 {
            font-size: clamp(48px, 12vw, 68px);
            margin: 20px 0;
          }
          .workflow-title p {
            font-size: 12px;
            margin-bottom: 32px;
          }
          .step {
            grid-template-columns: 28px 1fr 20px;
            gap: 10px;
            padding: 20px 0;
          }
          .step h3 {
            font-size: 14px;
          }
          .step p {
            font-size: 11px;
          }
          .audience {
            padding-top: 70px;
            padding-bottom: 70px;
          }
          .audience-top {
            display: block;
            margin-bottom: 24px;
          }
          .audience-top h2 {
            font-size: clamp(40px, 10vw, 58px);
            margin-top: 18px;
          }
          .audience-top p {
            font-size: 11px;
            margin-top: 15px;
          }
          .audience-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .audience-item {
            min-height: 135px;
            padding: 14px;
          }
          .audience-item strong {
            font-size: 17px;
            letter-spacing: -0.7px;
          }
          .audience-item span {
            font-size: 10px;
          }
          .audience-item small {
            font-size: 9px;
          }
          .closing {
            margin: 0 10px 20px;
            padding: 34px 23px;
          }
          .closing h2 {
            font-size: clamp(51px, 13vw, 74px);
            margin: 22px 0;
          }
          .closing p {
            font-size: 12px;
          }
          .closing:after {
            font-size: 220px;
            right: -15px;
            bottom: -55px;
          }
          .footer {
            padding: 0 20px 24px;
            align-items: flex-start;
            flex-wrap: wrap;
            font-size: 8px;
            gap: 12px;
          }
          .footer > span:last-child {
            width: 100%;
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
          [data-enter] {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <header className="topbar">
        <Link href="/" className="brand">
          <Mark /> LedgerCore <small>BUSINESS SYSTEMS</small>
        </Link>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "×" : "☰"}
        </button>
        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <a href="#signals" onClick={() => setMenuOpen(false)}>
            The signals
          </a>
          <a href="#ai" onClick={() => setMenuOpen(false)}>
            AI preview
          </a>
          <a href="#modules" onClick={() => setMenuOpen(false)}>
            What it connects
          </a>
          <a href="#how" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <Link className="nav-cta" href="/#">
            Coming soon <span>↗</span>
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-topline">
          A clearer view of your business <span>—</span> LC / 001
        </div>
        <div className="hero-grid">
          <div className="hero-copy-wrap">
            <h1>
              Less guessing.
              <br />
              <span className="outline">More knowing.</span>
            </h1>
            <p className="hero-copy">
              Sales, stock, suppliers and receivables — connected in one place,
              with AI that helps you notice what needs attention.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="#">
                See your business clearly soon <span>↗</span>
              </Link>
              <a className="text-link" href="#signals">
                See how it works ↓
              </a>
            </div>
            <div className="hero-note">
              <i /> BUILT FOR THE PEOPLE RUNNING THE BUSINESS
            </div>
          </div>
          <PulseGraphic />
        </div>
        <div className="ticker">
          <div className="ticker-label">CONNECTED SIGNALS</div>
          <div className="ticker-track">
            <span>
              <i>↗</i> <b>SALES</b> — what is moving
            </span>
            <span>
              <i>↗</i> <b>INVENTORY</b> — what is running low
            </span>
            <span>
              <i>↗</i> <b>SUPPLIERS</b> — what is on the way
            </span>
            <span>
              <i>↗</i> <b>CASH FLOW</b> — what is overdue
            </span>
            <span>
              <i>↗</i> <b>SALES</b> — what is moving
            </span>
            <span>
              <i>↗</i> <b>INVENTORY</b> — what is running low
            </span>
            <span>
              <i>↗</i> <b>SUPPLIERS</b> — what is on the way
            </span>
            <span>
              <i>↗</i> <b>CASH FLOW</b> — what is overdue
            </span>
          </div>
        </div>
      </section>

      <section className="section problem" data-enter>
        <div>
          <div className="section-kicker">
            <b>01 /</b> THE REAL PROBLEM
          </div>
          <h2>
            Your business
            <br />
            is talking.
            <br />
            <em>Are you hearing it?</em>
          </h2>
        </div>
        <div className="problem-content">
          <p className="problem-intro">
            The warning signs are usually there. They are just scattered across
            invoices, stock sheets, supplier chats and spreadsheets.
          </p>
          <div className="problem-list">
            <div className="problem-row">
              <small>01</small>
              <div>
                <b>You only notice late payments when cash gets tight.</b>
                <span>Overdue invoices hide in the noise.</span>
              </div>
              <i>↗</i>
            </div>
            <div className="problem-row">
              <small>02</small>
              <div>
                <b>You reorder after something runs out.</b>
                <span>Stock problems become customer problems.</span>
              </div>
              <i>↗</i>
            </div>
            <div className="problem-row">
              <small>03</small>
              <div>
                <b>You make decisions from yesterday's numbers.</b>
                <span>The full picture takes too long to piece together.</span>
              </div>
              <i>↗</i>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-section" id="signals">
        <div className="signal-top" data-enter>
          <div>
            <div className="section-kicker">
              <b>02 /</b> FROM DATA TO DIRECTION
            </div>
            <h2>
              Not more dashboards.
              <br />
              <span>Better signals.</span>
            </h2>
          </div>
          <p>
            LedgerCore connects the moving parts and brings the important
            changes forward — so you can act before small issues grow.
          </p>
        </div>
        <AttentionStrip />
        <div className="signal-foot">
          <span>ILLUSTRATIVE BUSINESS ACTIVITY</span>
          <span>ONE VIEW / FEWER BLIND SPOTS</span>
        </div>
      </section>

      <section className="ai-section" id="ai" data-enter>
        <div className="ai-layout">
          <div className="ai-intro">
            <div className="section-kicker">
              <b>03 /</b> THE INTELLIGENCE LAYER
            </div>
            <h2>
              Numbers tell you what happened.
              <br />
              <em>AI helps you ask why.</em>
            </h2>
            <p>
              LedgerCore is being designed to turn connected business activity
              into clearer questions, useful explanations and next steps —
              without taking decisions out of your hands.
            </p>
            <div className="ai-status">
              <i /> AI BUSINESS ANALYST / COMING SOON
            </div>
          </div>
          <div>
            <div
              className="ai-console"
              aria-label="Illustrative preview of the future AI Business Analyst"
            >
              <div className="ai-console-head">
                <span>LC / BUSINESS ANALYST</span>
                <span>CONCEPT PREVIEW ↗</span>
              </div>
              <div className="ai-console-body">
                <div className="ai-console-label">
                  WHAT WOULD YOU LIKE TO UNDERSTAND?
                </div>
                <div
                  className="ai-question-list"
                  role="tablist"
                  aria-label="Example business questions"
                >
                  {aiScenarios.map((scenario, index) => (
                    <button
                      key={scenario.id}
                      type="button"
                      role="tab"
                      aria-selected={aiScenario === index}
                      className={`ai-question ${aiScenario === index ? "active" : ""}`}
                      onClick={() => setAiScenario(index)}
                    >
                      {scenario.question}
                    </button>
                  ))}
                </div>
                <div className="ai-answer" key={currentAI.id} role="tabpanel">
                  <div className="ai-answer-top">
                    <span>✳</span> EXAMPLE INSIGHT / {currentAI.id}
                  </div>
                  <h3>{currentAI.title}</h3>
                  <p>{currentAI.detail}</p>
                </div>
                <div className="ai-answer-foot">
                  <span>RELATED SIGNAL</span>
                  <strong>{currentAI.signal}</strong>
                </div>
              </div>
              <div className="ai-disclaimer">
                Illustrative concept only. These are example responses, not live
                analysis of connected business data.
              </div>
            </div>
            <div className="ai-bottomline">
              <span>01 — ASK A BUSINESS QUESTION</span>
              <span>02 — UNDERSTAND THE SIGNAL</span>
              <span>03 — CHOOSE YOUR NEXT STEP</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section modules-section" id="modules">
        <div className="modules-heading" data-enter>
          <div>
            <div className="section-kicker">
              <b>04 /</b> ONE CONNECTED SYSTEM
            </div>
            <h2>
              Every part has a role.
              <br />
              <em>Everything has a link.</em>
            </h2>
          </div>
          <p>
            Explore the areas of your business that LedgerCore brings together.
          </p>
        </div>
        <div className="module-explorer" data-enter>
          <div
            className="module-tabs"
            role="tablist"
            aria-label="Business modules"
          >
            {modules.map((m, i) => (
              <button
                key={m.id}
                className={`module-tab ${active === i ? "active" : ""}`}
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
              >
                <span className="num">{m.id}</span>
                <strong>{m.name}</strong>
                <span className="arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="module-detail" key={selected.id} role="tabpanel">
            <div>
              <div className="module-index">{selected.short}</div>
              <h3>{selected.title}</h3>
              <p>{selected.desc}</p>
            </div>
            <div className="module-mini">
              <div className="mini-head">
                <span>{selected.name.toUpperCase()} / ACTIVITY</span>
                <span className="mini-live">● CONNECTED</span>
              </div>
              <div>
                <div className="mini-number">{selected.metric}</div>
                <div className="mini-label">{selected.metricLabel}</div>
              </div>
              <SignalLine values={selected.bars} />
            </div>
          </div>
        </div>
      </section>

      <section className="section workflow" id="how">
        <div className="workflow-grid">
          <div className="workflow-title" data-enter>
            <div className="section-kicker">
              <b>05 /</b> HOW IT WORKS
            </div>
            <h2>
              From scattered
              <br />
              to <em>in sync.</em>
            </h2>
            <p>
              A clearer operating rhythm for businesses that manage products,
              suppliers and customer payments.
            </p>
          </div>
          <div className="steps" data-enter>
            <div className="step">
              <span className="step-no">01</span>
              <div>
                <h3>Bring the moving parts together</h3>
                <p>
                  Keep sales, inventory, purchasing and receivables connected
                  instead of separated in different tools.
                </p>
              </div>
              <span className="step-icon">↘</span>
            </div>
            <div className="step">
              <span className="step-no">02</span>
              <div>
                <h3>Let patterns come into view</h3>
                <p>
                  See changes in activity, stock levels and outstanding payments
                  without assembling the picture manually.
                </p>
              </div>
              <span className="step-icon">⌁</span>
            </div>
            <div className="step">
              <span className="step-no">03</span>
              <div>
                <h3>Know what deserves your attention</h3>
                <p>
                  Use AI-supported insights to decide what to review and what to
                  do next. You stay in control.
                </p>
              </div>
              <span className="step-icon">↗</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section audience" data-enter>
        <div className="audience-top">
          <div>
            <div className="section-kicker">
              <b>06 /</b> MADE FOR REAL OPERATIONS
            </div>
            <h2>
              For businesses that
              <br />
              move real things.
            </h2>
          </div>
          <p>
            Especially useful when products, suppliers and payment terms make
            daily operations harder to track.
          </p>
        </div>
        <div className="audience-grid">
          <div className="audience-item">
            <small>01 / DISTRIBUTION</small>
            <strong>Distributors</strong>
            <span>Keep stock, orders and customer accounts in view.</span>
          </div>
          <div className="audience-item">
            <small>02 / WHOLESALE</small>
            <strong>Wholesalers</strong>
            <span>Manage repeat orders and changing stock levels.</span>
          </div>
          <div className="audience-item">
            <small>03 / TRADE</small>
            <strong>Trading companies</strong>
            <span>Connect suppliers, purchases and sales activity.</span>
          </div>
          <div className="audience-item">
            <small>04 / AUTOMOTIVE</small>
            <strong>Auto parts</strong>
            <span>Track many SKUs and spot parts that need replenishing.</span>
          </div>
          <div className="audience-item">
            <small>05 / HARDWARE</small>
            <strong>Hardware suppliers</strong>
            <span>See what's selling and what has been sitting too long.</span>
          </div>
          <div className="audience-item">
            <small>06 / GROWTH</small>
            <strong>Growing SMEs</strong>
            <span>
              Build a clearer view before operations get more complex.
            </span>
          </div>
        </div>
      </section>

      <section className="closing" data-enter>
        <div className="closing-inner">
          <div className="section-kicker">
            <b>YOUR NEXT STEP /</b> A CLEARER PICTURE
          </div>
          <h2>
            Run the business.
            <br />
            Not the spreadsheet.
          </h2>
          <p>
            Spend less time piecing together information and more time making
            the next decision with confidence.
          </p>
          <Link className="primary-link" href="#">
            Coming soon <span>↗</span>
          </Link>
        </div>
      </section>

      <footer className="footer">
        <Link href="/" className="footer-brand">
          <Mark /> LedgerCore
        </Link>
        <span>BUSINESS SYSTEMS / BUILT FOR CLARITY</span>
        <span>© {new Date().getFullYear()} LEDGERCORE</span>
      </footer>
    </main>
  );
}
