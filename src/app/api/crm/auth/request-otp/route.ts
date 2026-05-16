// POST /api/crm/auth/request-otp
//
// Body: { email: string }
// Generates a 6-digit code, hashes it, stores it, and sends the code via
// Resend. Caller (the login UI) gets a generic 200 response either way so we
// don't expose whether a given email exists in the team_members table.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { OTP_TTL_MS, generateOtpCode, hashOtp } from "@/lib/crm/auth/otp";
import { otpEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = getServerSupabase();
  if (!supabase) {
    // Without a database we can't store OTPs. Surface a clear server error so
    // dev knows to configure Supabase, but never echo it from production.
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Only known team members may request a CRM OTP. Returning ok=true even when
  // unknown is intentional — see comment at top of file.
  const { data: tm } = await supabase
    .from("team_members")
    .select("id, active")
    .eq("email", email)
    .maybeSingle();

  if (!tm || !tm.active) {
    return NextResponse.json({ ok: true });
  }

  const code = generateOtpCode();
  const code_hash = hashOtp(code, email);
  const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error: insertErr } = await supabase.from("auth_otps").insert({
    email,
    code_hash,
    audience: "crm",
    expires_at,
    attempts: 0,
  });
  if (insertErr) {
    console.error("auth_otps insert failed", insertErr);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const result = await sendEmail({
    to: email,
    subject: "Your NewWheels login code",
    html: otpEmail({ code, audience: "crm" }),
    text: `Your NewWheels CRM login code: ${code}\nThis code expires in 10 minutes.`,
    tags: [{ name: "type", value: "otp_crm" }],
  });

  if (!("skipped" in result) || (!result.skipped && !result.ok)) {
    console.warn("OTP send failed", result);
  }

  return NextResponse.json({ ok: true });
}
