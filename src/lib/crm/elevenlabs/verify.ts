// ElevenLabs webhook signature verification.
//
// Two verification modes:
// 1. Post-call webhooks: HMAC signature via the ElevenLabs SDK's
//    webhooks.constructEvent() method (elevenlabs-signature header).
// 2. Webhook tool calls during conversation: shared secret in the
//    Authorization header (Bearer token configured in ElevenLabs tool
//    definition).

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { elevenlabsEnv } from "./config";

const client = new ElevenLabsClient();

export async function verifyElevenLabsWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const { webhookSecret } = elevenlabsEnv();

  if (!webhookSecret) return true;
  if (!signature) return false;

  try {
    await client.webhooks.constructEvent(rawBody, signature, webhookSecret);
    return true;
  } catch {
    return false;
  }
}

export function verifyToolSecret(req: Request): boolean {
  const { toolSecret } = elevenlabsEnv();

  if (!toolSecret) return true;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === toolSecret;
}
