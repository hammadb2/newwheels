// POST /api/portal/auth/request-otp
//
// Mirrors /api/crm/auth/request-otp but for buyer accounts. We always return
// 200 to avoid disclosing whether a buyer exists.

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
  remember: z.boolean().optional(),
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
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (!buyer) {
    return NextResponse.json({ ok: true });
  }

  const code = generateOtpCode();
  const code_hash = hashOtp(code, email);
  const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error: insertErr } = await supabase.from("auth_otps").insert({
    email,
    code_hash,
    audience: "portal",
    expires_at,
    attempts: 0,
    remember: Boolean(parsed.data.remember),
  });
  if (insertErr) {
    console.error("auth_otps insert failed", insertErr);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const result = await sendEmail({
    to: email,
    subject: "Your NewWheels login code",
    html: otpEmail({ code, audience: "portal" }),
    text: `Your NewWheels portal login code: ${code}\nThis code expires in 10 minutes.`,
    tags: [{ name: "type", value: "otp_portal" }],
  });

  if (!("skipped" in result) || (!result.skipped && !result.ok)) {
    console.warn("Portal OTP send failed", result);
  }

  return NextResponse.json({ ok: true });
}
