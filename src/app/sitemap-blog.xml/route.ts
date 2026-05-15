import { POSTS } from "@/content/posts.index";
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
  const entries: UrlEntry[] = [
    { loc: toUrl("/blog"), lastmod, changefreq: "daily", priority: 0.7 },
    ...POSTS.map<UrlEntry>(p => ({
      loc: toUrl(`/blog/${p.slug}`),
      lastmod: (p.dateModified || p.datePublished).slice(0, 10),
      changefreq: "monthly",
      priority: 0.65,
    })),
  ];
  return xmlResponse(renderUrlset(entries));
}
