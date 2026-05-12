import type { ReactNode } from "react";
import type { FaqItem } from "@/lib/schema";

export type Post = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  primaryKeyword: string;
  relatedCorePage: { href: string; label: string };
  calgarySignal: string;
  faq: FaqItem[];
  // Body is returned by a render fn so we can use JSX cleanly per post.
  Body: () => ReactNode;
};
