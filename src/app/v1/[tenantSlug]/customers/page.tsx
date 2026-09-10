import { db } from "@/lib/prisma";
import { CustomersClient } from "./CustomersClient";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserTenantRole, auth } from "@/lib/auth";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const tenant = await db.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { customers: { orderBy: { name: "asc" } } },
  });

  if (!tenant) return <div>Tenant not found</div>;

  // 1. Check user role permissions for this tenant
  const authCheck = await getUserTenantRole(session.user.id, tenant.id);

  // 2. Serialize Decimal fields (e.g., creditLimit) to plain numbers for the Client Component
  const serializedCustomers = tenant.customers.map((customer) => ({
    ...customer,
    creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : 0,
  }));

  const serializedTenant = {
    ...tenant,
    customers: serializedCustomers,
  };

  return (
    <CustomersClient tenant={serializedTenant} authCheck={authCheck?.isAdmin} />
  );
}
