import type { ProgrammaticPage } from "./types";
import { generateLocationPages } from "./generators/locations";
import { generateCommunityPages } from "./generators/communities";
import { generateVehicleMakePages } from "./generators/vehicle-makes";
import { generateVehicleModelPages } from "./generators/vehicle-models";
import { generateVehicleTypePages } from "./generators/vehicle-types";
import { generateBudgetPages } from "./generators/budgets";
import { generateIntentPages, generateSeasonalPages } from "./generators/intents";
import { generateServiceIntentPages } from "./generators/service-intent";
import { generateCalculatorLandingPages } from "./generators/calculator-landing";
import { generateAudienceLocationCrossProducts, generateAudienceMakeCrossProducts } from "./generators/cross-products";

// Static-route slugs already shipped by the codebase. The catchall route MUST
// skip these or Next.js will throw at build (same path resolves twice).
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "",
  // Existing static routes under src/app/*
  "about",
  "bad-credit-car-loans-calgary",
  "blog",
  "calculator",
  "car-loan-after-bankruptcy-calgary",
  "car-loan-work-permit-calgary",
  "consumer-proposal-car-loan-calgary",
  "first-time-car-buyer-calgary",
  "how-it-works",
  "newcomer-car-loans-calgary",
  "nissan-financing-calgary",
  "privacy",
  "self-employed-car-loan-calgary",
  "team",
  // Routes we add in this PR (under static folders)
  "data",
  "resources",
  // Asset-style paths Next.js handles itself
  "api",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "thank-you",
  "contact",
]);

let cache: ProgrammaticPage[] | null = null;

function buildAll(): ProgrammaticPage[] {
  const all = [
    ...generateLocationPages(),
    ...generateCommunityPages(),
    ...generateVehicleMakePages(),
    ...generateVehicleModelPages(),
    ...generateVehicleTypePages(),
    ...generateBudgetPages(),
    ...generateIntentPages(),
    ...generateSeasonalPages(),
    ...generateServiceIntentPages(),
    ...generateCalculatorLandingPages(),
    ...generateAudienceLocationCrossProducts(),
    ...generateAudienceMakeCrossProducts(),
  ];

  // Dedupe by slug (in case any generator collides) and drop anything that
  // would shadow a hand-built static route.
  const seen = new Set<string>();
  const filtered: ProgrammaticPage[] = [];
  for (const p of all) {
    if (RESERVED_SLUGS.has(p.slug)) continue;
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    filtered.push(p);
  }
  return filtered;
}

export function getAllProgrammaticPages(): ProgrammaticPage[] {
  if (!cache) cache = buildAll();
  return cache;
}

export function getProgrammaticPage(slug: string): ProgrammaticPage | undefined {
  return getAllProgrammaticPages().find(p => p.slug === slug);
}

export function getProgrammaticSlugs(): string[] {
  return getAllProgrammaticPages().map(p => p.slug);
}

export function getProgrammaticPagesByCategory(): Map<string, ProgrammaticPage[]> {
  const map = new Map<string, ProgrammaticPage[]>();
  for (const p of getAllProgrammaticPages()) {
    const arr = map.get(p.category) ?? [];
    arr.push(p);
    map.set(p.category, arr);
  }
  return map;
}

export function getProgrammaticPageSummaries(): { slug: string; title: string; category: string }[] {
  return getAllProgrammaticPages().map(p => ({
    slug: p.slug,
    title: p.h1,
    category: p.category,
  }));
}
