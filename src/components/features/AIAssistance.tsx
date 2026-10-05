"use client";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  FileWarning,
  Loader2,
  MessageSquare,
  PackageSearch,
  RefreshCw,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type Business = {
  summary: {
    customers: number;
    products: number;
    totalOutstanding: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueGrowth: number | null;
    currentCollections: number;
    previousCollections: number;
    collectionGrowth: number | null;
    overdueCount: number;
    overdueAmount: number;
    outOfStockCount: number;
    lowStockCount: number;
    openPurchaseOrders: number;
    openPurchaseOrderValue: number;
  };
  receivables: {
    topDebtors: {
      customerId: string;
      customerName: string;
      outstanding: number;
      overdue: number;
      invoiceCount: number;
    }[];
    overdueInvoices: {
      invoiceNumber: string;
      customerName: string;
      outstanding: number;
      dueDate: string;
      daysOverdue: number;
    }[];
  };
  inventory: {
    outOfStock: {
      id: string;
      sku: string;
      name: string;
      stockQty: number;
    }[];
    lowStock: {
      id: string;
      sku: string;
      name: string;
      stockQty: number;
    }[];
  };
  purchasing: {
    recent: {
      poNumber: string;
      supplier: string;
      status: string;
      totalCost: number;
    }[];
  };
};

type Props = {
  tenantSlug: string;
};

type Section = "overview" | "cash" | "receivables" | "inventory" | "purchasing";

const money = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value);

const pct = (value: number | null) =>
  value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

function Metric({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 truncate text-2xl font-medium tracking-tight text-white">
        {value}
      </div>
      {change !== undefined && (
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${
            change === null
              ? "text-zinc-600"
              : change >= 0
                ? "text-emerald-400"
                : "text-rose-400"
          }`}
        >
          {change !== null &&
            (change >= 0 ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            ))}
          {pct(change)}
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-xl font-medium tracking-tight text-white md:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function AIAssistance({ tenantSlug }: Props) {
  const [company, setCompany] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [error, setError] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/ai?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load AI Employee.");
      }

      setCompany(data.company || "");
      setBusiness(data.business || null);
      setMessages(data.conversation?.messages || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load AI Employee.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug]);

  useEffect(() => {
    if (chatOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, sending, chatOpen]);

  const ask = async (prompt: string) => {
    const content = prompt.trim();
    if (!content || sending) return;

    setChatOpen(true);
    setInput("");
    setError("");

    setMessages((current) => [...current, { role: "user", content }]);

    setSending(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          message: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "AI request failed.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (err) {
      setMessages((current) => current.slice(0, -1));
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    ask(input);
  };

  const keyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-[#09090b] text-zinc-400">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Preparing AI Employee...
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] p-8 text-white">
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto text-rose-400" />
          <h1 className="mt-4 font-medium">AI Employee unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{error}</p>
          <button
            onClick={load}
            className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const s = business.summary;

  const jump = (section: Section) => {
    setActiveSection(section);
    requestAnimationFrame(() => {
      document
        .getElementById(`ai-${section}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const quickPrompts = [
    "What should I focus on today?",
    "Which customers need attention?",
    "What is my biggest current business risk?",
    "Which products should I reorder?",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      {/* No secondary sidebar. The parent ERP layout owns navigation. */}

      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 md:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-zinc-300" />
              <h1 className="text-sm font-medium text-white">AI Employee</h1>
            </div>
            <div className="mt-0.5 truncate text-xs text-zinc-600">
              {company}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
              title="Refresh business data"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => setChatOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-white px-3.5 text-xs font-medium text-black transition hover:bg-zinc-200"
            >
              <MessageSquare size={14} />
              Ask AI
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] overflow-x-auto px-5 pb-3 md:px-8">
          <div className="flex min-w-max items-center gap-1">
            {[
              ["overview", "Overview"],
              ["cash", "Cash & collections"],
              ["receivables", "Receivables"],
              ["inventory", "Inventory"],
              ["purchasing", "Purchasing"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => jump(id as Section)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${
                  activeSection === id
                    ? "bg-white/[0.09] text-white"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 md:px-8">
        {error && (
          <div className="mt-5 flex items-center justify-between border-b border-rose-500/20 pb-3 text-xs text-rose-300">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* OVERVIEW */}
        <section id="ai-overview" className="scroll-mt-28 pt-10 md:pt-14">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live business analysis
            </div>

            <h2 className="text-3xl font-medium tracking-[-0.04em] text-white md:text-5xl">
              Here&apos;s what matters.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 md:text-base">
              Your AI Employee watches the operational data LedgerCore can
              verify and brings the important signals to the surface.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-white/[0.08] py-7 md:grid-cols-4 md:gap-8">
            <Metric
              label="Revenue"
              value={money(s.currentRevenue)}
              change={s.revenueGrowth}
              icon={<TrendingUp size={13} />}
            />
            <Metric
              label="Collected"
              value={money(s.currentCollections)}
              change={s.collectionGrowth}
              icon={<CircleDollarSign size={13} />}
            />
            <Metric
              label="Outstanding"
              value={money(s.totalOutstanding)}
              icon={<Wallet size={13} />}
            />
            <Metric
              label="Overdue"
              value={money(s.overdueAmount)}
              icon={<FileWarning size={13} />}
            />
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <SectionHeading
                eyebrow="Attention"
                title="What needs your attention"
                description="These are direct signals from your current ERP data, not generic AI advice."
              />

              <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {s.overdueCount > 0 && (
                  <button
                    onClick={() => jump("receivables")}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-200">
                        {s.overdueCount} overdue invoice
                        {s.overdueCount === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-zinc-600">
                        {money(s.overdueAmount)} is currently overdue.
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-300"
                    />
                  </button>
                )}

                {s.outOfStockCount > 0 && (
                  <button
                    onClick={() => jump("inventory")}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-200">
                        {s.outOfStockCount} product
                        {s.outOfStockCount === 1 ? "" : "s"} out of stock
                      </div>
                      <div className="mt-1 text-xs leading-5 text-zinc-600">
                        Review stock before the shortage affects sales.
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-300"
                    />
                  </button>
                )}

                {s.lowStockCount > 0 && (
                  <button
                    onClick={() => jump("inventory")}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-200">
                        {s.lowStockCount} product
                        {s.lowStockCount === 1 ? "" : "s"} running low
                      </div>
                      <div className="mt-1 text-xs leading-5 text-zinc-600">
                        Inventory levels are approaching the current threshold.
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-300"
                    />
                  </button>
                )}

                {s.openPurchaseOrders > 0 && (
                  <button
                    onClick={() => jump("purchasing")}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-zinc-200">
                        {s.openPurchaseOrders} open purchase order
                        {s.openPurchaseOrders === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-zinc-600">
                        {money(s.openPurchaseOrderValue)} in current purchase
                        commitments.
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-300"
                    />
                  </button>
                )}

                {s.overdueCount === 0 &&
                  s.outOfStockCount === 0 &&
                  s.lowStockCount === 0 &&
                  s.openPurchaseOrders === 0 && (
                    <div className="py-8 text-sm text-zinc-600">
                      Nothing urgent detected in the available data.
                    </div>
                  )}
              </div>
            </div>

            <div className="lg:border-l lg:border-white/[0.07] lg:pl-10">
              <SectionHeading
                eyebrow="AI shortcuts"
                title="Ask about your business"
              />

              <div className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => ask(prompt)}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left text-xs text-zinc-500 hover:text-white"
                  >
                    <span>{prompt}</span>
                    <ChevronRight
                      size={13}
                      className="shrink-0 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CASH */}
        <section id="ai-cash" className="scroll-mt-28 pt-20 md:pt-28">
          <SectionHeading
            eyebrow="Cash & collections"
            title="Understand where the money is."
            description="A clean view of recorded invoices, payments and outstanding balances. No invented cash-flow assumptions."
          />

          <div className="mt-8 grid gap-8 border-y border-white/[0.08] py-7 sm:grid-cols-3">
            <Metric
              label="Current collections"
              value={money(s.currentCollections)}
              change={s.collectionGrowth}
              icon={<CircleDollarSign size={13} />}
            />
            <Metric
              label="Outstanding"
              value={money(s.totalOutstanding)}
              icon={<Wallet size={13} />}
            />
            <Metric
              label="Overdue"
              value={money(s.overdueAmount)}
              icon={<FileWarning size={13} />}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() =>
                ask(
                  "Analyze my current collections and receivables. What should I prioritize?",
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200"
            >
              <Sparkles size={14} />
              Analyze collections
            </button>
            <button
              onClick={() =>
                ask(
                  "Compare this month's revenue and collections with the previous month and explain the important changes.",
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] px-4 py-2.5 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            >
              Compare periods
            </button>
          </div>
        </section>

        {/* RECEIVABLES */}
        <section id="ai-receivables" className="scroll-mt-28 pt-20 md:pt-28">
          <SectionHeading
            eyebrow="Receivables"
            title="Who needs attention?"
            description="The customers carrying the largest outstanding balances, with overdue amounts separated out."
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                Largest outstanding balances
              </div>

              <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {business.receivables.topDebtors.length === 0 ? (
                  <div className="py-10 text-sm text-zinc-600">
                    No outstanding balances found.
                  </div>
                ) : (
                  business.receivables.topDebtors.map((customer) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium text-zinc-300">
                        {customer.customerName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-zinc-200">
                          {customer.customerName}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-600">
                          {customer.invoiceCount} open invoice
                          {customer.invoiceCount === 1 ? "" : "s"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-white">
                          {money(customer.outstanding)}
                        </div>
                        {customer.overdue > 0 && (
                          <div className="mt-1 text-[11px] text-rose-400">
                            {money(customer.overdue)} overdue
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                Overdue invoices
              </div>

              <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {business.receivables.overdueInvoices.length === 0 ? (
                  <div className="py-10 text-sm text-zinc-600">
                    No overdue invoices found.
                  </div>
                ) : (
                  business.receivables.overdueInvoices
                    .slice(0, 8)
                    .map((invoice) => (
                      <div
                        key={invoice.invoiceNumber}
                        className="flex items-center gap-4 py-4"
                      >
                        <FileWarning
                          size={15}
                          className="shrink-0 text-rose-400"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-zinc-200">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="mt-1 truncate text-[11px] text-zinc-600">
                            {invoice.customerName} · {invoice.daysOverdue} days
                            overdue
                          </div>
                        </div>
                        <div className="text-right text-sm text-white">
                          {money(invoice.outstanding)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              ask(
                "Prioritize my overdue receivables. Tell me who I should follow up with first and why.",
              )
            }
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200"
          >
            <Sparkles size={14} />
            Prioritize collections
          </button>
        </section>

        {/* INVENTORY */}
        <section id="ai-inventory" className="scroll-mt-28 pt-20 md:pt-28">
          <SectionHeading
            eyebrow="Inventory"
            title="Know what is running out."
            description="Products that are already out of stock and products approaching the current low-stock threshold."
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                <AlertCircle size={13} />
                Out of stock
              </div>

              <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {business.inventory.outOfStock.length === 0 ? (
                  <div className="py-10 text-sm text-zinc-600">
                    No products are out of stock.
                  </div>
                ) : (
                  business.inventory.outOfStock.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-zinc-200">
                          {product.name}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-600">
                          {product.sku}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-rose-400">
                        {product.stockQty}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                <PackageSearch size={13} />
                Low stock
              </div>

              <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {business.inventory.lowStock.length === 0 ? (
                  <div className="py-10 text-sm text-zinc-600">
                    No products are below the low-stock threshold.
                  </div>
                ) : (
                  business.inventory.lowStock.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-zinc-200">
                          {product.name}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-600">
                          {product.sku}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-amber-400">
                        {product.stockQty}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              ask(
                "Analyze my inventory and tell me which products I should prioritize and why.",
              )
            }
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200"
          >
            <Sparkles size={14} />
            Analyze inventory
          </button>
        </section>

        {/* PURCHASING */}
        <section id="ai-purchasing" className="scroll-mt-28 pt-20 md:pt-28">
          <SectionHeading
            eyebrow="Purchasing"
            title="Track current commitments."
            description="Open purchase orders and their current values, so purchasing decisions have context."
          />

          <div className="mt-8 grid gap-8 border-y border-white/[0.08] py-7 sm:grid-cols-2">
            <Metric
              label="Open purchase orders"
              value={String(s.openPurchaseOrders)}
              icon={<PackageSearch size={13} />}
            />
            <Metric
              label="Open commitment"
              value={money(s.openPurchaseOrderValue)}
              icon={<CircleDollarSign size={13} />}
            />
          </div>

          <div className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {business.purchasing.recent.length === 0 ? (
              <div className="py-10 text-sm text-zinc-600">
                No purchase orders found.
              </div>
            ) : (
              business.purchasing.recent.map((po) => (
                <div key={po.poNumber} className="flex items-center gap-4 py-4">
                  <PackageSearch size={15} className="shrink-0 text-zinc-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-200">{po.poNumber}</div>
                    <div className="mt-1 truncate text-[11px] text-zinc-600">
                      {po.supplier} · {po.status}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-zinc-300">
                    {money(po.totalCost)}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() =>
              ask(
                "Review my open purchase orders and tell me if there are any purchasing risks or priorities.",
              )
            }
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200"
          >
            <Sparkles size={14} />
            Analyze purchasing
          </button>
        </section>

        <footer className="mt-24 border-t border-white/[0.07] py-8 text-xs text-zinc-700">
          AI Employee uses verified LedgerCore operational data. It does not
          create transactions or change financial records from this page.
        </footer>
      </div>

      {/* AI CHAT DRAWER */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close AI assistant"
            onClick={() => setChatOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-full max-w-[560px] flex-col border-l border-white/[0.09] bg-[#0d0d10] shadow-2xl shadow-black/60">
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                  <Bot size={15} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Ask AI</div>
                  <div className="text-[10px] text-zinc-600">
                    LedgerCore intelligence
                  </div>
                </div>
              </div>

              <button
                onClick={() => setChatOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              {messages.length === 0 ? (
                <div className="flex min-h-[70vh] flex-col justify-center">
                  <Sparkles size={22} className="text-zinc-600" />
                  <h2 className="mt-4 text-xl font-medium text-white">
                    What do you want to understand?
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
                    Ask questions about your business. Answers are grounded in
                    the current LedgerCore data available to this company.
                  </p>

                  <div className="mt-7 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => ask(prompt)}
                        className="flex w-full items-center justify-between py-4 text-left text-xs text-zinc-500 hover:text-white"
                      >
                        <span>{prompt}</span>
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {messages.map((message, index) => (
                    <div
                      key={
                        message.id ??
                        `${message.role}-${message.createdAt ?? index}-${index}`
                      }
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-black">
                          <Bot size={13} />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] whitespace-pre-wrap text-sm leading-6 ${
                          message.role === "user"
                            ? "rounded-2xl bg-white/[0.08] px-4 py-3 text-zinc-200"
                            : "pt-1 text-zinc-400"
                        }`}
                      >
                        {message.content}
                      </div>

                      {message.role === "user" && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-zinc-500">
                          <User size={13} />
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-black">
                        <Bot size={13} />
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-xs text-zinc-600">
                        <Loader2 size={13} className="animate-spin" />
                        Analyzing your business data…
                      </div>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              )}
            </div>

            <form
              onSubmit={send}
              className="shrink-0 border-t border-white/[0.08] p-4"
            >
              <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] focus-within:border-white/[0.18]">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={keyDown}
                  rows={3}
                  maxLength={4000}
                  placeholder="Ask about your business..."
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700"
                />

                <div className="flex items-center justify-between px-3 pb-3">
                  <span className="text-[10px] text-zinc-700">
                    Enter to send · Shift + Enter for a new line
                  </span>
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
