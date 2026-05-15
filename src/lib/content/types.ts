// On-disk file format for published, Claude-generated resource articles.
// Used by both the publish flow (writes the file) and the build-time loader
// in `src/content/resources/generated/index.ts` (reads + renders).

import type { FaqItem } from "@/lib/schema";
import type { ResourceArticle } from "@/content/resources";

export type GeneratedResourceFile = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  summary: string;
  cluster: ResourceArticle["cluster"];
  relatedCorePage: { href: string; label: string };
  faq: FaqItem[];
  // Plain markdown — rendered with our internal `<Markdown>` component.
  body: string;
};
