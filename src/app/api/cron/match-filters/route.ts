// GET /api/cron/match-filters
//
// Walks newly-available leads and notifies any buyer whose saved filters
// match. Idempotent via the lead_filter_notifications join table.

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { sendEmail } from "@/lib/email/resend";
import { newLeadAvailableEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SavedFilter = {
  id: string;
  buyer_id: string;
  name: string;
  filters: Record<string, string>;
};

type LeadSummary = {
  id: string;
  first_name: string;
  tier: string;
  current_price_cents: number;
  raw_payload: Record<string, unknown> | null;
};

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, first_name, tier, current_price_cents, raw_payload, available_at")
    .eq("status", "available")
    .gt("available_at", sinceIso);

  const { data: filters } = await supabase
    .from("saved_filters")
    .select("id, buyer_id, name, filters");

  if (!leads || !filters) return NextResponse.json({ ok: true });

  // Pre-load buyer emails once.
  const buyerIds = Array.from(new Set(filters.map((f) => f.buyer_id as string)));
  const { data: buyers } = buyerIds.length > 0
    ? await supabase.from("buyer_accounts").select("id, email, contact_name, business_name").in("id", buyerIds).eq("status", "active")
    : { data: [] };
  const buyerMap = new Map<string, { email: string; name: string }>();
  for (const b of buyers ?? []) {
    buyerMap.set(b.id as string, {
      email: b.email as string,
      name: ((b.business_name as string) || (b.contact_name as string) || "there"),
    });
  }

  let notifications = 0;
  for (const lead of leads as LeadSummary[]) {
    for (const filter of filters as SavedFilter[]) {
      if (!matchesFilter(lead, filter.filters)) continue;
      const buyer = buyerMap.get(filter.buyer_id);
      if (!buyer) continue;
      const { data: existing } = await supabase
        .from("lead_filter_notifications")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("saved_filter_id", filter.id)
        .maybeSingle();
      if (existing) continue;
      const { error: insErr } = await supabase
        .from("lead_filter_notifications")
        .insert({ lead_id: lead.id, saved_filter_id: filter.id, buyer_id: filter.buyer_id });
      if (insErr) continue;
      const portalUrl = (process.env.NW_PORTAL_URL || "https://portal.newwheels.ca").replace(/\/$/, "");
      const summary = (((lead.raw_payload as Record<string, unknown> | null) ?? {}).situation_summary as string) ?? "";
      void sendEmail({
        to: buyer.email,
        subject: `New lead matches ${filter.name}`,
        html: newLeadAvailableEmail({
          buyerName: buyer.name,
          filterName: filter.name,
          summary,
          tier: lead.tier,
          price: priceCentsToDisplay(lead.current_price_cents),
          marketplaceUrl: `${portalUrl}/portal/marketplace`,
        }),
        tags: [{ name: "type", value: "marketplace_match" }],
      });
      notifications += 1;
    }
  }
  return NextResponse.json({ ok: true, notifications });
}

function matchesFilter(lead: LeadSummary, filter: Record<string, string>): boolean {
  const payload = lead.raw_payload ?? {};
  if (filter.tier && filter.tier !== "all" && filter.tier !== lead.tier) return false;
  if (filter.credit && filter.credit !== "all" && filter.credit !== (payload.credit_bracket as string)) return false;
  if (filter.body && filter.body !== "all" && filter.body !== (payload.body_type as string)) return false;
  if (filter.visa && filter.visa !== "all" && filter.visa !== (payload.visa_status as string)) return false;
  if (filter.budget && filter.budget !== "all" && filter.budget !== (payload.total_budget as string)) return false;
  if (filter.down && filter.down !== "all" && filter.down !== (payload.down_payment as string)) return false;
  if (filter.tl && filter.tl !== "all" && filter.tl !== (payload.purchase_timeline as string)) return false;
  return true;
}
