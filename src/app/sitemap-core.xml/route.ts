// Core sitemap: hand-built static routes (homepage, situation pages, About,
// How It Works, Calculator, Blog index, Resources hub, /data/).

import { PAGES } from "@/lib/site";
import {
  renderUrlset,
  today,
  toUrl,
  xmlResponse,
  type UrlEntry,
} from "@/lib/sitemap-helpers";

export const dynamic = "force-static";

export function GET() {
  const lastmod = today();
  const entries: UrlEntry[] = PAGES.map(p => ({
    loc: toUrl(p.slug),
    lastmod,
    changefreq: "weekly",
    priority:
      p.slug === "/" ? 1
      : p.group === "core" ? 0.9
      : p.group === "situation" ? 0.85
      : p.group === "info" ? 0.7
      : 0.6,
  }));

  // Add routes that aren't in PAGES yet but were created in this PR.
  entries.push(
    { loc: toUrl("/resources"), lastmod, changefreq: "weekly", priority: 0.85 },
    { loc: toUrl("/data"), lastmod, changefreq: "monthly", priority: 0.4 },
  );

  return xmlResponse(renderUrlset(entries));
}
