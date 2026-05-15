import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Robots policy. Every AI crawler is explicitly listed so a misconfigured WAF
// or Cloudflare rule can never silently swallow our pages from AI answers.
// Sitemap is the segmented index that fans out to per-category sitemaps.

const AI_CRAWLERS = [
  "GPTBot", // OpenAI training crawler
  "OAI-SearchBot", // ChatGPT search citations
  "ChatGPT-User", // user-initiated ChatGPT fetches
  "ClaudeBot", // Anthropic training crawler
  "Claude-Web", // Anthropic Claude web reader
  "anthropic-ai", // legacy Anthropic UA
  "PerplexityBot", // Perplexity citation crawler
  "Perplexity-User", // Perplexity user-initiated fetches
  "Google-Extended", // controls inclusion in Google's AI Overviews / Bard / Gemini
  "GoogleOther", // Google miscellaneous fetches incl. AI
  "Amazonbot", // Alexa / Amazon answer crawler
  "Applebot", // Apple Spotlight + Siri
  "Applebot-Extended", // Apple Intelligence training opt-in
  "FacebookBot", // Meta crawler
  "Meta-ExternalAgent", // Meta AI agent fetcher
  "Meta-ExternalFetcher", // Meta AI on-demand fetches
  "DuckAssistBot", // DuckDuckGo AI assistant
  "Bytespider", // ByteDance / Doubao
  "Diffbot", // structured-data extractor
  "PetalBot", // Huawei
  "YouBot", // You.com search
  "cohere-ai", // Cohere
  "Kagibot", // Kagi search
  "AwarioRssBot",
  "AwarioSmartBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicit allow for every major AI crawler. Always-on, never blocked.
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/admin/", "/thank-you"],
      })),
      // Default allow for everything else.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/thank-you"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
