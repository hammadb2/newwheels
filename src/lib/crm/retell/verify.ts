// Retell webhook signature verification.
//
// Retell signs webhook payloads with HMAC-SHA256 using the webhook secret.
// The signature is sent in the `x-retell-signature` header as a hex string.

import { createHmac } from "crypto";
import { retellEnv } from "./config";

export function verifyRetellSignature(
  rawBody: string | Buffer,
  signature: string | null,
): boolean {
  const { webhookSecret } = retellEnv();

  // If no webhook secret is configured, skip verification (dev mode).
  if (!webhookSecret) return true;

  if (!signature) return false;

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
  const expected = createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks.
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
