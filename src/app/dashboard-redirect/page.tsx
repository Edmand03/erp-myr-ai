import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export default async function DashboardRedirectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Look up what tenant workspace this user belongs to
  const membership = await db.tenantMember.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true },
  });

  if (!membership) {
    redirect("/register?error=no-workspace");
  }

  // Send them straight to their distinct URL workspace route!
  redirect(`/v1/${membership.tenant.slug}/dashboard`);
}
