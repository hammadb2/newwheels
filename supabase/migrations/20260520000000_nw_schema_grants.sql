-- Schema-level grants for the `nw` schema.
--
-- Why this exists
-- ===============
-- The original `crm_init.sql` migration creates the `nw` schema and tables but
-- never grants any privileges on them. In a vanilla Postgres install that's
-- fine because `postgres` owns everything and the app talks to the DB as
-- `postgres`. In a Supabase project, however, the JS client talks to the DB
-- as `service_role` / `anon` / `authenticated` via PostgREST.
--
-- Without explicit GRANTs:
--   - `service_role` (server-side, bypasses RLS) gets `permission denied for
--     schema nw` on every read/write. The Supabase JS client returns
--     `{ data: null, error: { code: '42501', ... } }` and the OTP route
--     interprets the null row as "no team member found" → silent 200.
--   - `anon` / `authenticated` get the same error on buyer-portal paths.
--
-- This migration is purely additive. RLS policies in
-- `20260516000100_crm_rls.sql` continue to govern row-level access for
-- `anon` / `authenticated`; `service_role` keeps the BYPASSRLS attribute so
-- forced-RLS tables (auth_otps, sessions) are still reachable from server
-- code only.
--
-- Idempotent: re-running this migration is safe.

-- Schema usage. Without this, none of the table grants below have any effect
-- because PostgREST can't even reach into the schema.
grant usage on schema nw to anon, authenticated, service_role;

-- service_role: full access. RLS is bypassed via the role's BYPASSRLS
-- attribute (see Supabase's standard role setup), so forced-RLS tables are
-- still reachable from server code.
grant all on all tables    in schema nw to service_role;
grant all on all sequences in schema nw to service_role;
grant all on all routines  in schema nw to service_role;

-- anon + authenticated: standard CRUD. Row-level access is governed by the
-- policies in `20260516000100_crm_rls.sql`; default-deny still applies
-- everywhere we haven't written a policy.
grant select, insert, update, delete on all tables    in schema nw to anon, authenticated;
grant usage,  select                 on all sequences in schema nw to anon, authenticated;
grant execute                        on all routines  in schema nw to anon, authenticated;

-- Default privileges for objects created later in this schema, so adding a
-- new table in a future migration doesn't silently break the same way.
alter default privileges in schema nw
  grant all on tables to service_role;
alter default privileges in schema nw
  grant all on sequences to service_role;
alter default privileges in schema nw
  grant execute on routines to service_role;
alter default privileges in schema nw
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema nw
  grant usage, select on sequences to anon, authenticated;
alter default privileges in schema nw
  grant execute on routines to anon, authenticated;

-- Ask PostgREST to refresh its schema cache so the new grants are visible
-- without waiting for the periodic reload.
notify pgrst, 'reload schema';
