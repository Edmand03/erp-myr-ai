"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { connection } from "next/server";
import * as z from "zod";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
const db =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  companyRegNo: z.string().min(1),
});

export async function registerTenantAction(formData: any) {
  await connection();

  const validated = registerSchema.safeParse(formData);
  if (!validated.success) return { error: "Invalid registration input data." };

  const { email, password, name, companyName, companyRegNo } = validated.data;
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    // 1. Check if workspace exists
    const existingTenant = await db.tenant.findUnique({ where: { slug } });
    if (existingTenant) return { error: "This company name is already taken." };

    // 2. Create the User via Better Auth
    const authUserResponse = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (!authUserResponse || !authUserResponse.user) {
      return { error: "Failed to create security profile." };
    }

    const userId = authUserResponse.user.id;

    // 3. Create Tenant, Admin Role, and Membership in a single atomic transaction
    const result = await db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: companyName, slug, companyRegNo, status: "ACTIVE" },
      });

      const adminRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: "Admin",
          description: "Full administrative control",
          isSystem: true,
        },
      });

      await tx.tenantMember.create({
        data: {
          tenantId: tenant.id,
          userId,
          roleId: adminRole.id,
          isActive: true,
        },
      });

      return tenant;
    });

    return { success: true, slug: result.slug };
  } catch (error: any) {
    console.error("❌ REGISTRATION FAILURE:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
