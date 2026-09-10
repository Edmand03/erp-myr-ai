import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ARService } from "@/service/ar.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> },
) {
  try {
    const { tenantSlug, customerId } = await params;
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const type = url.searchParams.get("type");

    const tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const ledger = await ARService.getCustomerLedger(tenant.id, customerId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type: type || undefined,
    });

    return NextResponse.json({ success: true, ledger });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
