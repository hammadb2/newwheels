// Fraud detection helpers.
//
// - ZeroBounce email validation (graceful no-op when API key missing)
// - Canadian mobile format validation
// - Device fingerprint velocity check (3+ submissions in 7 days)

import { getServerSupabase } from "./supabase/server";

export type FraudCheckResult = {
  fraud_risk: boolean;
  flags: string[];
};

// Canadian phone: +1 followed by 10 digits, area code 2xx-9xx
const CA_MOBILE_RE = /^\+?1?[2-9]\d{2}[2-9]\d{6}$/;

export function isValidCanadianMobile(phone: string): boolean {
  const digits = phone.replace(/[\s\-().+]/g, "");
  return CA_MOBILE_RE.test(digits);
}

export async function validateEmailZeroBounce(email: string): Promise<{
  valid: boolean;
  status: string;
}> {
  const apiKey = process.env.ZEROBOUNCE_API_KEY;
  if (!apiKey) return { valid: true, status: "skipped" };

  try {
    const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { valid: true, status: "api_error" };
    const data = (await res.json()) as { status?: string };
    const status = data.status ?? "unknown";
    const invalid = status === "invalid" || status === "abuse" || status === "spamtrap";
    return { valid: !invalid, status };
  } catch {
    return { valid: true, status: "timeout" };
  }
}

export async function checkDeviceFingerprint(
  fingerprint: string,
): Promise<{ flagged: boolean; count: number }> {
  if (!fingerprint) return { flagged: false, count: 0 };
  const supabase = getServerSupabase();
  if (!supabase) return { flagged: false, count: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("device_fingerprint", fingerprint)
    .gte("created_at", sevenDaysAgo);

  const n = count ?? 0;
  return { flagged: n >= 3, count: n };
}

export async function runFraudChecks(opts: {
  email: string;
  phone: string;
  device_fingerprint?: string;
}): Promise<FraudCheckResult> {
  const flags: string[] = [];

  if (!isValidCanadianMobile(opts.phone)) {
    flags.push("invalid_phone_format");
  }

  const emailResult = await validateEmailZeroBounce(opts.email);
  if (!emailResult.valid) {
    flags.push(`email_${emailResult.status}`);
  }

  if (opts.device_fingerprint) {
    const fp = await checkDeviceFingerprint(opts.device_fingerprint);
    if (fp.flagged) {
      flags.push(`device_velocity_${fp.count}`);
    }
  }

  return { fraud_risk: flags.length > 0, flags };
}
