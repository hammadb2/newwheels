// Server helper to apply a qualification payload to a lead: insert the
// qualification row, run the scoring algorithm, set tier + starting price,
// mark the lead `available`, and fire CEO/Ops notification.

import { getServerSupabase } from "@/lib/crm/supabase/server";
import { creditBracketFromScore, scoreLead, startingPriceCentsForTier, tierFromScore } from "@/lib/crm/scoring";
import { LEAD_LIFETIME_HOURS } from "@/lib/crm/pricing";
import { buildSituationSummary } from "@/lib/crm/situation-summary";
import { sendEmail } from "@/lib/email/resend";
import { qualificationCompleteEmail } from "@/lib/email/templates";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import type { QualificationPayload, UnqualifiedReason } from "@/lib/crm/types";

export type QualifyResult =
  | { ok: true; status: "available"; lead_id: string; tier: string; starting_price_cents: number; situation_summary: string }
  | { ok: true; status: "unqualified"; lead_id: string }
  | { ok: false; error: string };

export async function submitQualification(opts: {
  lead_id: string;
  qualifier_id: string;
  qualifier_display_name: string;
  payload: QualificationPayload;
  call_duration_seconds?: number;
}): Promise<QualifyResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "not_configured" };

  // Ensure lead exists and isn't already processed.
  const { data: lead } = await supabase
    .from("leads")
    .select("id, status, first_name, assigned_qualifier_id, duplicate_of")
    .eq("id", opts.lead_id)
    .maybeSingle();

  if (!lead) return { ok: false, error: "lead_not_found" };
  if (lead.status === "sold" || lead.status === "expired") {
    return { ok: false, error: "lead_closed" };
  }

  // Insert qualification row.
  const { error: insErr } = await supabase.from("lead_qualifications").insert({
    lead_id: opts.lead_id,
    qualified_by: opts.qualifier_id,
    ...opts.payload,
    call_duration_seconds: opts.call_duration_seconds ?? null,
  });
  if (insErr) {
    console.error("submitQualification insert failed", insErr);
    return { ok: false, error: "db_error" };
  }

  // Compute score → tier → starting price.
  const result = scoreLead(opts.payload);
  const tier = result.tier;
  const starting_price_cents = startingPriceCentsForTier(tier);
  const summary = buildSituationSummary(opts.payload);
  const now = new Date();
  const expires = new Date(now.getTime() + LEAD_LIFETIME_HOURS * 60 * 60 * 1000);

  const update = {
    status: "available" as const,
    qualified_at: now.toISOString(),
    score: result.score,
    tier,
    starting_price_cents,
    current_price_cents: starting_price_cents,
    available_at: now.toISOString(),
    expires_at: expires.toISOString(),
    raw_payload: {
      situation_summary: summary,
      credit_bracket: creditBracketFromScore(result.score),
      score_breakdown: result.breakdown,
    } as Record<string, unknown>,
  };

  const { error: updErr } = await supabase
    .from("leads")
    .update(update)
    .eq("id", opts.lead_id);
  if (updErr) {
    console.error("submitQualification lead update failed", updErr);
    return { ok: false, error: "db_error" };
  }

  await supabase.from("lead_audit_log").insert({
    lead_id: opts.lead_id,
    actor_team_member_id: opts.qualifier_id,
    event: "qualified",
    detail: { score: result.score, tier, starting_price_cents } as Record<string, unknown>,
  });

  // Notify CEO + Platform Ops by email.
  await notifyOpsLeadQualified({
    lead_id: opts.lead_id,
    lead_first_name: lead.first_name as string,
    qualifier_display_name: opts.qualifier_display_name,
    tier,
    score: result.score,
    starting_price_cents,
  });

  return {
    ok: true,
    status: "available",
    lead_id: opts.lead_id,
    tier,
    starting_price_cents,
    situation_summary: summary,
  };
}

export async function markLeadUnqualified(opts: {
  lead_id: string;
  qualifier_id: string;
  reason: UnqualifiedReason;
  detail?: string;
}): Promise<QualifyResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "not_configured" };
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("leads")
    .update({
      status: "unqualified",
      qualified_at: now,
      unqualified_reason: opts.reason,
    })
    .eq("id", opts.lead_id);
  if (error) return { ok: false, error: "db_error" };
  await supabase.from("lead_audit_log").insert({
    lead_id: opts.lead_id,
    actor_team_member_id: opts.qualifier_id,
    event: "marked_unqualified",
    detail: { reason: opts.reason, detail: opts.detail ?? null } as Record<string, unknown>,
  });
  return { ok: true, status: "unqualified", lead_id: opts.lead_id };
}

async function notifyOpsLeadQualified(opts: {
  lead_id: string;
  lead_first_name: string;
  qualifier_display_name: string;
  tier: string;
  score: number;
  starting_price_cents: number;
}) {
  const supabase = getServerSupabase();
  if (!supabase) return;

  const { data: recipients } = await supabase
    .from("team_members")
    .select("email")
    .in("role", ["ceo", "platform_ops"])
    .eq("active", true);

  if (!recipients || recipients.length === 0) return;

  const crmUrl = (process.env.NW_CRM_URL || "https://crm.newwheels.ca").replace(/\/$/, "");
  const leadUrl = `${crmUrl}/crm/leads/${opts.lead_id}`;
  void sendEmail({
    to: recipients.map((r) => r.email as string),
    subject: `Qualification complete: ${opts.lead_first_name} — ${opts.tier.toUpperCase()}`,
    html: qualificationCompleteEmail({
      leadFirstName: opts.lead_first_name,
      qualifierName: opts.qualifier_display_name,
      tier: opts.tier,
      score: opts.score,
      startingPrice: priceCentsToDisplay(opts.starting_price_cents),
      leadUrl,
    }),
    tags: [{ name: "type", value: "qualification_complete" }],
  });
}

export function tierFromScoreExport(score: number) {
  return tierFromScore(score);
}
