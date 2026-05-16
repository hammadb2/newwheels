// GET /api/cron/expire-leads
// Marks leads as expired when they pass their `expires_at` timestamp.
// Sends a notification to the lead's qualifier + platform_ops.

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { sendEmail } from "@/lib/email/resend";
import { leadExpiredEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const now = new Date().toISOString();
  const { data: toExpire } = await supabase
    .from("leads")
    .select("id, first_name, last_name, tier, current_price_cents, assigned_qualifier_id")
    .eq("status", "available")
    .lt("expires_at", now);
  if (!toExpire || toExpire.length === 0) return NextResponse.json({ ok: true, expired: 0 });

  const ids = toExpire.map((l) => l.id as string);
  await supabase.from("leads").update({ status: "expired", expired_at: now }).in("id", ids);
  await supabase.from("lead_audit_log").insert(
    ids.map((id) => ({ lead_id: id, event: "expired", detail: {} as Record<string, unknown> })),
  );

  // Notify qualifier(s) + platform_ops + CEO. One email per lead per recipient
  // so each notification carries the branded template + lead context.
  const qualifierIds = Array.from(new Set(toExpire.map((l) => l.assigned_qualifier_id).filter(Boolean) as string[]));
  const { data: opsMembers } = await supabase
    .from("team_members")
    .select("email, display_name, role")
    .or("role.eq.platform_ops,role.eq.ceo")
    .eq("active", true);
  const { data: qualifiers } = qualifierIds.length > 0
    ? await supabase.from("team_members").select("id, email, display_name").in("id", qualifierIds)
    : { data: [] };

  const crmUrl = (process.env.NW_CRM_URL || "https://crm.newwheels.ca").replace(/\/$/, "");
  const recipients = new Map<string, string>();
  for (const q of qualifiers ?? []) recipients.set(q.email as string, (q.display_name as string) ?? "there");
  for (const o of opsMembers ?? []) recipients.set(o.email as string, (o.display_name as string) ?? "there");

  for (const lead of toExpire) {
    for (const [email, name] of recipients) {
      void sendEmail({
        to: email,
        subject: `Lead expired unsold: ${lead.first_name}`,
        html: leadExpiredEmail({
          recipientName: name,
          leadFirstName: lead.first_name as string,
          tier: lead.tier as string,
          finalPrice: priceCentsToDisplay(lead.current_price_cents as number),
          leadUrl: `${crmUrl}/crm/leads/${lead.id}`,
        }),
        tags: [{ name: "type", value: "lead_expired" }],
      });
    }
  }

  return NextResponse.json({ ok: true, expired: ids.length });
}
