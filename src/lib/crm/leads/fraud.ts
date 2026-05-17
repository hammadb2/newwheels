// Fraud detection module. Runs during lead intake to flag suspicious
// submissions before they enter the qualification pipeline.
//
// Checks:
// 1. Rapid-fire submissions — same phone or email within a short window
// 2. High-volume phone — same normalized phone across many leads (any time)
// 3. High-volume email — same email across many leads (any time)
// 4. Disposable email domain
// 5. Phone/email mismatch with an existing lead (same phone, different email
//    or vice-versa on a recent lead)

import type { SupabaseClient } from "@supabase/supabase-js";

export type FraudCheckResult = {
  fraud_risk: boolean;
  fraud_flags: string[];
};

const RAPID_WINDOW_MINUTES = 10;
const RAPID_THRESHOLD = 2;
const HIGH_VOLUME_THRESHOLD = 4;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "trashmail.com",
  "10minutemail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "mailnesia.com",
  "maildrop.cc",
]);

const DIGITS_ONLY = /[^\d]/g;
function normalizePhone(phone: string): string {
  const digits = phone.replace(DIGITS_ONLY, "");
  if (digits.startsWith("1") && digits.length === 11) return digits.slice(1);
  return digits;
}

export async function runFraudChecks(
  supabase: SupabaseClient,
  email: string,
  phone: string,
): Promise<FraudCheckResult> {
  const flags: string[] = [];
  const normEmail = email.trim().toLowerCase();
  const normPhone = normalizePhone(phone);

  // 1. Disposable email domain
  const domain = normEmail.split("@")[1];
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    flags.push(`Disposable email domain: ${domain}`);
  }

  // 2. Rapid-fire submissions (same phone or email within RAPID_WINDOW_MINUTES)
  const rapidCutoff = new Date(
    Date.now() - RAPID_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { count: rapidPhone } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", rapidCutoff);

  if ((rapidPhone ?? 0) >= RAPID_THRESHOLD) {
    flags.push(`Rapid-fire: ${rapidPhone} submissions with same phone in last ${RAPID_WINDOW_MINUTES} min`);
  }

  const { count: rapidEmail } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("email", normEmail)
    .gte("created_at", rapidCutoff);

  if ((rapidEmail ?? 0) >= RAPID_THRESHOLD) {
    flags.push(`Rapid-fire: ${rapidEmail} submissions with same email in last ${RAPID_WINDOW_MINUTES} min`);
  }

  // 3. High-volume phone — same normalized phone across many leads (all time)
  const { count: totalPhone } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone);

  if ((totalPhone ?? 0) >= HIGH_VOLUME_THRESHOLD) {
    flags.push(`High volume: ${totalPhone} total leads with same phone number`);
  }

  // 4. High-volume email
  const { count: totalEmail } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("email", normEmail);

  if ((totalEmail ?? 0) >= HIGH_VOLUME_THRESHOLD) {
    flags.push(`High volume: ${totalEmail} total leads with same email`);
  }

  // 5. Phone/email mismatch — recent lead has same phone but different email
  //    (or same email but different phone). Suggests identity swapping.
  const recentCutoff = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: phoneMatches } = await supabase
    .from("leads")
    .select("email")
    .eq("phone", phone)
    .gte("created_at", recentCutoff)
    .neq("email", normEmail)
    .limit(3);

  if (phoneMatches && phoneMatches.length > 0) {
    const otherEmails = phoneMatches.map((r) => r.email as string).join(", ");
    flags.push(`Phone used with different email(s): ${otherEmails}`);
  }

  const { data: emailMatches } = await supabase
    .from("leads")
    .select("phone")
    .eq("email", normEmail)
    .gte("created_at", recentCutoff)
    .neq("phone", phone)
    .limit(3);

  if (emailMatches && emailMatches.length > 0) {
    const otherPhones = emailMatches.map((r) => r.phone as string).join(", ");
    flags.push(`Email used with different phone(s): ${otherPhones}`);
  }

  return {
    fraud_risk: flags.length > 0,
    fraud_flags: flags,
  };
}
