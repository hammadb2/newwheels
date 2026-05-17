// Expired lead nurture pipeline.
//
// Day 7 / Day 14 / Day 30 email sequence for expired leads.
// Sequence stops if applicant resubmits at any point.
// Resubmissions tracked as nurture conversions.

import { getServerSupabase } from "./supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { EMAIL_BRAND as B, ctaButton, systemEmailWrapper } from "@/lib/email/wrapper";
import { SITE_URL } from "@/lib/site";

export type NurtureStep = "day_7" | "day_14" | "day_30";

const NURTURE_SCHEDULE: { step: NurtureStep; days: number; subject: string }[] = [
  { step: "day_7", days: 7, subject: "Still looking for a vehicle?" },
  { step: "day_14", days: 14, subject: "Tips to improve your approval odds" },
  { step: "day_30", days: 30, subject: "One last check-in" },
];

function unsubscribeUrl(leadId: string): string {
  return `${SITE_URL}/api/nurture/unsubscribe?id=${encodeURIComponent(leadId)}`;
}

function nurtureEmailDay7(firstName: string, leadId: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Still looking for a vehicle?
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${firstName} — we haven't forgotten about you. If you're still in the market for a vehicle,
      we'd love to help you get approved.
    </p>
    ${ctaButton(`${SITE_URL}`, "Reapply at NewWheels")}
    <p style="margin:16px 0 0;font-size:11px;color:${B.muted};">
      <a href="${unsubscribeUrl(leadId)}" style="color:${B.muted};text-decoration:underline;">Unsubscribe</a>
    </p>
  `;
  return systemEmailWrapper(body);
}

function nurtureEmailDay14(firstName: string, leadId: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      Tips to improve your approval odds
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${firstName} — here are a few things that can help strengthen your next application:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:${B.ink};line-height:1.8;">
      <li>Check your credit score for free at <a href="https://www.borrowell.com" style="color:${B.forest};">Borrowell</a></li>
      <li>Pay down any outstanding collections if possible</li>
      <li>Save toward a down payment — even $500 helps</li>
      <li>Gather proof of income (recent pay stubs or bank statements)</li>
    </ul>
    ${ctaButton(`${SITE_URL}`, "Reapply at NewWheels")}
    <p style="margin:16px 0 0;font-size:11px;color:${B.muted};">
      <a href="${unsubscribeUrl(leadId)}" style="color:${B.muted};text-decoration:underline;">Unsubscribe</a>
    </p>
  `;
  return systemEmailWrapper(body);
}

function nurtureEmailDay30(firstName: string, leadId: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
      One last check-in
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
      Hi ${firstName} — this is our final outreach. If you're still looking for vehicle financing
      in Calgary, we're here to help. Reapply any time — it only takes 2 minutes.
    </p>
    ${ctaButton(`${SITE_URL}`, "Reapply at NewWheels")}
    <p style="margin:16px 0 0;font-size:11px;color:${B.muted};">
      <a href="${unsubscribeUrl(leadId)}" style="color:${B.muted};text-decoration:underline;">Unsubscribe</a>
    </p>
  `;
  return systemEmailWrapper(body);
}

export async function processNurtureEmails(): Promise<{ sent: number; skipped: number }> {
  const supabase = getServerSupabase();
  if (!supabase) return { sent: 0, skipped: 0 };

  let sent = 0;
  let skipped = 0;

  for (const schedule of NURTURE_SCHEDULE) {
    const targetDate = new Date(Date.now() - schedule.days * 24 * 60 * 60 * 1000);
    const windowStart = new Date(targetDate.getTime() - 12 * 60 * 60 * 1000);
    const windowEnd = new Date(targetDate.getTime() + 12 * 60 * 60 * 1000);

    const { data: leads } = await supabase
      .from("leads")
      .select("id, first_name, email, status, nurture_unsubscribed")
      .eq("status", "expired")
      .gte("expired_at", windowStart.toISOString())
      .lt("expired_at", windowEnd.toISOString())
      .is("nurture_unsubscribed", null);

    for (const lead of leads ?? []) {
      // Check if already sent this step
      const { count } = await supabase
        .from("nurture_log")
        .select("id", { count: "exact", head: true })
        .eq("lead_id", lead.id as string)
        .eq("step", schedule.step);

      if ((count ?? 0) > 0) {
        skipped++;
        continue;
      }

      // Check if lead resubmitted (duplicate_of points to this lead)
      const { count: resubCount } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("duplicate_of", lead.id as string)
        .gt("created_at", (lead as Record<string, unknown>).expired_at as string);

      if ((resubCount ?? 0) > 0) {
        skipped++;
        continue;
      }

      let html: string;
      switch (schedule.step) {
        case "day_7":
          html = nurtureEmailDay7(lead.first_name as string, lead.id as string);
          break;
        case "day_14":
          html = nurtureEmailDay14(lead.first_name as string, lead.id as string);
          break;
        case "day_30":
          html = nurtureEmailDay30(lead.first_name as string, lead.id as string);
          break;
      }

      await sendEmail({
        to: lead.email as string,
        subject: schedule.subject,
        html,
        tags: [{ name: "type", value: `nurture_${schedule.step}` }],
      });

      await supabase.from("nurture_log").insert({
        lead_id: lead.id,
        step: schedule.step,
        sent_at: new Date().toISOString(),
      });

      sent++;
    }
  }

  return { sent, skipped };
}

// Second chance pathway — for leads scoring under 30
export async function processSecondChanceEmails(): Promise<{ sent: number }> {
  const supabase = getServerSupabase();
  if (!supabase) return { sent: 0 };

  let sent = 0;

  // Immediate email: leads that scored under 30 and haven't received second_chance_immediate
  const { data: immLeads } = await supabase
    .from("leads")
    .select("id, first_name, email, score, raw_payload")
    .lt("score", 30)
    .not("score", "is", null)
    .is("nurture_unsubscribed", null);

  for (const lead of immLeads ?? []) {
    const { count } = await supabase
      .from("nurture_log")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id as string)
      .eq("step", "second_chance_immediate");

    if ((count ?? 0) > 0) continue;

    const payload = (lead.raw_payload as Record<string, unknown>) ?? {};
    const breakdown = (payload.score_breakdown as Record<string, number>) ?? {};
    const lowestFactors = Object.entries(breakdown)
      .filter(([, v]) => v < 0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([k]) => k.replace(/^penalty_/, "").replace(/_/g, " "));

    const tips = lowestFactors.length > 0
      ? lowestFactors.map((f) => `<li>${f}</li>`).join("")
      : "<li>Build credit history</li><li>Save for a down payment</li><li>Stabilize income</li>";

    const body = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
        How to improve your approval odds
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
        Hi ${lead.first_name as string} — based on your application, here are the areas to focus on:
      </p>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:${B.ink};line-height:1.8;">
        ${tips}
      </ul>
      <p style="margin:0 0 16px;font-size:14px;color:${B.ink};line-height:1.6;">
        Check your credit for free at <a href="https://www.borrowell.com" style="color:${B.forest};">Borrowell</a>.
        When you're ready, reapply and we'll match you with the right partner.
      </p>
      ${ctaButton(`${SITE_URL}`, "Reapply at NewWheels")}
      <p style="margin:16px 0 0;font-size:11px;color:${B.muted};">
        <a href="${unsubscribeUrl(lead.id as string)}" style="color:${B.muted};text-decoration:underline;">Unsubscribe</a>
      </p>
    `;

    await sendEmail({
      to: lead.email as string,
      subject: "How to improve your approval odds",
      html: systemEmailWrapper(body),
      tags: [{ name: "type", value: "second_chance_immediate" }],
    });

    await supabase.from("nurture_log").insert({
      lead_id: lead.id,
      step: "second_chance_immediate",
      sent_at: new Date().toISOString(),
    });

    sent++;
  }

  // Day 30 email for second chance leads
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(thirtyDaysAgo.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(thirtyDaysAgo.getTime() + 12 * 60 * 60 * 1000);

  const { data: day30Leads } = await supabase
    .from("leads")
    .select("id, first_name, email, score")
    .lt("score", 30)
    .not("score", "is", null)
    .gte("qualified_at", windowStart.toISOString())
    .lt("qualified_at", windowEnd.toISOString())
    .is("nurture_unsubscribed", null);

  for (const lead of day30Leads ?? []) {
    const { count } = await supabase
      .from("nurture_log")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id as string)
      .eq("step", "second_chance_day_30");

    if ((count ?? 0) > 0) continue;

    const body = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${B.ink};">
        Ready to try again?
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:${B.ink};line-height:1.6;">
        Hi ${lead.first_name as string} — it's been about a month since your last application.
        If you've been working on the areas we mentioned, now is a great time to reapply.
      </p>
      ${ctaButton(`${SITE_URL}`, "Reapply at NewWheels")}
      <p style="margin:16px 0 0;font-size:11px;color:${B.muted};">
        <a href="${unsubscribeUrl(lead.id as string)}" style="color:${B.muted};text-decoration:underline;">Unsubscribe</a>
      </p>
    `;

    await sendEmail({
      to: lead.email as string,
      subject: "Ready to try again?",
      html: systemEmailWrapper(body),
      tags: [{ name: "type", value: "second_chance_day_30" }],
    });

    await supabase.from("nurture_log").insert({
      lead_id: lead.id,
      step: "second_chance_day_30",
      sent_at: new Date().toISOString(),
    });

    sent++;
  }

  return { sent };
}
