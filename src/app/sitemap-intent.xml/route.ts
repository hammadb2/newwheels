// Intent sitemap: buyer-intent pages — budget, audience, seasonal, intent,
// service-intent, calculator landings, cross-products. Everything that
// captures search intent that's neither geographic nor vehicle-specific.

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
    .filter(p => segmentForKind(p.kind) === "intent")
    .map(p => ({
      loc: toUrl(`/${p.slug}`),
      lastmod,
      changefreq: "weekly",
      priority: p.priority ?? 0.74,
    }));
  return xmlResponse(renderUrlset(entries));
}
