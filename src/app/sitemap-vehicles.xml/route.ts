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
    .filter(p => segmentForKind(p.kind) === "vehicles")
    .map(p => ({
      loc: toUrl(`/${p.slug}`),
      lastmod,
      changefreq: "weekly",
      priority: p.priority ?? 0.82,
    }));
  return xmlResponse(renderUrlset(entries));
}
