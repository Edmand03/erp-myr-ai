// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { db } from "@/lib/prisma";

// export const dynamic = "force-dynamic";

// export default async function DashboardRedirectPage() {
//   const requestHeaders = await headers();

//   console.log("=== AUTH DEBUG ===");
//   console.log("HOST:", requestHeaders.get("host"));
//   console.log("ORIGIN:", requestHeaders.get("origin"));
//   console.log("COOKIE:", requestHeaders.get("cookie"));

//   const session = await auth.api.getSession({
//     headers: requestHeaders,
//     query: {
//       disableCookieCache: true,
//     },
//   });

//   console.log(
//     "[dashboard-redirect] session:",
//     session
//       ? {
//           userId: session.user.id,
//           email: session.user.email,
//         }
//       : null,
//   );

//   if (!session?.user) {
//     console.log("[dashboard-redirect] No session -> /login");

//     redirect("/login");
//   }

//   const membership = await db.tenantMember.findFirst({
//     where: {
//       userId: session.user.id,
//       isActive: true,
//     },
//     include: {
//       tenant: true,
//     },
//   });

//   console.log(
//     "[dashboard-redirect] membership:",
//     membership
//       ? {
//           tenantId: membership.tenantId,
//           tenantSlug: membership.tenant.slug,
//         }
//       : null,
//   );

//   if (!membership) {
//     console.log("[dashboard-redirect] No workspace -> /register");

//     redirect("/register?error=no-workspace");
//   }

//   redirect(`/v1/${membership.tenant.slug}/dashboard`);
// }

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardRedirectPage() {
  const requestHeaders = await headers();

  const cookie = requestHeaders.get("cookie");

  console.log("========== DASHBOARD REDIRECT ==========");
  console.log("HOST:", requestHeaders.get("host"));
  console.log("COOKIE EXISTS:", !!cookie);
  console.log("COOKIE:", cookie);

  let session = null;

  try {
    session = await auth.api.getSession({
      headers: requestHeaders,
      query: {
        disableCookieCache: true,
      },
    });

    console.log(
      "SESSION:",
      session
        ? {
            userId: session.user.id,
            email: session.user.email,
          }
        : null,
    );
  } catch (error) {
    console.error("GET SESSION ERROR:", error);
  }

  if (!session?.user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Session not found</h1>
        <pre>
          {JSON.stringify(
            {
              host: requestHeaders.get("host"),
              cookieExists: !!cookie,
              session: null,
            },
            null,
            2,
          )}
        </pre>
      </div>
    );
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

  console.log("MEMBERSHIP:", membership);

  if (!membership) {
    return (
      <div style={{ padding: 40 }}>
        <h1>No workspace found</h1>
        <pre>{JSON.stringify(session.user, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Authenticated successfully</h1>

      <p>User: {session.user.email}</p>

      <p>Tenant: {membership.tenant.slug}</p>

      <p>Destination: /v1/{membership.tenant.slug}/dashboard</p>
    </div>
  );
}
