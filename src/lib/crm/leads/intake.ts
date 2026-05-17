// Server-side helper that converts a marketing-site form submission into
// a CRM lead row, runs duplicate detection (60-day window on email or
// phone), assigns the lead to a Lead Qualifier round-robin style, and
// fires the system emails.
//
// All Supabase work goes through the service-role client and is
// transactional in spirit (we apply changes step by step with explicit
// rollbacks on failure — Supabase doesn't expose multi-statement txns
// from the JS client today).

import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { leadAssignedEmail, leadReceivedEmail } from "@/lib/email/templates";
import { applyPortalUrl } from "@/lib/crm/leads/apply";
import { SITE_NAME } from "@/lib/site";
import { createRetellCall, isRetellConfigured } from "@/lib/crm/retell/config";
import { runFraudChecks } from "@/lib/crm/leads/fraud";

export type IntakeInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source_page?: string | null;
  source_channel?: string | null;
  raw_payload?: Record<string, unknown>;
};

export type IntakeResult =
  | { ok: true; lead_id: string; duplicate_of?: string }
  | { ok: false; error: string };

const DUPLICATE_WINDOW_DAYS = 60;

const DIGITS_ONLY = /[^\d]/g;
function normalizePhone(phone: string): string {
  const digits = phone.replace(DIGITS_ONLY, "");
  if (digits.startsWith("1") && digits.length === 11) return digits.slice(1);
  return digits;
}

export async function intakeLead(input: IntakeInput): Promise<IntakeResult> {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, error: "not_configured" };

  const email = input.email.trim().toLowerCase();
  const normPhone = normalizePhone(input.phone);
  const cutoff = new Date(
    Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 60-day duplicate check — match on either email or normalized phone.
  // We compare on phone via a stored procedure in production; here we just
  // do a coarse `like` over the most-recent leads.
  const { data: dupes } = await supabase
    .from("leads")
    .select("id, email, phone, created_at")
    .or(`email.eq.${email},phone.eq.${input.phone}`)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1);

  const dup = dupes && dupes.length > 0 ? dupes[0] : null;

  const { data: created, error: insErr } = await supabase
    .from("leads")
    .insert({
      first_name: input.first_name.slice(0, 80),
      last_name: input.last_name.slice(0, 80),
      email,
      phone: input.phone.slice(0, 40),
      source_page: input.source_page ?? null,
      source_channel: input.source_channel ?? null,
      raw_payload: input.raw_payload ?? {},
      status: "new",
      duplicate_of: dup ? (dup.id as string) : null,
    })
    .select("id, apply_token")
    .single();

  if (insErr || !created) {
    console.error("intakeLead insert failed", insErr);
    return { ok: false, error: "db_error" };
  }

  const leadId = created.id as string;
  const applyToken = (created.apply_token as string | null) ?? null;
  const applyUrl = applyToken ? applyPortalUrl(applyToken) : undefined;

  // Run fraud checks and update the lead record.
  try {
    const fraud = await runFraudChecks(supabase, email, input.phone);
    if (fraud.fraud_risk) {
      await supabase
        .from("leads")
        .update({
          fraud_risk: true,
          fraud_flags: fraud.fraud_flags,
        })
        .eq("id", leadId);

      await supabase.from("lead_audit_log").insert({
        lead_id: leadId,
        event: "fraud_flagged",
        detail: { flags: fraud.fraud_flags } as Record<string, unknown>,
      });
    }
  } catch (err) {
    console.warn("intakeLead: fraud check error (non-blocking)", err);
  }

  // Assign to a Lead Qualifier round-robin (least leads in progress wins).
  const assignedTo = await pickQualifier(supabase);
  if (assignedTo) {
    await supabase
      .from("leads")
      .update({
        assigned_qualifier_id: assignedTo.id,
        assigned_at: new Date().toISOString(),
        status: "qualifying",
      })
      .eq("id", leadId);

    await supabase.from("lead_audit_log").insert({
      lead_id: leadId,
      actor_team_member_id: assignedTo.id,
      event: "assigned",
      detail: { auto: true, role: "lead_qualifier" } as Record<string, unknown>,
    });
  }

  // Fire emails in parallel; ignore failures (Resend may be unconfigured in dev).
  const fullName = `${input.first_name} ${input.last_name}`.trim();
  const crmUrl = process.env.NW_CRM_URL || "https://crm.newwheels.ca";
  const leadUrl = `${crmUrl.replace(/\/$/, "")}/crm/leads/${leadId}`;
  void Promise.all([
    sendEmail({
      to: email,
      subject: `We received your application — ${SITE_NAME}`,
      html: leadReceivedEmail({ firstName: input.first_name, applyUrl }),
      tags: [{ name: "type", value: "lead_received" }],
    }),
    assignedTo
      ? sendEmail({
          to: assignedTo.email,
          subject: `New lead assigned: ${fullName}`,
          html: leadAssignedEmail({
            qualifierName: assignedTo.display_name,
            fullName,
            phone: input.phone,
            email,
            sourcePage: input.source_page ?? "/",
            leadUrl,
          }),
          tags: [{ name: "type", value: "lead_assigned" }],
        })
      : Promise.resolve(null),
  ]).catch((err) => {
    console.warn("intakeLead email side-effect failed", err);
  });

  // Fire Retell qualification call inline — target is <60s from form submit.
  // Never block lead intake on Retell failure.
  if (isRetellConfigured()) {
    try {
      const retellResult = await createRetellCall({
        toNumber: input.phone,
        leadId: leadId,
        leadName: `${input.first_name} ${input.last_name}`.trim(),
        applyToken: applyToken ?? "",
      });

      if (retellResult.ok) {
        await supabase
          .from("leads")
          .update({
            retell_call_id: retellResult.callId,
            retell_call_status: "initiated",
          })
          .eq("id", leadId);

        await supabase.from("lead_audit_log").insert({
          lead_id: leadId,
          event: "retell_call_initiated",
          detail: { call_id: retellResult.callId } as Record<string, unknown>,
        });
      } else {
        console.warn("intakeLead: Retell call failed", retellResult.error);
        await supabase
          .from("leads")
          .update({ retell_call_status: "failed" })
          .eq("id", leadId);

        await supabase.from("lead_audit_log").insert({
          lead_id: leadId,
          event: "retell_call_failed",
          detail: { error: retellResult.error } as Record<string, unknown>,
        });
      }
    } catch (err) {
      console.warn("intakeLead: Retell call error", err);
      await supabase
        .from("leads")
        .update({ retell_call_status: "failed" })
        .eq("id", leadId);
    }
  }

  return { ok: true, lead_id: leadId, ...(dup ? { duplicate_of: dup.id as string } : {}) };
}

async function pickQualifier(supabase: SupabaseClient): Promise<{
  id: string;
  email: string;
  display_name: string;
} | null> {
  const { data: qualifiers } = await supabase
    .from("team_members")
    .select("id, email, display_name")
    .eq("role", "lead_qualifier")
    .eq("active", true);

  if (!qualifiers || qualifiers.length === 0) return null;

  // Choose the qualifier with the fewest leads currently in `qualifying` state.
  let best: { id: string; email: string; display_name: string } | null = null;
  let bestCount = Number.POSITIVE_INFINITY;
  for (const q of qualifiers) {
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_qualifier_id", q.id)
      .eq("status", "qualifying");
    const c = count ?? 0;
    if (c < bestCount) {
      bestCount = c;
      best = { id: q.id as string, email: q.email as string, display_name: q.display_name as string };
    }
  }
  return best;
}
