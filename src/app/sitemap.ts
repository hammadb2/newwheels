import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/site";
import { POSTS } from "@/content/posts.index";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pageEntries = PAGES.map(p => ({
    url: `${SITE_URL}${p.slug === "/" ? "" : p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.slug === "/" ? 1 : p.group === "core" ? 0.9 : p.group === "situation" ? 0.85 : 0.7,
  }));
  const postEntries = POSTS.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.dateModified || p.datePublished),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pageEntries, ...postEntries];
}
