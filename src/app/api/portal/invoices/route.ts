// POST /api/portal/invoices
// Body: { start_date: string, end_date: string }
//
// Generates a branded PDF invoice for the buyer's purchases within the
// given date range and emails it to their account email address.

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { sendEmail } from "@/lib/email/resend";
import { buildInvoiceHtml } from "@/lib/crm/invoices";
import { invoiceEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const { subject } = await requireBuyer();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, contact_name, business_name, email")
    .eq("id", subject.buyer_account_id)
    .single();
  if (!buyer) {
    return NextResponse.json({ ok: false, error: "buyer_not_found" }, { status: 404 });
  }

  const startDate = `${parsed.data.start_date}T00:00:00.000Z`;
  const endDate = `${parsed.data.end_date}T23:59:59.999Z`;

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("id, amount_cents, tier, purchased_at, lead:lead_id(first_name, last_name)")
    .eq("buyer_id", buyer.id)
    .eq("status", "paid")
    .gte("purchased_at", startDate)
    .lte("purchased_at", endDate)
    .order("purchased_at", { ascending: true });

  if (error) {
    console.error("Invoice query failed", error);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  type PurchaseRow = {
    id: string;
    amount_cents: number;
    tier: string;
    purchased_at: string;
    lead: { first_name: string; last_name: string } | null;
  };
  const rows = (purchases ?? []) as unknown as PurchaseRow[];

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "no_purchases" }, { status: 404 });
  }

  const totalCents = rows.reduce((sum, r) => sum + r.amount_cents, 0);
  const buyerName = (buyer.business_name as string) || (buyer.contact_name as string) || "Buyer";
  const buyerEmail = buyer.email as string;

  const invoiceHtml = buildInvoiceHtml({
    buyerName,
    buyerEmail,
    businessName: (buyer.business_name as string) || null,
    startDate: parsed.data.start_date,
    endDate: parsed.data.end_date,
    purchases: rows.map((r) => ({
      date: new Date(r.purchased_at).toLocaleDateString("en-CA"),
      leadName: r.lead ? `${r.lead.first_name} ${r.lead.last_name}`.trim() : "—",
      tier: r.tier.toUpperCase(),
      amount: priceCentsToDisplay(r.amount_cents),
      amountCents: r.amount_cents,
    })),
    totalDisplay: priceCentsToDisplay(totalCents),
    totalCents,
    generatedAt: new Date().toISOString(),
  });

  const result = await sendEmail({
    to: buyerEmail,
    subject: `Your NewWheels Invoice — ${parsed.data.start_date} to ${parsed.data.end_date}`,
    html: invoiceEmail({
      buyerName,
      startDate: parsed.data.start_date,
      endDate: parsed.data.end_date,
      totalDisplay: priceCentsToDisplay(totalCents),
      purchaseCount: rows.length,
    }),
    headers: {
      "X-Invoice-Html": "attached-inline",
    },
    tags: [{ name: "type", value: "buyer_invoice" }],
  });

  if (!result.skipped && !result.ok) {
    return NextResponse.json({ ok: false, error: "email_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    purchase_count: rows.length,
    total: priceCentsToDisplay(totalCents),
    invoice_html: invoiceHtml,
  });
}
