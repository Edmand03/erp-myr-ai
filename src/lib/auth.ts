import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "./prisma";

const trustedOrigins = [
  "http://localhost:3000",
  process.env.BETTER_AUTH_URL,
].filter(Boolean) as string[];

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

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
  },

  plugins: [nextCookies()],

  session: {
    cookieCache: {
      enabled: true,
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
