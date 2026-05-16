// POST /api/portal/auth/verify-otp — buyer side.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { OTP_MAX_ATTEMPTS, constantTimeEqual, hashOtp } from "@/lib/crm/auth/otp";
import { createSession } from "@/lib/crm/auth/session";
import { setSessionCookie } from "@/lib/crm/auth/cookies";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";
import type { BuyerKind } from "@/lib/crm/types";

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

  const { data: otp } = await supabase
    .from("auth_otps")
    .select("id, code_hash, expires_at, consumed_at, attempts, remember")
    .eq("email", email)
    .eq("audience", "portal")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });

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

  await supabase
    .from("auth_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id);

  const { data: buyer } = await supabase
    .from("buyer_accounts")
    .select("id, kind, status, contact_name")
    .eq("email", email)
    .maybeSingle();

  if (!buyer) {
    return NextResponse.json({ ok: false, error: "unknown_buyer" }, { status: 403 });
  }

  const session = await createSession({
    audience: "portal",
    subject: {
      kind: "buyer",
      buyer_account_id: buyer.id as string,
      buyer_kind: buyer.kind as BuyerKind,
    },
    remember: Boolean(otp.remember),
  });
  if (!session) {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 500 });
  }
  await setSessionCookie("portal", session.token, session.expires_at);

  // Welcome email after first successful auth (status is `active`).
  // We don't store first_logged_in_at on buyers — instead we send the welcome
  // on the verification approval and skip here. No-op.

  return NextResponse.json({
    ok: true,
    status: buyer.status,
  });
}
