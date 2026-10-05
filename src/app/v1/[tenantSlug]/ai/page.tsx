import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import AIAssistant from "@/components/features/AIAssistance";

export default async function AIEmployeePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const membership = await db.tenantMember.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      tenant: {
        slug: tenantSlug,
        status: "ACTIVE",
      },
    },
    select: {
      tenant: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!membership) {
    redirect("/dashboard-redirect");
  }

  return <AIAssistant tenantSlug={membership.tenant.slug} />;
}
