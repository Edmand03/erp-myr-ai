import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardRedirectPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
    query: {
      // Force Better Auth to verify the real session
      // instead of relying on the cookie cache.
      disableCookieCache: true,
    },
  });

  console.log(
    "[dashboard-redirect] session:",
    session
      ? {
          userId: session.user.id,
          email: session.user.email,
        }
      : null,
  );

  if (!session?.user) {
    console.log("[dashboard-redirect] No session -> /login");

    redirect("/login");
  }

  const membership = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      tenant: true,
    },
  });

  console.log(
    "[dashboard-redirect] membership:",
    membership
      ? {
          tenantId: membership.tenantId,
          tenantSlug: membership.tenant.slug,
        }
      : null,
  );

  if (!membership) {
    console.log("[dashboard-redirect] No workspace -> /register");

    redirect("/register?error=no-workspace");
  }

  redirect(`/v1/${membership.tenant.slug}/dashboard`);
}
