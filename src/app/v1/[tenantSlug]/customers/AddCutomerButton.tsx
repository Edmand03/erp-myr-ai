"use client";

import { createCustomer } from "@/app/actions/customers";

export function AddCustomerButton({ tenantId }: { tenantId: string }) {
  // We use the tenantId (the UUID) to link the customer to the tenant
  const createCustomerWithTenant = createCustomer.bind(null, tenantId);

  return (
    <form
      //@ts-ignore
      action={createCustomerWithTenant}
      className="space-y-4 p-4 border rounded"
    >
      <input
        name="name"
        placeholder="Customer Name"
        required
        className="border p-2 w-full"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
      />
      <input
        name="company"
        placeholder="Company"
        className="border p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Customer
      </button>
    </form>
  );
}
