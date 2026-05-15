// Resource hub articles. Top-of-funnel research content built to capture
// people 2-6 weeks from buying. Each entry renders inside the resource shell
// (see src/app/resources/[slug]/page.tsx) with full Article + FAQPage +
// Speakable + Breadcrumb schema and a hub-spoke link back to /resources.
//
// Articles live as typed objects with a JSX-returning Body function so we can
// write rich content without bringing in MDX tooling. The list is hand-curated
// to match the spec's resource hub.

import type { ReactNode } from "react";
import type { FaqItem } from "@/lib/schema";

export type ResourceArticle = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  // 40-60 word answer-first summary at top of page. Designed for AI Overview
  // verbatim extraction.
  summary: string;
  // Hub link this article slots under (also dictates the breadcrumb).
  cluster: "bad-credit" | "newcomer" | "work-permit" | "process" | "general";
  // The most relevant single core page to internally link to (CTA).
  relatedCorePage: { href: string; label: string };
  faq: FaqItem[];
  Body: () => ReactNode;
};

// Eight high-impact resource articles. The actual article modules import
// from this type and are wired in through resources.index.ts.
