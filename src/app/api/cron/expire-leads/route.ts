// GET /api/cron/expire-leads
// Marks leads as expired when they pass their `expires_at` timestamp.
// Sends a notification to the lead's qualifier + platform_ops.

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { systemEmailWrapper } from "@/lib/email/wrapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const now = new Date().toISOString();
  const { data: toExpire } = await supabase
    .from("leads")
    .select("id, first_name, last_name, assigned_qualifier_id")
    .eq("status", "available")
    .lt("expires_at", now);
  if (!toExpire || toExpire.length === 0) return NextResponse.json({ ok: true, expired: 0 });

  const ids = toExpire.map((l) => l.id as string);
  await supabase.from("leads").update({ status: "expired", expired_at: now }).in("id", ids);
  await supabase.from("lead_audit_log").insert(
    ids.map((id) => ({ lead_id: id, event: "expired", detail: {} as Record<string, unknown> })),
  );

  // Notify qualifier(s) + platform_ops.
  const qualifierIds = Array.from(new Set(toExpire.map((l) => l.assigned_qualifier_id).filter(Boolean) as string[]));
  const { data: opsMembers } = await supabase
    .from("team_members")
    .select("email, role")
    .or("role.eq.platform_ops,role.eq.ceo")
    .eq("active", true);
  const { data: qualifiers } = qualifierIds.length > 0
    ? await supabase.from("team_members").select("id, email").in("id", qualifierIds)
    : { data: [] };

  const recipientEmails = Array.from(new Set([
    ...(qualifiers ?? []).map((q) => q.email as string),
    ...(opsMembers ?? []).map((o) => o.email as string),
  ]));
  if (recipientEmails.length > 0) {
    const body = `<p>${toExpire.length} lead${toExpire.length === 1 ? "" : "s"} expired without selling. CEO can re-list any of them from the pipeline view.</p>
      <ul>${toExpire.map((l) => `<li>${escapeHtml(`${l.first_name} ${l.last_name}`)}</li>`).join("")}</ul>`;
    void sendEmail({
      to: recipientEmails,
      subject: `${toExpire.length} lead${toExpire.length === 1 ? "" : "s"} expired unsold`,
      html: systemEmailWrapper(body),
      tags: [{ name: "type", value: "lead_expired" }],
    });
  }

  return NextResponse.json({ ok: true, expired: ids.length });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
