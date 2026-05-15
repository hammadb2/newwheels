// XML sitemap helpers. We hand-render the XML so each segment can ship its
// own `<urlset>` (and the master file ships `<sitemapindex>`), which the
// Next.js `MetadataRoute.Sitemap` metadata-API plumbing does not support.

import { SITE_URL, fullUrl } from "./site";

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type UrlEntry = {
  loc: string;
  lastmod?: string; // ISO date
  changefreq?: ChangeFreq;
  priority?: number; // 0.0-1.0
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlBlock(e: UrlEntry): string {
  const parts = [`    <loc>${esc(e.loc)}</loc>`];
  if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
  if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
  if (e.priority !== undefined) parts.push(`    <priority>${e.priority.toFixed(2)}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export function renderUrlset(entries: UrlEntry[]): string {
  const body = entries.map(urlBlock).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function renderSitemapIndex(segments: { loc: string; lastmod?: string }[]): string {
  const body = segments
    .map(s => {
      const lines = [`    <loc>${esc(s.loc)}</loc>`];
      if (s.lastmod) lines.push(`    <lastmod>${s.lastmod}</lastmod>`);
      return `  <sitemap>\n${lines.join("\n")}\n  </sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Convenience: resolve a slug-or-path into a full URL.
export function toUrl(slugOrPath: string): string {
  if (slugOrPath.startsWith("http")) return slugOrPath;
  if (slugOrPath === "" || slugOrPath === "/") return SITE_URL;
  if (slugOrPath.startsWith("/")) return fullUrl(slugOrPath);
  return fullUrl(`/${slugOrPath}`);
}

// Map a ProgrammaticPage.kind to its sitemap segment.
export type SitemapSegment = "core" | "blog" | "locations" | "communities" | "vehicles" | "intent";

export function segmentForKind(
  kind: string,
): SitemapSegment {
  switch (kind) {
    case "location":
      return "locations";
    case "community":
      return "communities";
    case "vehicle-type":
    case "vehicle-make":
    case "vehicle-model":
      return "vehicles";
    case "audience":
    case "budget":
    case "intent":
    case "seasonal":
    case "service-intent":
    case "calculator":
    case "cross":
    case "resource":
      return "intent";
    default:
      return "intent";
  }
}
