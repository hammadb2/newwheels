// Shared types for the programmatic page engine. Every page surfaced under
// the catchall `[slug]/page.tsx` route resolves to one of these shapes, and
// the renderer dispatches on `kind` to pick the right schema set.

import type { FaqItem } from "@/lib/schema";

export type PageKind =
  | "audience"
  | "location"
  | "community"
  | "vehicle-type"
  | "vehicle-make"
  | "vehicle-model"
  | "budget"
  | "intent"
  | "service-intent"
  | "seasonal"
  | "calculator"
  | "resource"
  | "cross";

export type Section = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type RelatedLink = { href: string; label: string };

export type ProgrammaticPage = {
  slug: string; // path without leading slash
  kind: PageKind;
  category: string; // human-readable label used for grouping in sitemap + llms.txt
  metaTitle: string; // 50-65 chars
  metaDescription: string; // 150-160 chars
  h1: string;
  tagline?: string;
  intro: string; // 40-80 word answer-first paragraph (also drives Speakable)
  sections: Section[];
  faq: FaqItem[];
  related: RelatedLink[];
  ctaHeading?: string;
  // The first paragraph and h1 are the speakable target. Optionally callers can
  // add more selectors but we mostly rely on the default.
  speakableSelectors?: string[];
  // Per-page extra schema (Vehicle, FinancialProduct, LoanOrCredit, HowTo, etc.).
  extraSchema?: object[];
  priority?: number; // sitemap priority override
};

export type Audience = {
  id: string;
  slugFragment: string; // used to build composed slugs
  fullName: string;
  shortName: string;
  // Pricing knowledge specific to this audience used to drive copy.
  rateRange: string;
  // What documentation the audience usually needs.
  docs: string[];
  // Lender families that approve this audience.
  lenderNotes: string;
  // Calgary-specific signal (where they live, where they work, how they shop).
  calgarySignal: string;
};

export type Location = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  kind: "calgary-quadrant" | "calgary-neighbourhood" | "surrounding-city";
  // Hand-written landmark and demographic colour to keep pages unique.
  landmarks: string[];
  driveTimeNote: string;
  buyerArchetype: string;
};

export type Community = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  language: string;
  // ISO language code (used for hreflang scaffolding).
  langCode?: "tl" | "pa" | "ar" | "es";
  primaryCalgaryNeighbourhoods: string[];
  visaPathways: string[];
  cultureNotes: string;
};

export type VehicleType = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  // What buyers want this vehicle for.
  useCase: string;
  // Calgary-specific considerations (winter handling, ground clearance, fuel economy on a long commute).
  calgaryFitNote: string;
};

export type VehicleMake = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  // OEM finance program(s) we can route to.
  financeProgram: string;
  // What this make is known for.
  brandNote: string;
  // Calgary fit (resale value, parts availability, popularity).
  calgaryNote: string;
  // Top models we finance for this make.
  topModels: string[];
};

export type VehicleModel = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  make: string; // links to a VehicleMake.id
  bodyType: string; // SUV, truck, sedan, etc.
  fuelType: string;
  driveWheelConfig: string;
  modelDate: string;
  approxPriceRange: [number, number];
  calgaryAngle: string;
};

export type Budget = {
  id: string;
  slugFragment: string;
  shortName: string;
  // Either a price ceiling or a monthly-payment ceiling.
  maxPrice?: number;
  maxMonthly?: number;
  zeroDown?: boolean;
  lowDown?: boolean;
};

export type Intent = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  intent: string;
  calgaryAngle: string;
};

export type Seasonal = {
  id: string;
  slugFragment: string;
  fullName: string;
  shortName: string;
  monthsActive: string;
  calgaryAngle: string;
};
