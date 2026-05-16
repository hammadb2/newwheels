import { NextResponse, type NextRequest } from "next/server";

// Three responsibilities, in order:
//
//   1) Force HTTPS if the request arrived over plain HTTP.
//   2) Redirect www.newwheels.ca → newwheels.ca preserving path.
//   3) Rewrite subdomain hosts to their respective namespaces:
//        crm.newwheels.ca/foo    → /crm/foo
//        portal.newwheels.ca/foo → /portal/foo
//
//      This keeps the marketing site, CRM, and buyer portal all in one
//      Next.js app while presenting cleanly separated subdomains.
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

  // Apex (marketing site) — block direct access to internal namespaces so
  // /crm and /portal aren't crawlable via newwheels.ca.
  if (path === "/crm" || path.startsWith("/crm/") || path === "/portal" || path.startsWith("/portal/")) {
    url.pathname = "/";
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon|api/health).*)"],
};
