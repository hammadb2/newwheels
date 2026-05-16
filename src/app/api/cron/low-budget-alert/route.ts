// GET /api/cron/low-budget-alert
// Emails dealer master account when any sub-account hits 20% remaining budget.

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/crm/cron";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { priceCentsToDisplay } from "@/lib/crm/pricing";
import { sendEmail } from "@/lib/email/resend";
import { lowBudgetAlertEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THRESHOLD = 0.2;

export async function GET(req: Request) {
  if (!authorizeCron(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: subs } = await supabase
    .from("buyer_sub_accounts")
    .select("id, name, master_buyer_id, monthly_budget_cents, current_month_spent_cents, last_low_budget_alert_at, master:master_buyer_id(email, business_name)")
    .gt("monthly_budget_cents", 0);

  let alerts = 0;
  for (const s of subs ?? []) {
    const allocated = Number(s.monthly_budget_cents) || 0;
    const spent = Number(s.current_month_spent_cents) || 0;
    const remaining = allocated - spent;
    if (allocated <= 0) continue;
    if (remaining / allocated > THRESHOLD) continue;
    // Only one alert per month.
    if (s.last_low_budget_alert_at && sameMonth(new Date(s.last_low_budget_alert_at as string), new Date())) continue;

    const master = (Array.isArray(s.master) ? s.master[0] : s.master) as { email?: string; business_name?: string } | null;
    if (!master?.email) continue;

    const portalUrl = (process.env.NW_PORTAL_URL || "https://portal.newwheels.ca").replace(/\/$/, "");
    void sendEmail({
      to: master.email as string,
      subject: `Low budget alert — ${s.name}`,
      html: lowBudgetAlertEmail({
        masterName: master.business_name || "team",
        subName: s.name as string,
        remaining: priceCentsToDisplay(remaining),
        allocated: priceCentsToDisplay(allocated),
        portalUrl: `${portalUrl}/portal/account/sub-accounts`,
      }),
      tags: [{ name: "type", value: "low_budget_alert" }],
    });
    await supabase
      .from("buyer_sub_accounts")
      .update({ last_low_budget_alert_at: new Date().toISOString() })
      .eq("id", s.id);
    alerts += 1;
  }

  return NextResponse.json({ ok: true, alerts });
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}
