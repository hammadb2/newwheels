// POST /api/crm/leads/:id/set-price — CEO manually overrides a lead's price.
//
// Body: { price_cents: number }          → set override
// Body: { price_cents: null }            → clear override (revert to computed)

import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  price_cents: z.number().int().min(0).nullable(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await readSession("crm");
  if (!session || session.subject.kind !== "team" || session.subject.role !== "ceo") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  const { id: leadId } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  // Verify lead exists and is available.
  const { data: lead } = await supabase
    .from("leads")
    .select("id, status, current_price_cents")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });

  const now = new Date().toISOString();
  const priceCents = parsed.data.price_cents;

  if (priceCents !== null) {
    // Set override.
    const { error } = await supabase
      .from("leads")
      .update({
        price_override_cents: priceCents,
        current_price_cents: priceCents,
        price_override_by: session.subject.team_member_id,
        price_override_at: now,
      })
      .eq("id", leadId);

    if (error) {
      console.error("set-price update failed", error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    await supabase.from("lead_audit_log").insert({
      lead_id: leadId,
      actor_team_member_id: session.subject.team_member_id,
      event: "price_override_set",
      detail: { price_cents: priceCents, previous_price_cents: lead.current_price_cents } as Record<string, unknown>,
    });
  } else {
    // Clear override — pricing cron will recompute on next run.
    const { error } = await supabase
      .from("leads")
      .update({
        price_override_cents: null,
        price_override_by: null,
        price_override_at: null,
      })
      .eq("id", leadId);

    if (error) {
      console.error("set-price clear failed", error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    await supabase.from("lead_audit_log").insert({
      lead_id: leadId,
      actor_team_member_id: session.subject.team_member_id,
      event: "price_override_cleared",
      detail: { previous_price_cents: lead.current_price_cents } as Record<string, unknown>,
    });
  }

  return NextResponse.json({ ok: true });
}
