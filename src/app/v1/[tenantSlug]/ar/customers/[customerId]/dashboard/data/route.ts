import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ARService } from "@/service/ar.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> },
) {
  try {
    const { tenantSlug, customerId } = await params;
    const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const customer = await db.customer.findUnique({
      where: { id: customerId, tenantId: tenant.id },
    });
    if (!customer)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );

    const outstanding = await ARService.getCustomerOutstanding(
      tenant.id,
      customerId,
    );
    const creditLimit = customer.creditLimit || 0;
    const availableCredit = Number(creditLimit) - Number(outstanding);

    const recentTransactions = await db.ledgerTransaction.findMany({
      where: { tenantId: tenant.id, customerId },
      orderBy: { date: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      customer,
      outstanding: Number(outstanding),
      creditLimit: Number(creditLimit),
      availableCredit,
      recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
