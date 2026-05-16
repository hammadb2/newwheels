// Supabase clients for the CRM + buyer portal.
//
// Two clients are exposed:
//   1) `getServerSupabase()` — service-role key, server-only. Bypasses RLS
//      by design. App code is responsible for scoping queries by the
//      authenticated subject (team_member_id or buyer_account_id) and
//      enforcing role permissions via rbac.ts.
//   2) `getPublicSupabase()` — anon-key client, also server-only, used for
//      flows that benefit from RLS enforcement (e.g. a buyer reading their
//      own purchases when claims are set).
//
// Both clients are lazily constructed so that the app builds and renders
// even when env vars are missing. Callers should check `isConfigured()`
// when they're in a code path that requires Supabase.
//
// IMPORTANT: never import this file from a Client Component. It only runs
// on the server side because the service-role key would leak otherwise.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// We deliberately keep the SupabaseClient type generic — every table lives in
// the custom `nw` schema, which doesn't match the default `public` schema
// constraint that `createClient<>` returns. Generating types from the database
// is overkill for the foundation PR.
type AnyClient = SupabaseClient<any, any, any>;

let cachedServer: AnyClient | null = null;
let cachedPublic: AnyClient | null = null;

export function supabaseEnv() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, serviceKey } = supabaseEnv();
  return Boolean(url) && Boolean(serviceKey);
}

/**
 * Returns the service-role Supabase client, or null if env vars are missing.
 * Use the strict variant when you want to throw instead.
 */
export function getServerSupabase(): AnyClient | null {
  if (cachedServer) return cachedServer;
  const { url, serviceKey } = supabaseEnv();
  if (!url || !serviceKey) return null;
  cachedServer = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "nw" },
  }) as AnyClient;
  return cachedServer;
}

export function getServerSupabaseStrict(): AnyClient {
  const c = getServerSupabase();
  if (!c) throw new SupabaseNotConfiguredError();
  return c;
}

/**
 * Public anon client, schema scoped to `nw`. Returns null when missing.
 */
export function getPublicSupabase(): AnyClient | null {
  if (cachedPublic) return cachedPublic;
  const { url, anonKey } = supabaseEnv();
  if (!url || !anonKey) return null;
  cachedPublic = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "nw" },
  }) as AnyClient;
  return cachedPublic;
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}
