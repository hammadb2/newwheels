// OTP generation, hashing, and rate limiting.
//
// We never store the raw 6-digit code; we store a SHA-256 hash of
// `${code}.${email}.${OTP_SECRET}` and a created/expires timestamp. To
// verify we recompute the hash and compare in constant time.

import { createHash, randomInt } from "node:crypto";
import { getOtpSecret } from "./secrets";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;

export function generateOtpCode(): string {
  // 6-digit numeric code. Use crypto.randomInt for unbiased sampling.
  const n = randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

export function hashOtp(code: string, email: string): string {
  const secret = getOtpSecret();
  return createHash("sha256")
    .update(`${code}.${email.trim().toLowerCase()}.${secret}`)
    .digest("hex");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
