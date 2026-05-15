// Lazy Google auth helper used by the Search Console, GA4, and GBP modules.
//
// We accept the service-account credentials in two forms:
//   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the full JSON, pasted as a single env
//     value. This is the easiest path on Vercel.
//   - `GOOGLE_APPLICATION_CREDENTIALS`: path to a JSON file on disk. This
//     is the standard Google default and is also supported.
//
// The auth client is cached per scope set since each Google API requires a
// different scope.

import { google } from "googleapis";
import type { JWT } from "google-auth-library";

type Status =
  | { configured: true; creds: { email: string; key: string } }
  | { configured: false; reason: "missing-credentials" };

let cached: Status | null = null;

export function googleAuthStatus(): Status {
  if (cached) return cached;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        cached = {
          configured: true,
          creds: { email: parsed.client_email, key: parsed.private_key },
        };
        return cached;
      }
    } catch {
      // fall through
    }
  }
  cached = { configured: false, reason: "missing-credentials" };
  return cached;
}

const cachedClients = new Map<string, JWT>();

export function googleJwt(scopes: string[]): JWT | null {
  const status = googleAuthStatus();
  if (!status.configured) return null;
  const key = scopes.slice().sort().join("|");
  const existing = cachedClients.get(key);
  if (existing) return existing;
  const client = new google.auth.JWT({
    email: status.creds.email,
    key: status.creds.key,
    scopes,
  });
  cachedClients.set(key, client);
  return client;
}
