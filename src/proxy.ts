import { NextResponse, type NextRequest } from "next/server";

// Three responsibilities, in order:
//
//   1) Force HTTPS if the request arrived over plain HTTP.
//   2) Redirect www.newwheels.ca → newwheels.ca preserving path.
//   3) Rewrite subdomain hosts to their respective namespaces:
//        crm.newwheels.ca/foo    → /crm/foo
//        portal.newwheels.ca/foo → /portal/foo
//        apply.newwheels.ca/foo  → /apply/foo
//        team.newwheels.ca/foo   → /inbox/foo   (team is the email subdomain;
//                                                the apex /team marketing
//                                                page stays public)
//        docs.newwheels.ca/foo   → /docs/foo
//
//      This keeps the marketing site, CRM, buyer portal, apply portal,
//      team inbox, and API docs all in one Next.js app while presenting
//      cleanly separated subdomains.
//
//      Local dev convenience: NW_CRM_DEV_PORT and NW_PORTAL_DEV_PORT (e.g.
//      `localhost:3000/crm` and `/portal`) can be hit directly. The rewrite
//      only kicks in when the Host header matches a configured subdomain.

const APEX_HOST = "newwheels.ca";
const CRM_HOSTS = new Set([
  "crm.newwheels.ca",
  process.env.NW_CRM_HOST,
].filter(Boolean) as string[]);
const PORTAL_HOSTS = new Set([
  "portal.newwheels.ca",
  process.env.NW_PORTAL_HOST,
].filter(Boolean) as string[]);
const APPLY_HOSTS = new Set([
  "apply.newwheels.ca",
  process.env.NW_APPLY_HOST,
].filter(Boolean) as string[]);
const TEAM_HOSTS = new Set([
  "team.newwheels.ca",
  process.env.NW_TEAM_HOST,
].filter(Boolean) as string[]);
const DOCS_HOSTS = new Set([
  "docs.newwheels.ca",
  process.env.NW_DOCS_HOST,
].filter(Boolean) as string[]);

function stripHostPort(host: string): string {
  // Strip port for matching but keep it for url.host rewrites.
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function proxy(req: NextRequest) {
  const rawHost = req.headers.get("host")?.toLowerCase() ?? "";
  const host = stripHostPort(rawHost);
  const proto = req.headers.get("x-forwarded-proto");
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 1) HTTP → HTTPS upgrade (preserve subdomain).
  if (proto === "http") {
    url.host = host === `www.${APEX_HOST}` ? APEX_HOST : host;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 2) www → apex (keeps SEO + canonical happy).
  if (host === `www.${APEX_HOST}`) {
    url.host = APEX_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // 3) Subdomain rewrites. The visitor never sees /crm/* or /portal/* in
  // their URL bar — the path stays clean. Public assets and shared API
  // routes (/api/lead, sitemaps) are NOT rewritten so the marketing form
  // keeps working from the apex domain.
  const isCrmHost = CRM_HOSTS.has(host);
  const isPortalHost = PORTAL_HOSTS.has(host);
  const isApplyHost = APPLY_HOSTS.has(host);
  const isTeamHost = TEAM_HOSTS.has(host);
  const isDocsHost = DOCS_HOSTS.has(host);

  if (isCrmHost) {
    // Reserved cross-subdomain endpoints stay as-is.
    if (path.startsWith("/api/crm") || path.startsWith("/api/cron") || path.startsWith("/_next")) {
      return NextResponse.next();
    }
    // If we're already on /crm/* we don't double-rewrite.
    if (!path.startsWith("/crm")) {
      url.pathname = `/crm${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isPortalHost) {
    if (
      path.startsWith("/api/portal") ||
      path.startsWith("/api/cron") ||
      path.startsWith("/api/stripe") ||
      path.startsWith("/_next")
    ) {
      return NextResponse.next();
    }
    if (!path.startsWith("/portal")) {
      url.pathname = `/portal${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isApplyHost) {
    // Token-based applicant status portal. The /api/apply/* namespace is
    // reserved for status + document upload endpoints.
    if (path.startsWith("/api/apply") || path.startsWith("/api/cron") || path.startsWith("/_next")) {
      return NextResponse.next();
    }
    if (!path.startsWith("/apply")) {
      url.pathname = `/apply${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isTeamHost) {
    // Internal team email inbox at team.newwheels.ca rewrites to /inbox/*
    // (not /team, which is the apex marketing "Meet the team" page).
    // The /api/inbox/* and /api/email/* namespaces stay direct so the Resend
    // inbound webhook lands cleanly.
    if (
      path.startsWith("/api/inbox") ||
      path.startsWith("/api/email") ||
      path.startsWith("/api/cron") ||
      path.startsWith("/_next")
    ) {
      return NextResponse.next();
    }
    if (!path.startsWith("/inbox")) {
      url.pathname = `/inbox${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isDocsHost) {
    if (path.startsWith("/api/docs") || path.startsWith("/_next")) {
      return NextResponse.next();
    }
    if (!path.startsWith("/docs")) {
      url.pathname = `/docs${path === "/" ? "" : path}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Apex (marketing site) — block direct access to internal namespaces so
  // /crm, /portal, /apply, /inbox, /docs aren't crawlable via newwheels.ca.
  // /team is intentionally NOT reserved — it's the public marketing page.
  const reservedRoots = ["/crm", "/portal", "/apply", "/inbox", "/docs"];
  if (reservedRoots.some((p) => path === p || path.startsWith(`${p}/`))) {
    url.pathname = "/";
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon|api/health).*)"],
};
