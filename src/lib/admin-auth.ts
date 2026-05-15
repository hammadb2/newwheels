// Shared auth gate for the internal `/admin/*` namespace.
//
// Why this exists: the admin pages (content pipeline, SEO dashboard, GBP
// integration) need to be reachable from a browser but never indexed and
// never accessible to anyone but the operator. Rather than introducing a
// full auth provider, we gate on a single `ADMIN_TOKEN` env value compared
// against either a cookie (`admin_token`) or the `x-admin-token` header.
//
// Missing/wrong token => `requireAdmin()` triggers Next.js `notFound()`,
// which renders a normal 404. This is intentional: it leaks no signal that
// an admin namespace exists, so there's nothing to brute force.
//
// Set the token via env:
//   ADMIN_TOKEN=<long-random-string>
// Sign in by hitting `/admin/login?token=<value>` once — the route sets the
// cookie and redirects to `/admin`.
//
// Robots.ts already disallows `/admin/`. Every admin page is also marked
// `dynamic = "force-dynamic"` and exports `metadata.robots.index = false`.

import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_HEADER = "x-admin-token";

export function getAdminToken(): string | null {
  const raw = process.env.ADMIN_TOKEN;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Returns true if the request looks like an authenticated admin.
 * Use `requireAdmin()` for page guards — it auto-404s on mismatch.
 */
export async function isAdmin(): Promise<boolean> {
  const expected = getAdminToken();
  if (!expected) return false;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const fromCookie = cookieStore.get(ADMIN_COOKIE)?.value;
  const fromHeader = headerStore.get(ADMIN_HEADER) ?? undefined;
  return fromCookie === expected || fromHeader === expected;
}

/** Page-level guard. Renders 404 if the caller isn't admin. */
export async function requireAdmin(): Promise<void> {
  const ok = await isAdmin();
  if (!ok) notFound();
}

/** Reason returned by `adminConfigStatus` describing why admin is offline. */
export type AdminStatus =
  | { configured: true }
  | { configured: false; reason: "missing-token" };

export function adminConfigStatus(): AdminStatus {
  const token = getAdminToken();
  if (!token) return { configured: false, reason: "missing-token" };
  return { configured: true };
}

/** Standard robots-noindex metadata for every admin page. */
export const ADMIN_METADATA_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};
