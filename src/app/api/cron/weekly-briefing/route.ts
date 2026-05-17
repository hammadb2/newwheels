// GET /api/cron/weekly-briefing — Monday morning CEO briefing cron.

import { NextResponse } from "next/server";
import { generateWeeklyBriefing } from "@/lib/crm/ai-features";
import { sendEmail } from "@/lib/email/resend";
import { systemEmailWrapper } from "@/lib/email/wrapper";
import { getServerSupabase } from "@/lib/crm/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Only run on Mondays
  if (new Date().getDay() !== 1) {
    return NextResponse.json({ ok: true, skipped: true, reason: "not_monday" });
  }

  const briefing = await generateWeeklyBriefing();
  if (!briefing) {
    return NextResponse.json({ ok: false, error: "ai_not_configured" });
  }

  const htmlBody = briefing
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;color:#0A2818;line-height:1.6;">${p.trim()}</p>`)
    .join("");

  const html = systemEmailWrapper(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0A2818;">
      Weekly CEO Briefing
    </h1>
    <p style="margin:0 0 20px;font-size:12px;color:#6B7280;">
      ${new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </p>
    ${htmlBody}
  `);

  // Send to CEO
  const supabase = getServerSupabase();
  if (supabase) {
    const { data: ceo } = await supabase
      .from("team_members")
      .select("email")
      .eq("role", "ceo")
      .eq("active", true)
      .limit(1)
      .single();

    if (ceo?.email) {
      await sendEmail({
        to: ceo.email as string,
        subject: `NewWheels Weekly Briefing — ${new Date().toLocaleDateString("en-CA")}`,
        html,
        tags: [{ name: "type", value: "weekly_briefing" }],
      });
    }
  }

  return NextResponse.json({ ok: true });
}
