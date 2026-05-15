// Shared spoke-link data used by hub pages. Each function returns a list of
// `{ href, label }` rows that are guaranteed to resolve to a programmatic page
// (the generators in `src/lib/programmatic/generators/` produce the exact same
// slugs). We deliberately re-derive the slug from the data layer rather than
// hand-write strings so the two stay in sync.
//
// IMPORTANT: order matters — we hand-pick the highest commercial-intent
// spokes per hub so the block stays under ~20 links.

import { LOCATIONS } from "./programmatic/locations";
import { VEHICLE_MAKES } from "./programmatic/vehicle-makes";

export type Spoke = { href: string; label: string };

// Pick the top N (deduped, in order). Use this when curating a small subset
// from a larger array.
function pick<T>(arr: T[], ids: string[], idKey: keyof T): T[] {
  const map = new Map(arr.map(it => [it[idKey] as unknown as string, it]));
  return ids.map(id => map.get(id)).filter((x): x is T => !!x);
}

// ---------------------------------------------------------------------------
// Bad-credit hub spokes
// ---------------------------------------------------------------------------
export function badCreditSpokes(): { byLocation: Spoke[]; byMake: Spoke[] } {
  const featuredLocationIds = [
    "ne-calgary",
    "se-calgary",
    "nw-calgary",
    "sw-calgary",
    "downtown-calgary",
    "forest-lawn",
    "saddle-ridge",
    "airdrie",
    "cochrane",
    "chestermere",
  ];
  const byLocation: Spoke[] = pick(LOCATIONS, featuredLocationIds, "id").map(
    loc => ({
      href: `/bad-credit-car-loan-${loc.slugFragment}`,
      label: `Bad credit car loans in ${loc.shortName}`,
    }),
  );

  // bad-credit × make cross-products are only generated for these makes
  // (see AUDIENCE_MAKE_MAKES in generators/cross-products.ts). Keep this list
  // in sync with that generator.
  const featuredMakeIds = [
    "toyota",
    "honda",
    "ford",
    "chevrolet",
    "hyundai",
    "kia",
    "ram",
    "gmc",
  ];
  const byMake: Spoke[] = pick(VEHICLE_MAKES, featuredMakeIds, "id").map(m => ({
    href: `/bad-credit-${m.slugFragment}-financing-calgary`,
    label: `Bad credit ${m.shortName} financing`,
  }));

  return { byLocation, byMake };
}

// ---------------------------------------------------------------------------
// Newcomer hub spokes
// ---------------------------------------------------------------------------
export function newcomerSpokes(): { byLocation: Spoke[]; byMake: Spoke[] } {
  const featuredLocationIds = [
    "ne-calgary",
    "nw-calgary",
    "saddle-ridge",
    "martindale",
    "falconridge",
    "marlborough",
    "airdrie",
    "cochrane",
    "okotoks",
    "chestermere",
  ];
  const byLocation: Spoke[] = pick(LOCATIONS, featuredLocationIds, "id").map(
    loc => ({
      href: `/newcomer-car-loan-${loc.slugFragment}`,
      label: `Newcomer car loans in ${loc.shortName}`,
    }),
  );

  const featuredMakeIds = [
    "toyota",
    "honda",
    "hyundai",
    "kia",
    "ford",
    "chevrolet",
    "ram",
    "gmc",
  ];
  const byMake: Spoke[] = pick(VEHICLE_MAKES, featuredMakeIds, "id").map(m => ({
    href: `/newcomer-${m.slugFragment}-financing-calgary`,
    label: `Newcomer ${m.shortName} financing`,
  }));

  return { byLocation, byMake };
}

// ---------------------------------------------------------------------------
// Work-permit hub spokes. We don't have permit-subtype audience pages (LMIA,
// PGWP, TFW etc.) — only the generic work-permit hub — so the "by pathway"
// group routes to the related hand-built audience hubs and to the
// work-permit × location cross-products. The "by neighbourhood" group uses
// the work-permit × location cross-products directly.
// ---------------------------------------------------------------------------
export function workPermitSpokes(): { byPathway: Spoke[]; byLocation: Spoke[] } {
  const byPathway: Spoke[] = [
    { href: "/newcomer-car-loans-calgary", label: "Newcomer (PR / PGWP / open permit)" },
    { href: "/first-time-car-buyer-calgary", label: "First-time buyer in Calgary" },
    { href: "/bad-credit-car-loans-calgary", label: "Bad credit / no credit hub" },
    { href: "/self-employed-car-loan-calgary", label: "Self-employed / contractor income" },
  ];

  const featuredLocationIds = [
    "ne-calgary",
    "nw-calgary",
    "saddle-ridge",
    "martindale",
    "falconridge",
    "airdrie",
    "cochrane",
    "okotoks",
  ];
  const byLocation: Spoke[] = pick(LOCATIONS, featuredLocationIds, "id").map(
    loc => ({
      href: `/work-permit-car-loan-${loc.slugFragment}`,
      label: `Work-permit financing in ${loc.shortName}`,
    }),
  );

  return { byPathway, byLocation };
}

// ---------------------------------------------------------------------------
// Generic "homepage" / resources / how-it-works topical authority cluster.
// Highest-intent links across categories so the hub helps any visitor jump
// to the closest spoke.
// ---------------------------------------------------------------------------
export function homepageHubSpokes(): {
  audiences: Spoke[];
  locations: Spoke[];
  vehicles: Spoke[];
  tools: Spoke[];
} {
  return {
    audiences: [
      { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans" },
      { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans" },
      { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
      { href: "/car-loan-after-bankruptcy-calgary", label: "Car loan after bankruptcy" },
      { href: "/consumer-proposal-car-loan-calgary", label: "Car loans during a proposal" },
      { href: "/self-employed-car-loan-calgary", label: "Self-employed car loans" },
      { href: "/first-time-car-buyer-calgary", label: "First-time buyer car loans" },
    ],
    locations: [
      { href: "/car-loans-ne-calgary", label: "NE Calgary" },
      { href: "/car-loans-se-calgary", label: "SE Calgary" },
      { href: "/car-loans-nw-calgary", label: "NW Calgary" },
      { href: "/car-loans-sw-calgary", label: "SW Calgary" },
      { href: "/car-loans-airdrie", label: "Airdrie" },
      { href: "/car-loans-cochrane", label: "Cochrane" },
      { href: "/car-loans-okotoks", label: "Okotoks" },
      { href: "/car-loans-chestermere", label: "Chestermere" },
    ],
    vehicles: [
      { href: "/toyota-financing-calgary", label: "Toyota financing" },
      { href: "/honda-financing-calgary", label: "Honda financing" },
      { href: "/ford-financing-calgary", label: "Ford financing" },
      { href: "/nissan-financing-calgary", label: "Nissan financing" },
      { href: "/hyundai-financing-calgary", label: "Hyundai financing" },
      { href: "/kia-financing-calgary", label: "Kia financing" },
      { href: "/suv-financing-calgary", label: "SUV financing" },
      { href: "/truck-financing-calgary", label: "Truck financing" },
    ],
    tools: [
      { href: "/calculator", label: "Car loan calculator" },
      { href: "/how-it-works", label: "How the process works" },
      { href: "/resources", label: "Calgary buyer resources" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About NewWheels" },
    ],
  };
}
