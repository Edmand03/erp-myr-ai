"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.customer.create({
      data: {
        name,
        email,
        company,
        tenantId, // Ensure you pass the tenant ID here
      },
    });

    // Refresh the page data so the new customer appears in the table
    revalidatePath(`/v1/${tenantId}/customers`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create customer" };
  }
}

export async function deleteCustomer(tenantId: string, customerId: string) {
  if (!customerId || !tenantId) {
    return { success: false, error: "Invalid customer or tenant ID" };
  }

  try {
    // Delete the customer while enforcing tenant scope security
    await db.customer.delete({
      where: {
        id: customerId,
        tenantId: tenantId,
      },
    });

    // Refresh the page data so the deleted customer disappears from the table
    revalidatePath(`/v1/${tenantId}/customers`);
    return { success: false } as const;
  } catch (error) {
    return {
      success: false,
      error:
        "Failed to delete customer. Ensure there are no active dependencies linked to this profile.",
    };
  }
}
