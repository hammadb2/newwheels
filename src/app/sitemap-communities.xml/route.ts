import { getAllProgrammaticPages } from "@/lib/programmatic/pages";
import {
  renderUrlset,
  segmentForKind,
  today,
  toUrl,
  xmlResponse,
  type UrlEntry,
} from "@/lib/sitemap-helpers";

export const dynamic = "force-static";

export function GET() {
  const lastmod = today();
  const entries: UrlEntry[] = getAllProgrammaticPages()
    .filter(p => segmentForKind(p.kind) === "communities")
    .map(p => ({
      loc: toUrl(`/${p.slug}`),
      lastmod,
      changefreq: "weekly",
      priority: p.priority ?? 0.8,
    }));
  // Language landing pages (hreflang alternates that resolve to a real 200).
  for (const code of ["tl", "pa", "ar", "es"]) {
    entries.push({
      loc: toUrl(`/${code}`),
      lastmod,
      changefreq: "monthly",
      priority: 0.72,
    });
  }
  return xmlResponse(renderUrlset(entries));
}
