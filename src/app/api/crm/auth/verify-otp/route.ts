// POST /api/crm/auth/verify-otp
//
// Body: { email, code }. Consumes the latest unconsumed OTP for the email
// audience=crm, creates a session row, sets the session cookie. The first
// successful login also triggers a welcome email and records first_logged_in_at.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { OTP_MAX_ATTEMPTS, constantTimeEqual, hashOtp } from "@/lib/crm/auth/otp";
import { createSession } from "@/lib/crm/auth/session";
import { setSessionCookie } from "@/lib/crm/auth/cookies";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";
import type { TeamRole } from "@/lib/crm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const code = parsed.data.code;
  const expected_hash = hashOtp(code, email);

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Most recent OTP wins. We re-look-up the latest one for this email +
  // audience, then check expiry/consumption manually. We also bump attempts.
  const { data: otp } = await supabase
    .from("auth_otps")
    .select("id, code_hash, expires_at, consumed_at, attempts")
    .eq("email", email)
    .eq("audience", "crm")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
  }

  if (new Date(otp.expires_at as string).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "expired" }, { status: 400 });
  }

  if ((otp.attempts as number) >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: "too_many_attempts" }, { status: 429 });
  }

  if (!constantTimeEqual(expected_hash, otp.code_hash as string)) {
    await supabase
      .from("auth_otps")
      .update({ attempts: (otp.attempts as number) + 1 })
      .eq("id", otp.id);
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
  }

  // Burn the OTP.
  await supabase
    .from("auth_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id);

  // Locate team member.
  const { data: tm } = await supabase
    .from("team_members")
    .select("id, role, display_name, active, first_logged_in_at")
    .eq("email", email)
    .maybeSingle();

  if (!tm || !tm.active) {
    return NextResponse.json({ ok: false, error: "unknown_user" }, { status: 403 });
  }

  const session = await createSession({
    audience: "crm",
    subject: { kind: "team", team_member_id: tm.id as string, role: tm.role as TeamRole },
  });
  if (!session) {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 500 });
  }
  await setSessionCookie("crm", session.token, session.expires_at);

  if (!tm.first_logged_in_at) {
    await supabase
      .from("team_members")
      .update({ first_logged_in_at: new Date().toISOString() })
      .eq("id", tm.id);
    void sendEmail({
      to: email,
      subject: `Welcome to the ${"NewWheels"} CRM`,
      html: welcomeEmail({
        displayName: (tm.display_name as string) || "there",
        audience: "crm",
        ctaUrl: absoluteUrl("/crm/dashboard"),
      }),
      tags: [{ name: "type", value: "welcome_crm" }],
    });
  }

  return NextResponse.json({ ok: true });
}

function absoluteUrl(path: string): string {
  const base = process.env.NW_CRM_URL || "https://crm.newwheels.ca";
  return base.replace(/\/$/, "") + path;
}
