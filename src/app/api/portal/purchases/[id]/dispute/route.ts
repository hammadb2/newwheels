// POST /api/portal/purchases/:id/dispute — buyer flags a purchase within 24h.

import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/crm/auth/rbac";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISPUTE_WINDOW_HOURS = 24;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { subject } = await requireBuyer();
  const { id } = await ctx.params;

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, buyer_id, purchased_at, lead_id")
    .eq("id", id)
    .single();
  if (!purchase || purchase.buyer_id !== subject.buyer_account_id) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const purchasedAt = new Date(purchase.purchased_at as string).getTime();
  if (Date.now() - purchasedAt > DISPUTE_WINDOW_HOURS * 60 * 60 * 1000) {
    return NextResponse.json({ ok: false, error: "dispute_window_closed" }, { status: 410 });
  }

  let detail = "";
  try {
    const form = await req.formData();
    detail = String(form.get("detail") ?? "").slice(0, 300);
  } catch {
    try {
      const json = (await req.json()) as { detail?: string };
      detail = String(json.detail ?? "").slice(0, 300);
    } catch {
      detail = "";
    }
  }

  const { error } = await supabase.from("lead_disputes").insert({
    purchase_id: purchase.id,
    lead_id: purchase.lead_id,
    buyer_id: subject.buyer_account_id,
    detail,
    status: "open",
  });
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });

  // Redirect back to the purchase page on form post.
  const portalUrl = process.env.NW_PORTAL_URL || "https://portal.newwheels.ca";
  return NextResponse.redirect(`${portalUrl.replace(/\/$/, "")}/portal/purchases/${id}?dispute=submitted`, 303);
}
