// POST /api/crm/leads/:id/relist — CEO re-lists an expired lead at the $75 floor.

import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/crm/auth/rbac";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { LEAD_LIFETIME_HOURS, PRICE_FLOOR_CENTS } from "@/lib/crm/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireTeam("ceo");
  const session = await readSession("crm");
  const { id } = await ctx.params;

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: lead } = await supabase
    .from("leads")
    .select("id, status, tier")
    .eq("id", id)
    .single();
  if (!lead) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (lead.status !== "expired") return NextResponse.json({ ok: false, error: "not_expired" }, { status: 409 });

  const now = new Date();
  const expires = new Date(now.getTime() + LEAD_LIFETIME_HOURS * 60 * 60 * 1000);

  const { error } = await supabase
    .from("leads")
    .update({
      status: "available",
      available_at: now.toISOString(),
      expires_at: expires.toISOString(),
      current_price_cents: PRICE_FLOOR_CENTS,
      starting_price_cents: PRICE_FLOOR_CENTS,
      relisted_at: now.toISOString(),
      relist_count: (await supabase.from("leads").select("relist_count").eq("id", id).single()).data?.relist_count + 1 || 1,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });

  await supabase.from("lead_audit_log").insert({
    lead_id: id,
    actor_team_member_id: session && session.subject.kind === "team" ? session.subject.team_member_id : null,
    event: "relisted",
    detail: { price_cents: PRICE_FLOOR_CENTS } as Record<string, unknown>,
  });

  const crmUrl = (process.env.NW_CRM_URL || "https://crm.newwheels.ca").replace(/\/$/, "");
  return NextResponse.redirect(`${crmUrl}/crm/pipeline`, 303);
}
