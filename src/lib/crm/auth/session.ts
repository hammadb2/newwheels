// Session token helpers.
//
// A session token is `sessionId.payloadB64.sig` where:
//   - sessionId is the UUID of the row in nw.sessions
//   - payloadB64 is base64url-encoded JSON of { aud, sub, exp, role? }
//   - sig is an HMAC-SHA-256 of `sessionId.payloadB64` with CRM_SESSION_SECRET
//
// We store sessions server-side (nw.sessions). The cookie is opaque to the
// client and revocable by deleting the row. Cookies are HttpOnly+Secure+
// SameSite=Lax with a domain set to `.newwheels.ca` in production so the
// session is shared between crm.* and portal.* if needed (currently each
// portal uses its own cookie name so this is mostly belt-and-braces).

import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import { getSessionSecret } from "./secrets";
import type { BuyerKind, SessionSubject, TeamRole } from "../types";

export const SESSION_COOKIE = {
  crm: "nw_crm_session",
  portal: "nw_portal_session",
} as const;

export type Audience = "crm" | "portal";

export type SessionPayload = {
  aud: Audience;
  sid: string;
  // For team members
  team_id?: string;
  role?: TeamRole;
  // For buyers
  buyer_id?: string;
  buyer_kind?: BuyerKind;
  // Expiry (unix seconds)
  exp: number;
};

export const CRM_TTL_HOURS = 8;
export const PORTAL_TTL_HOURS = 24 * 30; // 30 days when remember=true
export const PORTAL_DEFAULT_TTL_HOURS = 24 * 7;

export function ttlForAudience(audience: Audience, remember: boolean): number {
  if (audience === "crm") return CRM_TTL_HOURS * 60 * 60 * 1000;
  return (remember ? PORTAL_TTL_HOURS : PORTAL_DEFAULT_TTL_HOURS) * 60 * 60 * 1000;
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signSessionPayload(payload: SessionPayload): string {
  const secret = getSessionSecret();
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(json);
  const sig = createHmac("sha256", secret).update(`${payload.sid}.${payloadB64}`).digest();
  return `${payload.sid}.${payloadB64}.${b64urlEncode(sig)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [sid, payloadB64, sigB64] = parts;
  try {
    const secret = getSessionSecret();
    const expected = createHmac("sha256", secret).update(`${sid}.${payloadB64}`).digest();
    const given = b64urlDecode(sigB64);
    if (expected.length !== given.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
    if (diff !== 0) return null;
    const payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8")) as SessionPayload;
    if (!payload || payload.sid !== sid) return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Persist a new session row and return the signed token to set as a cookie.
 * Caller is responsible for setting the cookie via `setSessionCookie`.
 */
export async function createSession(opts: {
  audience: Audience;
  subject:
    | { kind: "team"; team_member_id: string; role: TeamRole }
    | { kind: "buyer"; buyer_account_id: string; buyer_kind: BuyerKind };
  remember?: boolean;
  user_agent?: string | null;
  ip_address?: string | null;
}): Promise<{ token: string; expires_at: Date } | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const ttlMs = ttlForAudience(opts.audience, Boolean(opts.remember));
  const expires_at = new Date(Date.now() + ttlMs);

  const row = {
    audience: opts.audience,
    team_member_id: opts.subject.kind === "team" ? opts.subject.team_member_id : null,
    buyer_account_id: opts.subject.kind === "buyer" ? opts.subject.buyer_account_id : null,
    user_agent: opts.user_agent ?? null,
    ip_address: opts.ip_address ?? null,
    remember: Boolean(opts.remember),
    expires_at: expires_at.toISOString(),
  };

  const { data, error } = await supabase
    .from("sessions")
    .insert(row)
    .select("id")
    .single();

  if (error || !data) {
    console.error("createSession failed", error);
    return null;
  }

  const payload: SessionPayload = {
    aud: opts.audience,
    sid: data.id as string,
    exp: Math.floor(expires_at.getTime() / 1000),
    ...(opts.subject.kind === "team"
      ? { team_id: opts.subject.team_member_id, role: opts.subject.role }
      : { buyer_id: opts.subject.buyer_account_id, buyer_kind: opts.subject.buyer_kind }),
  };

  return { token: signSessionPayload(payload), expires_at };
}

/**
 * Look up the live session by parsing the cookie and re-reading the
 * sessions table. Returns null if the cookie is missing, malformed,
 * expired, or revoked.
 */
export async function readSession(audience: Audience): Promise<{
  payload: SessionPayload;
  subject: SessionSubject;
} | null> {
  const jar = await cookies();
  const cookieName = SESSION_COOKIE[audience];
  const raw = jar.get(cookieName)?.value;
  if (!raw) return null;
  const payload = verifySessionToken(raw);
  if (!payload || payload.aud !== audience) return null;
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("sessions")
    .select("id, expires_at, team_member_id, buyer_account_id, audience")
    .eq("id", payload.sid)
    .single();
  if (error || !data) return null;
  if (data.audience !== audience) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) return null;

  // Update last_seen_at fire-and-forget; not awaited.
  void supabase
    .from("sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", payload.sid);

  let subject: SessionSubject | null = null;
  if (data.team_member_id) {
    const { data: tm } = await supabase
      .from("team_members")
      .select("role, active")
      .eq("id", data.team_member_id)
      .single();
    if (!tm || !tm.active) return null;
    subject = {
      kind: "team",
      team_member_id: data.team_member_id as string,
      role: tm.role as TeamRole,
    };
  } else if (data.buyer_account_id) {
    const { data: ba } = await supabase
      .from("buyer_accounts")
      .select("kind, status")
      .eq("id", data.buyer_account_id)
      .single();
    if (!ba) return null;
    subject = {
      kind: "buyer",
      buyer_account_id: data.buyer_account_id as string,
      buyer_kind: ba.kind as BuyerKind,
    };
  }

  if (!subject) return null;
  return { payload, subject };
}

export async function revokeSession(audience: Audience): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE[audience])?.value;
  if (!raw) return;
  const payload = verifySessionToken(raw);
  if (!payload) return;
  const supabase = getServerSupabase();
  if (!supabase) return;
  await supabase.from("sessions").delete().eq("id", payload.sid);
}

export function newSessionId(): string {
  return randomBytes(16).toString("hex");
}
