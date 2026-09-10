import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import InvoiceForm from "./InvoiceForm";
import LhdnSubmitButton from "./lhdnSubmitButton";
import PaymentButton from "./PaymentButton";
import PaymentRefresher from "./PaymentRefresher";
import { revalidatePath } from "next/cache";
import DownloadPdfButton from "./DownloadPdfButton";
import DuitNowQrButton from "../components/DuitQRModal";
import ModalTrigger from "./ModalTrigger";
import DeleteInvoiceButton from "./components/DeleteInvoiceButton";
import SkeletalSales from "../components/lazyloading/SkeletalSales";

export const dynamic = "force-dynamic";

interface SalesPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function SalesPage({ params }: SalesPageProps) {
  const { tenantSlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const accessCheck = await db.tenantMember.findFirst({
    where: { userId: session.user.id, tenant: { slug: tenantSlug } },
    include: {
      tenant: {
        include: {
          products: { orderBy: { name: "asc" } },
          customers: { orderBy: { name: "asc" } },
          invoices: {
            orderBy: { createdAt: "desc" },
            include: { invoiceItems: { include: { product: true } } },
          },
        },
      },
    },
  });

  if (!accessCheck) redirect("/dashboard-redirect");
  const tenant = accessCheck.tenant;

  async function generateDuitNowQrAction(invoiceId: string) {
    "use server";
    try {
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!invoice) return { error: "Invoice not found." };

      const isSandbox = process.env.HITPAY_API_KEY?.startsWith("test_");
      const baseUrl = isSandbox
        ? "https://api.sandbox.hit-pay.com"
        : "https://api.hit-pay.com";

      const response = await fetch(`${baseUrl}/v1/payment-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
        },
        body: JSON.stringify({
          amount: Number(invoice.total),
          currency: "MYR",
          payment_methods: ["duitnow"],
          generate_qr: true,
          reference: invoice.invoiceNumber,
          name: invoice.customerName,
          email: invoice.customerEmail || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to initialize HitPay payment request.",
        );
      }

      const rawQrValue = data.qr_code || data.qr_code_data?.qr_code;

      return {
        success: true,
        qrString: rawQrValue,
        checkoutUrl: data.url,
      };
    } catch (err: any) {
      console.error(err);
      return { error: err.message || "Could not generate DuitNow QR." };
    }
  }

  async function createInvoiceServerAction(formDataObj: {
    customerId: string;
    invoiceNumber: string;
    dueDate: string;
    items: Array<{
      productId?: string | null;
      description?: string | null;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    "use server";
    try {
      const { customerId, invoiceNumber, dueDate, items } = formDataObj;

      if (!customerId || !invoiceNumber || !items || items.length === 0) {
        return { error: "Missing required fields or line items." };
      }

      const customer = await db.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) return { error: "Customer not found." };

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      const sstRate = 0.08;
      const sstAmount = subtotal * sstRate;
      const total = subtotal + sstAmount;

      await db.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
          data: {
            tenantId: tenant.id,
            customerId,
            invoiceNumber,
            customerName: customer.name,
            customerEmail: customer.email || "",
            buyerTin: customer.company || null,
            subtotal,
            sstRate,
            sstAmount,
            total,
            status: "UNPAID",
            dueDate: new Date(dueDate),
          },
        });

        for (const item of items) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              productId: item.productId || null,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
          });

          if (item.productId) {
            await db.product.update({
              where: { id: item.productId },
              data: { stockQty: { decrement: item.quantity } },
            });
          }
        }
      });

      revalidatePath(`/v1/${tenantSlug}/sales`);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { error: err.message || "Failed to save invoice." };
    }
  }

  const serializedInvoices = tenant.invoices.map((inv) => ({
    ...inv,
    createdAt: inv.createdAt
      ? new Date(inv.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: inv.updatedAt
      ? new Date(inv.updatedAt).toISOString()
      : new Date().toISOString(),
    dueDate: inv.dueDate
      ? new Date(inv.dueDate).toISOString()
      : new Date().toISOString(),
    sstRate: inv.sstRate ? Number(inv.sstRate) : 0,
    sstAmount: inv.sstAmount ? Number(inv.sstAmount) : 0,
    subtotal: inv.subtotal ? Number(inv.subtotal) : 0,
    total: inv.total ? Number(inv.total) : 0,
    amountPaid: inv.amountPaid ? Number(inv.amountPaid) : 0, // 👈 Added this line to fix the error!
    invoiceItems: inv.invoiceItems.map((item) => ({
      ...item,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,
      //@ts-ignore
      subtotal: item.subtotal ? Number(item.subtotal) : 0,
      product: item.product
        ? {
            ...item.product,
            price: item.product.price ? Number(item.product.price) : 0,
            createdAt: item.product.createdAt
              ? new Date(item.product.createdAt).toISOString()
              : new Date().toISOString(),
            //@ts-ignore
            updatedAt: item.product.updatedAt
              ? //@ts-ignore
                new Date(item.product.updatedAt).toISOString()
              : new Date().toISOString(),
          }
        : null,
    })),
  }));

  async function quickCreateCustomer(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!name) return;

    await db.customer.create({
      data: {
        name,
        company,
        email,
        phone,
        tenantId: tenant.id,
      },
    });

    revalidatePath(`/v1/${tenantSlug}/sales`);
  }

  const serializedProducts = tenant.products.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: Number(p.price || 0),
    stockQty: p.stockQty,
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedCustomers = tenant.customers.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div style={styles.container}>
      <PaymentRefresher />

      {/* Fixed Sticky Header Navigation */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div>
            <Link href={`/v1/${tenantSlug}/dashboard`} style={styles.backLink}>
              <span style={styles.backArrow}>←</span> Return to ERP Hub
            </Link>
            <div style={styles.titleWrapper}>
              <h1 style={styles.title}>{tenant.name} Sales Ledger</h1>
              <span style={styles.badgeSub}>Enterprise Billing Suite</span>
            </div>
          </div>

          <div style={styles.headerActions}>
            <ModalTrigger
              buttonText="＋ Register Client"
              buttonStyle={styles.secondaryBtn}
              modalTitle="Quick Add New Customer"
              modalSubtitle="Register a client instantly for seamless billing selection"
              icon="👤"
            >
              <form
                action={quickCreateCustomer}
                style={styles.quickCustomerForm}
              >
                <div style={styles.grid2}>
                  <div style={styles.group}>
                    <label style={styles.label}>Client Name *</label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.group}>
                    <label style={styles.label}>Company / SSM</label>
                    <input
                      name="company"
                      placeholder="e.g. Apex Industries"
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.grid2}>
                  <div style={styles.group}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="sarah@company.com"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.group}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      name="phone"
                      placeholder="+60 12-345 6789"
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formFooter}>
                  <button type="submit" style={styles.primaryBtn}>
                    Save Client Profile
                  </button>
                </div>
              </form>
            </ModalTrigger>

            <ModalTrigger
              buttonText="🧾 New Invoice"
              buttonStyle={styles.primaryBtn}
              modalTitle="New Invoice Entry"
              modalSubtitle="Generate billing items, add catalog goods or custom labor"
              icon="🧾"
            >
              <InvoiceForm
                tenantId={tenant.id}
                slug={tenantSlug}
                //@ts-ignore
                products={serializedProducts}
                //@ts-ignore
                customers={serializedCustomers}
                onCreateInvoice={createInvoiceServerAction}
              />
            </ModalTrigger>
          </div>
        </div>
      </header>

      <Suspense fallback={<SkeletalSales />}>
        {/* Scrollable Layout Context */}
        <main style={styles.mainLayout}>
          <div style={styles.tableCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.iconBox}>📊</div>
                <div>
                  <h2 style={styles.cardTitle}>
                    Invoice History & LHDN Registry
                  </h2>
                  <p style={styles.cardSubtitle}>
                    Track validation states, payment progress, and compliance
                    documents
                  </p>
                </div>
              </div>

              {/* This inner container scrolls independently while headers remain fixed */}
              <div style={styles.scrollableLedgerList}>
                {serializedInvoices.length === 0 ? (
                  <div style={styles.emptyPrompt}>
                    <div style={styles.emptyIcon}>📂</div>
                    <div style={styles.emptyTitle}>No Invoices Issued Yet</div>
                    <div style={styles.emptyDesc}>
                      Start by registering a client and clicking "New Invoice"
                      above.
                    </div>
                  </div>
                ) : (
                  serializedInvoices.map((inv) => {
                    const sst = Number(inv.sstAmount || 0);
                    const total = Number(inv.total || 0);
                    const isPaid = inv.status === "PAID";

                    return (
                      <div key={inv.id} style={styles.ledgerCard}>
                        <div style={styles.ledgerCardHeader}>
                          <div style={styles.invoiceMetaGroup}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span style={styles.invoiceNumber}>
                                {inv.invoiceNumber}
                              </span>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor: isPaid
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "rgba(245, 158, 11, 0.1)",
                                  color: isPaid ? "#34d399" : "#fbbf24",
                                  borderColor: isPaid
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : "rgba(245, 158, 11, 0.3)",
                                }}
                              >
                                {isPaid ? "PAID" : "UNPAID"}
                              </span>
                            </div>
                            <span style={styles.customerName}>
                              Client: <strong>{inv.customerName}</strong>
                            </span>
                          </div>
                          <div style={styles.rowFinancials}>
                            <span style={styles.totalText}>
                              RM {total.toFixed(2)}
                            </span>
                            <span style={styles.sstText}>
                              Subtotal: RM {Number(inv.subtotal).toFixed(2)} |
                              SST (8%): RM {sst.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div style={styles.ledgerCardBody}>
                          <div style={styles.metaRow}>
                            <span style={styles.tinText}>
                              <strong>Buyer TIN / SSM:</strong>{" "}
                              {inv.buyerTin || "Not Provided"}
                            </span>
                            <span style={styles.dueDateText}>
                              <strong>Due Date:</strong>{" "}
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={styles.itemsSummary}>
                            {inv.invoiceItems.map((item) => (
                              <span key={item.id} style={styles.itemTag}>
                                {item.product
                                  ? item.product.name
                                  : item.description || "Custom Item"}{" "}
                                <strong style={{ color: "#38bdf8" }}>
                                  (x{item.quantity})
                                </strong>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={styles.ledgerCardFooter}>
                          <div>
                            {
                              //@ts-ignore
                              inv.lhdnUuid ? (
                                <span style={styles.badgeSuccess}>
                                  LHDN Validated ✓
                                </span>
                              ) : (
                                <LhdnSubmitButton
                                  invoiceId={inv.id}
                                  totalAmount={total}
                                  buyerTin={inv.buyerTin}
                                />
                              )
                            }

                            <DeleteInvoiceButton
                              invoiceId={inv.id}
                              tenantId={tenant.id}
                              tenantSlug={tenantSlug}
                            />
                          </div>
                          <div style={styles.actionButtonGroup}>
                            <DownloadPdfButton
                              invoice={inv}
                              tenantName={tenant.name}
                            />
                            {!isPaid && (
                              <>
                                <PaymentButton
                                  invoiceId={inv.id}
                                  slug={tenantSlug}
                                />
                                <DuitNowQrButton
                                  invoiceId={inv.id}
                                  invoiceNumber={inv.invoiceNumber}
                                  totalAmount={total}
                                  onGenerate={generateDuitNowQrAction}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </Suspense>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflow: "hidden", // Locks full window scroll
  },
  navbar: {
    backgroundColor: "#0b0f19",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
    zIndex: 50,
    backdropFilter: "blur(8px)",
  },
  navContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.2s ease",
  },
  backArrow: {
    fontSize: "14px",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    flexWrap: "wrap" as const,
    marginTop: "4px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  badgeSub: {
    fontSize: "11px",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "2px 8px",
    borderRadius: "6px",
    fontWeight: 500,
    border: "1px solid #334155",
  },
  mainLayout: {
    flex: 1,
    padding: "24px 40px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
  tableCol: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "14px",
    flexShrink: 0,
  },
  iconBox: {
    width: "38px",
    height: "38px",
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  quickCustomerForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "18px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "11px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  secondaryBtn: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    border: "1px solid #334155",
    padding: "9px 16px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  primaryBtn: {
    backgroundColor: "#38bdf8",
    color: "#030712",
    border: "none",
    padding: "9px 16px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  // 💡 This is the scrollable container holding just the invoice items list
  scrollableLedgerList: {
    flex: 1,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
    paddingRight: "6px",
  },
  ledgerCard: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    transition: "border-color 0.2s ease",
  },
  ledgerCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  invoiceMetaGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  invoiceNumber: {
    fontWeight: 800,
    color: "#38bdf8",
    fontSize: "15px",
    letterSpacing: "-0.2px",
  },
  statusBadge: {
    fontSize: "10px",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: 700,
    border: "1px solid",
    letterSpacing: "0.5px",
  },
  customerName: {
    color: "#94a3b8",
    fontSize: "12px",
  },
  rowFinancials: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
  },
  totalText: {
    fontWeight: 800,
    fontSize: "16px",
    color: "#f8fafc",
    letterSpacing: "-0.3px",
  },
  sstText: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  ledgerCardBody: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    paddingTop: "10px",
    borderTop: "1px solid #1e293b",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#94a3b8",
  },
  tinText: {},
  dueDateText: {},
  itemsSummary: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "6px",
    marginTop: "2px",
  },
  itemTag: {
    fontSize: "11px",
    backgroundColor: "#030712",
    color: "#cbd5e1",
    padding: "3px 8px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    fontWeight: 500,
  },
  ledgerCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid #1e293b",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  badgeSuccess: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    fontSize: "11px",
    fontWeight: 700,
    borderRadius: "20px",
    border: "1px solid rgba(16, 185, 129, 0.25)",
  },
  actionButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  emptyPrompt: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "#111827",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  emptyIcon: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "4px",
  },
  emptyDesc: {
    fontSize: "13px",
    color: "#64748b",
    maxWidth: "300px",
    margin: "0 auto",
    lineHeight: "1.4",
  },
};
