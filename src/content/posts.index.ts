import type { Post } from "./posts";
import noCanadianCredit from "./posts/no-canadian-credit-calgary";
import workPermitAlberta from "./posts/work-permit-alberta";
import bankruptcyCanada from "./posts/bankruptcy-canada-how-long";
import sixMonthsCovered from "./posts/six-months-covered";
import newcomerDocuments from "./posts/newcomer-documents";

// New posts: add here. Order is the order they appear on the blog hub.
export const POSTS: Post[] = [
  noCanadianCredit,
  workPermitAlberta,
  bankruptcyCanada,
  sixMonthsCovered,
  newcomerDocuments,
];

export function findPost(slug: string): Post | undefined {
  return POSTS.find(p => p.slug === slug);
}
