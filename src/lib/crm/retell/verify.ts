// Retell webhook signature verification.
//
// Uses the official retell-sdk Retell.verify() method. The SDK expects the
// raw body string (not JSON.stringify(req.body)) and the **webhook secret**
// (not the API key) to produce a valid HMAC-SHA256 comparison.

import Retell from "retell-sdk";
import { retellEnv } from "./config";

export async function verifyRetellSignature(
  rawBody: string | Buffer,
  signature: string | null,
): Promise<boolean> {
  const { apiKey, webhookSecret } = retellEnv();

  // The webhook secret is what Retell uses to sign webhook payloads.
  // Fall back to apiKey for backwards compatibility if webhookSecret is not set.
  const verifyKey = webhookSecret || apiKey;

  // If no key is configured, skip verification (dev mode).
  if (!verifyKey) return true;

  if (!signature) return false;

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");

  try {
    return await Retell.verify(body, verifyKey, signature);
  } catch {
    return false;
  }
}
