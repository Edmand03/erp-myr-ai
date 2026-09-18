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
        include: {
          products: {
            orderBy: {
              name: "asc",
            },
          },
          customers: {
            orderBy: {
              name: "asc",
            },
          },
          invoices: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              invoiceItems: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!accessCheck) {
    redirect("/dashboard-redirect");
  }

  const tenant = accessCheck.tenant;

  // =========================================
  // DUITNOW QR
  // =========================================

  async function generateDuitNowQrAction(invoiceId: string) {
    "use server";

    try {
      const invoice = await db.invoice.findUnique({
        where: {
          id: invoiceId,
        },
        include: {
          customer: true,
        },
      });

      if (!invoice) {
        return {
          error: "Invoice not found.",
        };
      }

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

      return {
        error: err.message || "Could not generate DuitNow QR.",
      };
    }
  }

  // =========================================
  // CREATE INVOICE
  // =========================================

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
        return {
          error: "Missing required fields or line items.",
        };
      }

      const customer = await db.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!customer) {
        return {
          error: "Customer not found.",
        };
      }

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
              where: {
                id: item.productId,
              },
              data: {
                stockQty: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      });

      revalidatePath(`/v1/${tenantSlug}/sales`);

      return {
        success: true,
      };
    } catch (err: any) {
      console.error(err);

      return {
        error: err.message || "Failed to save invoice.",
      };
    }
  }

  // =========================================
  // SERIALIZE INVOICES
  // =========================================

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

    amountPaid: inv.amountPaid ? Number(inv.amountPaid) : 0,

    invoiceItems: inv.invoiceItems.map((item) => ({
      ...item,

      unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,

      // @ts-ignore
      subtotal: item.subtotal ? Number(item.subtotal) : 0,

      product: item.product
        ? {
            ...item.product,

            price: item.product.price ? Number(item.product.price) : 0,

            createdAt: item.product.createdAt
              ? new Date(item.product.createdAt).toISOString()
              : new Date().toISOString(),

            // @ts-ignore
            updatedAt: item.product.updatedAt
              ? //@ts-ignore
                new Date(item.product.updatedAt).toISOString()
              : new Date().toISOString(),
          }
        : null,
    })),
  }));

  // =========================================
  // QUICK CREATE CUSTOMER
  // =========================================

  async function quickCreateCustomer(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();

    const company = String(formData.get("company") || "").trim();

    const email = String(formData.get("email") || "").trim();

    const phone = String(formData.get("phone") || "").trim();

    if (!name) {
      return;
    }

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

  // =========================================
  // SERIALIZE PRODUCTS
  // =========================================

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

  // =========================================
  // SERIALIZE CUSTOMERS
  // =========================================

  const serializedCustomers = tenant.customers.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    createdAt: c.createdAt.toISOString(),
  }));

  // =========================================
  // UI
  // =========================================

  return (
    <div className="sales-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        /* =====================================
           PAGE
        ===================================== */

        .sales-page {
          position: relative;

          width: 100%;
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 12% 0%,
              rgba(56, 189, 248, 0.075),
              transparent 30%
            ),
            radial-gradient(
              circle at 88% 8%,
              rgba(99, 102, 241, 0.06),
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

          overflow-x: hidden;
        }

        .sales-page::before {
          content: "";

          position: fixed;
          inset: 0;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(148, 163, 184, 0.02) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148, 163, 184, 0.02) 1px,
              transparent 1px
            );

          background-size: 48px 48px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 80%
            );
        }

        /* =====================================
           HEADER
        ===================================== */

        .sales-header {
          position: sticky;

          top: 0;

          z-index: 50;

          width: 100%;

          background:
            rgba(3, 7, 18, 0.91);

          border-bottom:
            1px solid rgba(
              148,
              163,
              184,
              0.11
            );

          backdrop-filter:
            blur(20px);

          -webkit-backdrop-filter:
            blur(20px);
        }

        .sales-header-inner {
          width: 100%;

          max-width: 1500px;

          margin: 0 auto;

          padding:
            20px 48px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 30px;
        }

        .sales-header-left {
          min-width: 0;
        }

        .sales-back {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          color: #64748b;

          text-decoration: none;

          font-size: 11px;

          font-weight: 650;

          transition:
            color 160ms ease;
        }

        .sales-back:hover {
          color: #cbd5e1;
        }

        .sales-back-arrow {
          font-size: 15px;
        }

        .sales-title-row {
          display: flex;

          align-items: center;

          gap: 11px;

          flex-wrap: wrap;

          margin-top: 7px;
        }

        .sales-title {
          margin: 0;

          color: #f8fafc;

          font-size: 20px;

          line-height: 1.25;

          font-weight: 800;

          letter-spacing: -0.5px;
        }

        .sales-badge {
          display: inline-flex;

          align-items: center;

          min-height: 24px;

          padding:
            4px 9px;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.13
            );

          border-radius: 7px;

          background:
            rgba(15, 23, 42, 0.75);

          color: #64748b;

          font-size: 8px;

          font-weight: 750;

          letter-spacing: 0.06em;

          text-transform: uppercase;
        }

        .sales-header-actions {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-shrink: 0;
        }

        .sales-header-button {
          min-height: 42px;

          padding:
            0 16px;

          border-radius: 10px;

          font-size: 11px;

          font-weight: 750;

          cursor: pointer;

          white-space: nowrap;
        }

        /* =====================================
           MAIN
        ===================================== */

        .sales-main {
          position: relative;

          z-index: 1;

          width: 100%;

          max-width: 1500px;

          margin: 0 auto;

          padding:
            40px 48px 80px;
        }

        .sales-layout {
          width: 100%;
        }

        /* =====================================
           MAIN CARD
        ===================================== */

        .ledger-card {
          width: 100%;

          padding: 30px;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.11
            );

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(11, 15, 25, 0.96),
              rgba(7, 12, 24, 0.96)
            );

          box-shadow:
            0 20px 50px
            rgba(0, 0, 0, 0.18);
        }

        .ledger-header {
          display: flex;

          align-items: flex-start;

          gap: 16px;

          margin-bottom: 28px;

          padding-bottom: 24px;

          border-bottom:
            1px solid
            rgba(
              148,
              163,
              184,
              0.09
            );
        }

        .ledger-icon {
          width: 46px;
          height: 46px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex: 0 0 auto;

          border:
            1px solid
            rgba(
              56,
              189,
              248,
              0.16
            );

          border-radius: 12px;

          background:
            rgba(
              56,
              189,
              248,
              0.055
            );

          color: #38bdf8;

          font-size: 18px;
        }

        .ledger-title {
          margin: 0;

          color: #f8fafc;

          font-size: 17px;

          line-height: 1.35;

          font-weight: 750;

          letter-spacing: -0.25px;
        }

        .ledger-subtitle {
          max-width: 700px;

          margin:
            6px 0 0;

          color: #64748b;

          font-size: 11px;

          line-height: 1.5;
        }

        /* =====================================
           INVOICE LIST
        ===================================== */

        .invoice-list {
          display: flex;

          flex-direction: column;

          gap: 18px;

          width: 100%;
        }

        /* =====================================
           INVOICE
        ===================================== */

        .invoice-item {
          padding: 24px;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.1
            );

          border-radius: 15px;

          background:
            rgba(
              15,
              23,
              42,
              0.54
            );

          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .invoice-item:hover {
          border-color:
            rgba(
              148,
              163,
              184,
              0.19
            );

          background:
            rgba(
              15,
              23,
              42,
              0.72
            );
        }

        .invoice-top {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 28px;
        }

        .invoice-meta {
          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .invoice-number-row {
          display: flex;

          align-items: center;

          gap: 9px;

          flex-wrap: wrap;
        }

        .invoice-number {
          color: #38bdf8;

          font-family:
            "SFMono-Regular",
            Consolas,
            monospace;

          font-size: 14px;

          font-weight: 800;

          letter-spacing: -0.2px;
        }

        .invoice-status {
          display: inline-flex;

          align-items: center;

          min-height: 24px;

          padding:
            0 9px;

          border-radius: 6px;

          font-size: 9px;

          font-weight: 750;

          letter-spacing: 0.05em;
        }

        .invoice-customer {
          color: #94a3b8;

          font-size: 11px;
        }

        .invoice-customer strong {
          color: #e2e8f0;

          font-weight: 650;
        }

        .invoice-financials {
          display: flex;

          flex-direction: column;

          align-items: flex-end;

          gap: 5px;

          flex-shrink: 0;
        }

        .invoice-total {
          color: #f8fafc;

          font-size: 19px;

          line-height: 1;

          font-weight: 850;

          letter-spacing: -0.5px;
        }

        .invoice-tax {
          color: #64748b;

          font-size: 9px;

          line-height: 1.4;

          text-align: right;
        }

        /* =====================================
           INVOICE DETAILS
        ===================================== */

        .invoice-details {
          display: flex;

          flex-direction: column;

          gap: 15px;

          margin-top: 22px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(
              148,
              163,
              184,
              0.08
            );
        }

        .invoice-meta-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          color: #64748b;

          font-size: 10px;
        }

        .invoice-meta-item {
          min-width: 0;
        }

        .invoice-meta-item strong {
          color: #94a3b8;

          font-weight: 650;
        }

        .invoice-items {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 8px;
        }

        .invoice-item-tag {
          display: inline-flex;

          align-items: center;

          min-height: 29px;

          padding:
            0 10px;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.1
            );

          border-radius: 7px;

          background:
            rgba(3, 7, 18, 0.7);

          color: #94a3b8;

          font-size: 10px;

          white-space: nowrap;
        }

        .invoice-item-tag strong {
          margin-left: 5px;

          color: #38bdf8;

          font-weight: 700;
        }

        /* =====================================
           INVOICE FOOTER
        ===================================== */

        .invoice-footer {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 18px;

          margin-top: 22px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(
              148,
              163,
              184,
              0.08
            );
        }

        .invoice-compliance-actions {
          display: flex;

          align-items: center;

          gap: 9px;

          flex-wrap: wrap;
        }

        .invoice-action-buttons {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 9px;

          flex-wrap: wrap;
        }

        /* =====================================
           EMPTY STATE
        ===================================== */

        .empty-state {
          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          min-height: 340px;

          padding:
            60px 30px;

          text-align: center;

          border:
            1px dashed
            rgba(
              148,
              163,
              184,
              0.13
            );

          border-radius: 14px;

          background:
            rgba(
              15,
              23,
              42,
              0.25
            );
        }

        .empty-icon {
          width: 58px;
          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 18px;

          border:
            1px solid
            rgba(
              148,
              163,
              184,
              0.11
            );

          border-radius: 15px;

          background:
            rgba(
              15,
              23,
              42,
              0.75
            );

          font-size: 23px;
        }

        .empty-title {
          margin: 0;

          color: #e2e8f0;

          font-size: 14px;

          font-weight: 750;
        }

        .empty-description {
          max-width: 380px;

          margin:
            8px auto 0;

          color: #475569;

          font-size: 11px;

          line-height: 1.6;
        }

        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 1000px) {
          .sales-header-inner,
          .sales-main {
            padding-left: 32px;

            padding-right: 32px;
          }

          .sales-header-actions {
            gap: 8px;
          }

          .invoice-top {
            gap: 18px;
          }
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 760px) {
          .sales-header {
            position: relative;
          }

          .sales-header-inner {
            align-items: flex-start;

            flex-direction: column;

            padding:
              18px 20px;

            gap: 16px;
          }

          .sales-header-actions {
            width: 100%;

            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 9px;
          }

          .sales-header-button {
            width: 100%;

            padding:
              0 12px;

            font-size: 10px;
          }

          .sales-title {
            font-size: 17px;
          }

          .sales-main {
            padding:
              26px 20px 55px;
          }

          .ledger-card {
            padding: 20px 16px;

            border-radius: 15px;
          }

          .ledger-header {
            gap: 12px;

            margin-bottom: 22px;

            padding-bottom: 18px;
          }

          .ledger-icon {
            width: 40px;
            height: 40px;

            border-radius: 10px;

            font-size: 15px;
          }

          .ledger-title {
            font-size: 15px;
          }

          .ledger-subtitle {
            font-size: 10px;
          }

          .invoice-list {
            gap: 14px;
          }

          .invoice-item {
            padding: 19px 16px;
          }

          .invoice-top {
            flex-direction: column;

            gap: 15px;
          }

          .invoice-financials {
            align-items: flex-start;
          }

          .invoice-tax {
            text-align: left;
          }

          .invoice-meta-row {
            align-items: flex-start;

            flex-direction: column;

            gap: 7px;
          }

          .invoice-footer {
            align-items: stretch;

            flex-direction: column;

            gap: 15px;
          }

          .invoice-compliance-actions,
          .invoice-action-buttons {
            width: 100%;
          }

          .invoice-action-buttons {
            justify-content: flex-start;
          }
        }

        /* =====================================
           SMALL MOBILE
        ===================================== */

        @media (max-width: 480px) {
          .sales-header-inner {
            padding:
              15px 14px;
          }

          .sales-main {
            padding:
              20px 14px 45px;
          }

          .sales-title {
            font-size: 15px;
          }

          .sales-badge {
            display: none;
          }

          .sales-header-actions {
            grid-template-columns: 1fr;
          }

          .ledger-card {
            padding:
              18px 14px;
          }

          .ledger-header {
            align-items: flex-start;
          }

          .ledger-icon {
            display: none;
          }

          .invoice-item {
            padding:
              17px 14px;
          }

          .invoice-number {
            font-size: 13px;
          }

          .invoice-total {
            font-size: 17px;
          }

          .invoice-item-tag {
            max-width: 100%;

            overflow: hidden;

            text-overflow: ellipsis;
          }
        }
      `}</style>

      <PaymentRefresher />

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="sales-header">
        <div className="sales-header-inner">
          <div className="sales-header-left">
            <Link href={`/v1/${tenantSlug}/dashboard`} className="sales-back">
              <span className="sales-back-arrow">←</span>
              Return to ERP Hub
            </Link>

            <div className="sales-title-row">
              <h1 className="sales-title">{tenant.name} Sales Ledger</h1>

              <span className="sales-badge">Enterprise Billing Suite</span>
            </div>
          </div>

          <div className="sales-header-actions">
            <ModalTrigger
              buttonText="＋ Register Client"
              buttonStyle={{
                ...styles.secondaryBtn,
              }}
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
              buttonText="＋ New Invoice"
              buttonStyle={{
                ...styles.primaryBtn,
              }}
              modalTitle="New Invoice Entry"
              modalSubtitle="Generate billing items, add catalog goods or custom labor"
              icon="🧾"
            >
              <InvoiceForm
                tenantId={tenant.id}
                slug={tenantSlug}
                // @ts-ignore
                products={serializedProducts}
                // @ts-ignore
                customers={serializedCustomers}
                onCreateInvoice={createInvoiceServerAction}
              />
            </ModalTrigger>
          </div>
        </div>
      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

      <main className="sales-main">
        <Suspense fallback={<SkeletalSales />}>
          <div className="sales-layout">
            <section className="ledger-card">
              <div className="ledger-header">
                <div className="ledger-icon">#</div>

                <div>
                  <h2 className="ledger-title">
                    Invoice History & LHDN Registry
                  </h2>

                  <p className="ledger-subtitle">
                    Track validation states, payment progress, compliance
                    documents, and invoice activity.
                  </p>
                </div>
              </div>

              <div className="invoice-list">
                {serializedInvoices.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">+</div>

                    <h3 className="empty-title">No Invoices Issued Yet</h3>

                    <p className="empty-description">
                      Start by registering a client and creating your first
                      invoice.
                    </p>
                  </div>
                ) : (
                  serializedInvoices.map((inv) => {
                    const sst = Number(inv.sstAmount || 0);

                    const total = Number(inv.total || 0);

                    const isPaid = inv.status === "PAID";

                    return (
                      <article key={inv.id} className="invoice-item">
                        {/* TOP */}
                        <div className="invoice-top">
                          <div className="invoice-meta">
                            <div className="invoice-number-row">
                              <span className="invoice-number">
                                {inv.invoiceNumber}
                              </span>

                              <span
                                className="invoice-status"
                                style={{
                                  backgroundColor: isPaid
                                    ? "rgba(16, 185, 129, 0.09)"
                                    : "rgba(245, 158, 11, 0.09)",

                                  color: isPaid ? "#34d399" : "#fbbf24",

                                  border: `1px solid ${
                                    isPaid
                                      ? "rgba(16, 185, 129, 0.24)"
                                      : "rgba(245, 158, 11, 0.24)"
                                  }`,
                                }}
                              >
                                {isPaid ? "PAID" : "UNPAID"}
                              </span>
                            </div>

                            <span className="invoice-customer">
                              Client: <strong>{inv.customerName}</strong>
                            </span>
                          </div>

                          <div className="invoice-financials">
                            <span className="invoice-total">
                              RM {total.toFixed(2)}
                            </span>

                            <span className="invoice-tax">
                              Subtotal: RM {Number(inv.subtotal).toFixed(2)}
                              {" · "}
                              SST (8%): RM {sst.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div className="invoice-details">
                          <div className="invoice-meta-row">
                            <span className="invoice-meta-item">
                              <strong>Buyer TIN / SSM:</strong>{" "}
                              {inv.buyerTin || "Not Provided"}
                            </span>

                            <span className="invoice-meta-item">
                              <strong>Due Date:</strong>{" "}
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="invoice-items">
                            {inv.invoiceItems.map((item) => (
                              <span key={item.id} className="invoice-item-tag">
                                {item.product
                                  ? item.product.name
                                  : item.description || "Custom Item"}

                                <strong>×{item.quantity}</strong>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div className="invoice-footer">
                          <div className="invoice-compliance-actions">
                            {
                              // @ts-ignore
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

                          <div className="invoice-action-buttons">
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
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </Suspense>
      </main>
    </div>
  );
}

/* =========================================
   MODAL / FORM STYLES
========================================= */

const styles = {
  quickCustomerForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "4px 0",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  label: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: 650,
  },

  input: {
    width: "100%",
    minHeight: "46px",

    backgroundColor: "#111827",

    color: "#f8fafc",

    border: "1px solid rgba(148, 163, 184, 0.14)",

    padding: "0 14px",

    borderRadius: "10px",

    fontSize: "13px",

    outline: "none",
  },

  formFooter: {
    display: "flex",
    justifyContent: "flex-end",

    paddingTop: "4px",
  },

  secondaryBtn: {
    minHeight: "42px",

    backgroundColor: "rgba(15, 23, 42, 0.85)",

    color: "#cbd5e1",

    border: "1px solid rgba(148, 163, 184, 0.16)",

    padding: "0 16px",

    borderRadius: "10px",

    fontWeight: 700,

    fontSize: "11px",

    cursor: "pointer",

    transition: "all 160ms ease",
  },

  primaryBtn: {
    minHeight: "42px",

    backgroundColor: "#38bdf8",

    color: "#030712",

    border: "none",

    padding: "0 17px",

    borderRadius: "10px",

    fontWeight: 750,

    fontSize: "11px",

    cursor: "pointer",

    transition: "all 160ms ease",

    boxShadow: "0 5px 18px rgba(56, 189, 248, 0.14)",
  },

  badgeSuccess: {
    display: "inline-flex",

    alignItems: "center",

    minHeight: "29px",

    padding: "0 11px",

    backgroundColor: "rgba(16, 185, 129, 0.08)",

    color: "#34d399",

    fontSize: "9px",

    fontWeight: 750,

    borderRadius: "7px",

    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
};
