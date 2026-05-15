// Automated internal-linking system. Scans content text and inserts contextual
// internal links based on a keyword → target-URL map. Spec is in PART 7 of the
// SEO build: every mention of e.g. "bad credit" links to
// /bad-credit-car-loans-calgary, every "Airdrie" links to /car-loans-airdrie,
// and so on.
//
// How it's used:
//   import { linkifyText } from "@/lib/internal-links";
//   linkifyText("People with bad credit in Airdrie...") returns JSX with the
//   two phrases wrapped in <Link href="/..."> tags.
//
// Rules to keep this from being spammy:
//   * One link per keyword per call.
//   * Don't link a phrase inside an existing link.
//   * Don't insert more than 4 links total per call (Google's spam-filter
//     threshold is roughly 6-8/100 words).
//   * Case-insensitive match but preserve original text casing.
//   * Word boundaries — "creditor" must NOT match the "credit" rule.

import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import Link from "next/link";

type KeywordRule = {
  // Phrase to detect, case-insensitive. Match is whole-word for single tokens
  // and substring for multi-word phrases.
  match: string;
  href: string;
};

// Curated rules. Order matters — earlier rules win on the first occurrence,
// which lets us put more specific phrases ("6 months covered") above more
// general ones ("bad credit"). Long phrases first.
export const INTERNAL_LINK_RULES: KeywordRule[] = [
  // Specific offers and programs
  { match: "6 months of payments covered", href: "/" },
  { match: "6 months covered", href: "/" },
  { match: "6-months-covered", href: "/" },

  // Audience pages
  { match: "consumer proposal", href: "/consumer-proposal-car-loan-calgary" },
  { match: "discharged bankruptcy", href: "/car-loan-after-bankruptcy-calgary" },
  { match: "after bankruptcy", href: "/car-loan-after-bankruptcy-calgary" },
  { match: "newcomer to Canada", href: "/newcomer-car-loans-calgary" },
  { match: "newcomers", href: "/newcomer-car-loans-calgary" },
  { match: "self-employed", href: "/self-employed-car-loan-calgary" },
  { match: "bad credit", href: "/bad-credit-car-loans-calgary" },
  { match: "first-time buyer", href: "/first-time-car-buyer-calgary" },
  { match: "work permit", href: "/car-loan-work-permit-calgary" },
  { match: "PGWP", href: "/car-loan-work-permit-calgary" },
  { match: "LMIA", href: "/car-loan-work-permit-calgary" },

  // Locations (city-level)
  { match: "Airdrie", href: "/car-loans-airdrie" },
  { match: "Cochrane", href: "/car-loans-cochrane" },
  { match: "Okotoks", href: "/car-loans-okotoks" },
  { match: "Chestermere", href: "/car-loans-chestermere" },
  { match: "Strathmore", href: "/car-loans-strathmore" },
  { match: "High River", href: "/car-loans-high-river" },

  // Calgary quadrants
  { match: "NE Calgary", href: "/car-loans-ne-calgary" },
  { match: "SE Calgary", href: "/car-loans-se-calgary" },
  { match: "SW Calgary", href: "/car-loans-sw-calgary" },
  { match: "NW Calgary", href: "/car-loans-nw-calgary" },
  { match: "downtown Calgary", href: "/car-loans-downtown-calgary" },

  // Makes
  { match: "Toyota RAV4", href: "/toyota-rav4-financing-calgary" },
  { match: "Ford F-150", href: "/ford-f-150-financing-calgary" },
  { match: "F-150", href: "/ford-f-150-financing-calgary" },
  { match: "Honda CR-V", href: "/honda-cr-v-financing-calgary" },
  { match: "Honda Civic", href: "/honda-civic-financing-calgary" },
  { match: "Toyota Corolla", href: "/toyota-corolla-financing-calgary" },
  { match: "Toyota Camry", href: "/toyota-camry-financing-calgary" },
  { match: "Toyota", href: "/toyota-financing-calgary" },
  { match: "Honda", href: "/honda-financing-calgary" },
  { match: "Ford", href: "/ford-financing-calgary" },
  { match: "Hyundai", href: "/hyundai-financing-calgary" },
  { match: "Kia", href: "/kia-financing-calgary" },
  { match: "Chevrolet", href: "/chevrolet-financing-calgary" },
  { match: "Nissan", href: "/nissan-financing-calgary" },

  // Tools
  { match: "payment calculator", href: "/calculator" },
  { match: "Calgary calculator", href: "/calculator" },
];

const MAX_LINKS_PER_BLOCK = 4;

// Build a single regex that finds any rule keyword. The regex respects word
// boundaries on either side so "credit" doesn't match "creditor".
function buildRegex(rules: KeywordRule[]): RegExp {
  const escaped = rules.map(r => r.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "gi");
}

const RULE_REGEX = buildRegex(INTERNAL_LINK_RULES);

function findRule(match: string): KeywordRule | undefined {
  const lower = match.toLowerCase();
  return INTERNAL_LINK_RULES.find(r => r.match.toLowerCase() === lower);
}

export function linkifyText(text: string, opts?: { maxLinks?: number; selfHref?: string }): ReactNode {
  const max = opts?.maxLinks ?? MAX_LINKS_PER_BLOCK;
  const selfHref = opts?.selfHref;
  const seen = new Set<string>();
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let inserted = 0;

  // Reset regex state between calls (sticky g flag).
  RULE_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RULE_REGEX.exec(text)) !== null) {
    if (inserted >= max) break;
    const matched = m[0];
    const rule = findRule(matched);
    if (!rule) continue;
    const key = rule.match.toLowerCase();
    // Skip if already linked once in this block.
    if (seen.has(key)) continue;
    // Don't link to the page the reader is already on.
    if (selfHref && rule.href === selfHref) continue;
    seen.add(key);

    if (m.index > lastIndex) {
      out.push(text.slice(lastIndex, m.index));
    }
    out.push(
      createElement(
        Link,
        {
          key: `${rule.href}-${m.index}`,
          href: rule.href,
          className: "text-brand-forest underline underline-offset-2",
        },
        matched,
      ),
    );
    lastIndex = m.index + matched.length;
    inserted += 1;
  }
  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }
  if (out.length === 0) return text;
  return createElement(Fragment, null, ...out);
}
