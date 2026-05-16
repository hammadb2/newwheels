// AES-256-GCM helper for Social Insurance Numbers.
//
// We deliberately keep this small and dependency-free (Node's built-in
// `crypto` module). Ciphertext format on disk:
//
//     base64(iv) . base64(authTag) . base64(ciphertext)
//
// `.` separator (URL-safe, never appears in base64).
//
// Encryption key
// --------------
// `SIN_ENCRYPTION_KEY` must be a 32-byte key encoded as base64 OR hex. We
// detect the encoding automatically. Generate one with:
//
//     openssl rand -base64 32
//
// Rotation strategy is out of scope for PR1 — when we rotate, we'll decrypt
// every existing SIN with the old key, re-encrypt with the new key, and
// swap the env var. The format below is forward-compatible if we ever need
// a `v2.` prefix.

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;       // 96-bit IV is the GCM recommendation
const KEY_LENGTH_BYTES = 32;      // AES-256
const SEPARATOR = ".";

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.SIN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "SIN_ENCRYPTION_KEY not set. Generate one with `openssl rand -base64 32` " +
        "and add it to .env.local + Vercel project env vars."
    );
  }
  const trimmed = raw.trim();
  // Try base64 first, then hex. We accept either to be friendly to the env var
  // syntax that doesn't tolerate padding `=`.
  let buf: Buffer;
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length === KEY_LENGTH_BYTES * 2) {
    buf = Buffer.from(trimmed, "hex");
  } else {
    buf = Buffer.from(trimmed, "base64");
  }
  if (buf.length !== KEY_LENGTH_BYTES) {
    throw new Error(
      `SIN_ENCRYPTION_KEY must decode to exactly ${KEY_LENGTH_BYTES} bytes ` +
        `(got ${buf.length}). Use \`openssl rand -base64 32\`.`
    );
  }
  cachedKey = buf;
  return buf;
}

export function encryptSin(plaintext: string): string {
  if (!plaintext) throw new Error("encryptSin: empty plaintext");
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(SEPARATOR);
}

export function decryptSin(ciphertext: string): string {
  if (!ciphertext) throw new Error("decryptSin: empty ciphertext");
  const parts = ciphertext.split(SEPARATOR);
  if (parts.length !== 3) throw new Error("decryptSin: malformed ciphertext (expected iv.tag.ct)");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const key = loadKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext.toString("utf8");
}

/**
 * Returns a masked display value for a SIN, e.g. `*** *** 789`. We never
 * render the raw SIN in any UI — it must always be revealed through an
 * explicit, audited action.
 */
export function maskSin(sin: string): string {
  const digits = sin.replace(/\D+/g, "");
  if (digits.length < 4) return "*** *** ***";
  const last3 = digits.slice(-3);
  return `*** *** ${last3}`;
}

/**
 * Normalises a Canadian SIN to exactly 9 digits with no separators. Throws
 * if the input doesn't have 9 digits. Does NOT validate the Luhn check —
 * we leave that to the calling layer if needed.
 */
export function normaliseSin(input: string): string {
  const digits = input.replace(/\D+/g, "");
  if (digits.length !== 9) {
    throw new Error("SIN must contain exactly 9 digits");
  }
  return digits;
}
