//@ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const permissionsData = [
    {
      id: "dashboard:read",
      module: "DASHBOARD",
      description: "View workspace analytics overview",
    },
    {
      id: "inventory:read",
      module: "INVENTORY",
      description: "View warehouse materials and stock",
    },
    {
      id: "inventory:adjust",
      module: "INVENTORY",
      description: "Manually adjust stock balances",
    },
    {
      id: "quotation:create",
      module: "PROJECTS",
      description: "Draft engineering service estimations",
    },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: {},
      create: perm,
    });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: "Family Electrical Contracting Sdn Bhd",
      slug: "family-electric",
      sstNumber: "W10-1234-567890",
      companyRegNo: "202601XXXXXX",
      status: "ACTIVE",
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: "Admin",
      description: "Full system infrastructure access controls",
      isSystem: true,
    },
  });

  const permissions = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });

  console.log(`✅ System setup complete. Created Tenant ID: ${tenant.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
