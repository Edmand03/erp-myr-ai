import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./prisma"; // Or "../../lib/prisma" depending on folder depth
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
    //@ts-ignore
    modelMapping: {
      user: "User",
      session: "Session",
      account: "Account",
      verification: "Verification",
    },
  }),
  // 💡 Tell the backend server exactly where it is being hosted:
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  session: {
    cookieCache: { enabled: true },
  },
  sessionToken: {
    cookieName: "session_token",
    // Try setting this to your tunnel domain if possible,
    // or leave undefined if it defaults correctly.
  },
  cookies: {
    sessionToken: {
      name: "auth_session",
      options: {
        httpOnly: true,
        secure: true, // Required for HTTPS tunnels
        sameSite: "none", // This is key: 'none' allows the cookie across the tunnel
      },
    },
  },
});

export async function getUserTenantRole(userId: string, tenantId: string) {
  const membership = await db.tenantMember.findFirst({
    where: {
      tenantId,
      userId,
      isActive: true,
    },
    include: {
      role: true,
    },
  });

  if (!membership) return null;

  const roleName = membership.role.name.toUpperCase();
  return {
    roleName,
    isAdmin: roleName === "ADMIN" || roleName === "OWNER",
    isStaff: roleName === "STAFF",
  };
}
