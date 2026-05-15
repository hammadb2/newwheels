// Sitemap index. Points to every segmented sitemap. Submit this single URL
// to Google Search Console and Bing Webmaster — they recursively crawl each
// listed segment.

import { fullUrl } from "@/lib/site";
import { renderSitemapIndex, today, xmlResponse } from "@/lib/sitemap-helpers";

export const dynamic = "force-static";

export function GET() {
  const lastmod = today();
  const segments = [
    "sitemap-core.xml",
    "sitemap-blog.xml",
    "sitemap-locations.xml",
    "sitemap-communities.xml",
    "sitemap-vehicles.xml",
    "sitemap-intent.xml",
  ].map(name => ({ loc: fullUrl(`/${name}`), lastmod }));
  return xmlResponse(renderSitemapIndex(segments));
}
