// GET /api/cron/re-engagement
// Emails active buyers who haven't purchased in 14 days. Runs daily.

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { systemEmailWrapper } from "@/lib/email/wrapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_DAYS = 14;
const RE_ENGAGEMENT_COOLDOWN_DAYS = 30; // don't pester more than once a month

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const cutoffPurchase = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const cutoffNotice = new Date(Date.now() - RE_ENGAGEMENT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: buyers } = await supabase
    .from("buyer_accounts")
    .select("id, email, contact_name, business_name, last_purchase_at, last_re_engagement_at")
    .eq("status", "active");

  let sent = 0;
  for (const b of buyers ?? []) {
    const lastPurchase = b.last_purchase_at ? new Date(b.last_purchase_at as string).toISOString() : null;
    const lastNotice = b.last_re_engagement_at ? new Date(b.last_re_engagement_at as string).toISOString() : null;
    if (lastPurchase && lastPurchase > cutoffPurchase) continue;
    if (lastNotice && lastNotice > cutoffNotice) continue;

    const portalUrl = (process.env.NW_PORTAL_URL || "https://portal.newwheels.ca").replace(/\/$/, "");
    const name = (b.business_name as string) || (b.contact_name as string) || "there";
    void sendEmail({
      to: b.email as string,
      subject: "New Calgary leads available this week",
      html: systemEmailWrapper(`<p>Hi ${escapeHtml(name)},</p>
        <p>Fresh subprime auto leads are live on the marketplace. Browse this week's batch and pick the ones that match your sweet spot.</p>
        <p><a href="${portalUrl}/portal/marketplace">Open marketplace →</a></p>`),
      tags: [{ name: "type", value: "re_engagement" }],
    });
    await supabase
      .from("buyer_accounts")
      .update({ last_re_engagement_at: new Date().toISOString() })
      .eq("id", b.id);
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
