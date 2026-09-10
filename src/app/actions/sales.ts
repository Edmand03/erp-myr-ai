"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, getUserTenantRole } from "@/lib/auth";
import { headers } from "next/headers";

interface InvoiceLineItem {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
}

export async function createInvoiceAction(
  tenantId: string,
  slug: string,
  customerId: string,
  invoiceNo: string,
  dueDateInput: string | Date,
  items: InvoiceLineItem[],
) {
  try {
    if (!customerId || customerId.trim() === "") {
      return {
        error:
          "Please select or create a valid customer before saving the invoice.",
      };
    }
    if (!invoiceNo) {
      return { error: "Invoice number is required." };
    }
    if (!items || items.length === 0) {
      return {
        error: "An invoice must contain at least one product or charge.",
      };
    }

    const dueDate = new Date(dueDateInput);

    // Calculate total dynamically across all lines
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    await db.$transaction(async (tx) => {
      // 1. Fetch customer details to satisfy required schema fields
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error("Target customer not found in registry.");
      }

      // 2. Create the parent Invoice matching schema fields exactly
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          customerId,
          invoiceNumber: invoiceNo,
          customerName: customer.name,
          customerEmail: customer.email || "",
          subtotal: totalAmount,
          total: totalAmount,
          status: "DRAFT",
          dueDate,
        },
      });

      // 3. Create line items & decrement product inventory only if it's a catalog item
      for (const item of items) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId || null,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            //@ts-ignore
            subtotal: item.quantity * item.unitPrice,
          },
        });

        // Only deduct inventory if it's a linked catalog product (has a valid productId)
        if (item.productId && item.productId.trim() !== "") {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQty: {
                decrement: item.quantity,
              },
            },
          });
        }
      }
    });

    revalidatePath(`/v1/${slug}/sales`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to generate multi-item invoice." };
  }
}

export async function createCustomerAction(
  tenantId: string,
  slug: string,
  data: { name: string; email?: string },
) {
  if (!data.name) return { error: "Customer name is required." };

  try {
    const newCustomer = await db.customer.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
      },
    });

    revalidatePath(`/v1/${slug}/sales`);
    return { success: true, customer: newCustomer };
  } catch (error) {
    return { error: "Failed to register customer." };
  }
}

export async function deleteInvoiceAction({
  invoiceId,
  tenantSlug,
  tenantId,
}: {
  invoiceId: string;
  tenantSlug: string;
  tenantId: string;
}) {
  "use server";
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    console.log("1. User Session ID:", userSession?.user?.id);
    if (!userSession) return { error: "Unauthorized." };

    console.log("2. Looking up Tenant ID:", tenantId);
    // const member = await db.tenantMember.findFirst({
    //   where: {
    //     userId: userSession.user.id,
    //     tenantId: tenant.id,
    //   },
    // });
    const member = await getUserTenantRole(userSession.user.id, tenantId);

    console.log("3. Found Tenant Member Record:", member);

    if (!member) {
      return {
        error: `Access Denied: Role found was '${member || "NONE"}'`,
      };
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { invoiceItems: true },
    });

    console.log("4. Found Invoice Target:", invoice?.id);
    if (!invoice) return { error: "Invoice not found." };

    // Perform deletion safely with proper relation cleanups inside the transaction
    await db.$transaction(
      async (tx) => {
        for (const item of invoice.invoiceItems) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQty: { increment: item.quantity } },
            });
          }
        }

        await tx.invoiceItem.deleteMany({ where: { invoiceId } });
        await tx.invoice.delete({ where: { id: invoiceId } });
      },
      {
        maxWait: 10000,
        timeout: 10000,
      },
    );

    revalidatePath(`/v1/${tenantSlug}/sales`);
    return { success: true };
  } catch (err: any) {
    console.error("Delete Invoice Fatal Error:", err);
    return {
      error:
        err.message || "Failed to delete invoice due to database constraints.",
    };
  }
}
