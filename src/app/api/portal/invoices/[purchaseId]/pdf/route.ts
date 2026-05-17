// GET /api/portal/invoices/[purchaseId]/pdf
// Returns the invoice HTML for a single purchase so the buyer can print-to-PDF.

import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { buildInvoiceHtml } from "@/lib/crm/invoices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  const { purchaseId } = await params;
  const { subject } = await requireBuyer();

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, contact_name, business_name, email")
    .eq("id", subject.buyer_account_id)
    .single();
  if (!buyer) return NextResponse.json({ ok: false, error: "buyer_not_found" }, { status: 404 });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, amount_cents, tier, purchased_at, invoice_number, card_brand, card_last4, lead:lead_id(first_name, last_name, phone)")
    .eq("id", purchaseId)
    .eq("buyer_id", buyer.id)
    .single();

  if (!purchase) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  type Row = {
    id: string;
    amount_cents: number;
    tier: string;
    purchased_at: string;
    invoice_number: string | null;
    card_brand: string | null;
    card_last4: string | null;
    lead: { first_name: string; last_name: string; phone: string | null } | null;
  };
  const r = purchase as unknown as Row;

  const buyerName = (buyer.business_name as string) || (buyer.contact_name as string) || "Buyer";
  const purchaseDate = new Date(r.purchased_at).toLocaleDateString("en-CA");

  const html = buildInvoiceHtml({
    buyerName,
    buyerEmail: buyer.email as string,
    businessName: (buyer.business_name as string) || null,
    startDate: purchaseDate,
    endDate: purchaseDate,
    purchases: [
      {
        date: purchaseDate,
        leadName: r.lead ? `${r.lead.first_name} ${r.lead.last_name}`.trim() : "—",
        leadPhone: r.lead?.phone ?? null,
        tier: r.tier.toUpperCase(),
        amount: priceCentsToDisplay(r.amount_cents),
        amountCents: r.amount_cents,
        invoiceNumber: r.invoice_number ?? null,
        cardBrand: r.card_brand ?? null,
        cardLast4: r.card_last4 ?? null,
      },
    ],
    totalDisplay: priceCentsToDisplay(r.amount_cents),
    totalCents: r.amount_cents,
    generatedAt: new Date().toISOString(),
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="invoice-${r.invoice_number ?? r.id}.html"`,
    },
  });
}
