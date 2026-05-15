import { BUSINESS, SITE_NAME, SITE_URL, fullUrl } from "./site";

export type FaqItem = { question: string; answer: string };

// ---------------------------------------------------------------------------
// LocalBusiness + FinancialService
// ---------------------------------------------------------------------------

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FinancialService"],
    "@id": `${SITE_URL}#business`,
    name: SITE_NAME,
    description:
      "Calgary vehicle financing for bad credit, newcomers, and work-permit holders. Up to 6 months of payments covered on qualified deals.",
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    image: fullUrl("/og.png"),
    logo: fullUrl("/logo-wordmark.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.locality,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postal,
      addressCountry: BUSINESS.address.country,
    },
    areaServed: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "00:00",
        closes: "00:00",
        validFrom: "1970-01-01",
        validThrough: "9999-12-31",
        // Sunday closed; the explicit zero-length window keeps Google's
        // hours panel from showing "Hours unknown" while still signalling closed.
      },
    ],
    priceRange: "Free to apply",
    sameAs: BUSINESS.sameAs,
    employee: {
      "@type": "Person",
      name: "NewWheels Specialist",
      jobTitle: "Automotive Finance Specialist",
      description: "AMVIC-licensed automotive sales professional in Calgary, Alberta.",
    },
  };
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

// ---------------------------------------------------------------------------
// WebSite + SearchAction
// ---------------------------------------------------------------------------

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "NewWheels helps Calgary residents get approved for vehicle financing regardless of credit history.",
    inLanguage: "en-CA",
    publisher: { "@id": `${SITE_URL}#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// Organization (entity graph)
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: fullUrl("/logo-wordmark.png"),
    sameAs: BUSINESS.sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.phone,
        contactType: "customer service",
        areaServed: "CA",
        availableLanguage: ["English", "Tagalog", "Punjabi", "Hindi", "Arabic", "Spanish", "Tamil"],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: fullUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// Article (blog posts and resource articles)
// ---------------------------------------------------------------------------

export function articleSchema(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl(opts.path) },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    inLanguage: "en-CA",
    image: [fullUrl("/og.png")],
    author: {
      "@type": "Organization",
      name: opts.authorName || "NewWheels Finance Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: fullUrl("/logo-wordmark.png") },
    },
  };
}

// ---------------------------------------------------------------------------
// Team / About entity
// ---------------------------------------------------------------------------

export function teamSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Calgary's specialist vehicle financing platform. AMVIC-licensed. Bad credit, newcomers, work permits, and self-employed buyers approved in 24 hours.",
    logo: fullUrl("/logo-wordmark.png"),
    knowsAbout: [
      "Vehicle financing",
      "Newcomer car loans",
      "Bad credit auto loans",
      "Consumer proposal car loans",
      "AMVIC compliance",
    ],
  };
}

// ---------------------------------------------------------------------------
// SoftwareApplication (calculator)
// ---------------------------------------------------------------------------

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NewWheels Car Loan Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: fullUrl("/calculator"),
    description:
      "Free Calgary car loan calculator. Estimate your monthly payment, interest, and Alberta no-PST savings before you apply.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}

// ---------------------------------------------------------------------------
// SpeakableSpecification (standalone, for pages that don't ship a full WebPage)
// ---------------------------------------------------------------------------

export function speakableSchema(selectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: selectors,
    },
  };
}

// ---------------------------------------------------------------------------
// WebPage with about + mentions + speakable
// ---------------------------------------------------------------------------

export function webPageSchema(opts: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
  about?: string[];
  mentions?: string[];
}) {
  const speakable = {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable]", "h1", "[data-intro]"],
  };
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": fullUrl(opts.path),
    url: fullUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}#website` },
    inLanguage: "en-CA",
    dateModified: opts.dateModified || new Date().toISOString().slice(0, 10),
    speakable,
    ...(opts.about && opts.about.length
      ? { about: opts.about.map(name => ({ "@type": "Thing", name })) }
      : {}),
    ...(opts.mentions && opts.mentions.length
      ? { mentions: opts.mentions.map(name => ({ "@type": "Thing", name })) }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Service (one per service page)
// ---------------------------------------------------------------------------

export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: fullUrl(opts.path),
    serviceType: opts.serviceType ?? "Vehicle financing",
    provider: { "@id": `${SITE_URL}#business` },
    areaServed: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    audience: { "@type": "Audience", audienceType: "Calgary vehicle buyers" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
      url: fullUrl(opts.path),
      eligibleRegion: { "@type": "Place", name: "Calgary, Alberta, Canada" },
    },
  };
}

// ---------------------------------------------------------------------------
// FinancialProduct (financing product on every financing page)
// ---------------------------------------------------------------------------

export function financialProductSchema(opts: {
  name: string;
  description: string;
  path: string;
  minLoan?: number;
  maxLoan?: number;
  rateLow?: number;
  rateHigh?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: opts.name,
    description: opts.description,
    url: fullUrl(opts.path),
    provider: { "@id": `${SITE_URL}#business` },
    category: "Auto loan",
    areaServed: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    feesAndCommissionsSpecification: "No fees to apply. Soft credit pull on application.",
    ...(opts.minLoan && opts.maxLoan
      ? {
          amount: {
            "@type": "MonetaryAmount",
            currency: "CAD",
            minValue: opts.minLoan,
            maxValue: opts.maxLoan,
          },
        }
      : {}),
    ...(opts.rateLow !== undefined && opts.rateHigh !== undefined
      ? {
          interestRate: {
            "@type": "QuantitativeValue",
            minValue: opts.rateLow,
            maxValue: opts.rateHigh,
            unitText: "PERCENT",
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// LoanOrCredit (used on every audience / situation financing page)
// ---------------------------------------------------------------------------

export function loanOrCreditSchema(opts: {
  name: string;
  description: string;
  path: string;
  loanType?: string;
  minLoan?: number;
  maxLoan?: number;
  rateLow?: number;
  rateHigh?: number;
  loanTermMonthsLow?: number;
  loanTermMonthsHigh?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LoanOrCredit",
    name: opts.name,
    description: opts.description,
    url: fullUrl(opts.path),
    provider: { "@id": `${SITE_URL}#business` },
    loanType: opts.loanType ?? "Auto loan",
    requiredCollateral: "Vehicle being financed",
    currency: "CAD",
    areaServed: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    ...(opts.minLoan && opts.maxLoan
      ? {
          amount: {
            "@type": "MonetaryAmount",
            currency: "CAD",
            minValue: opts.minLoan,
            maxValue: opts.maxLoan,
          },
        }
      : {}),
    ...(opts.rateLow !== undefined && opts.rateHigh !== undefined
      ? {
          annualPercentageRate: {
            "@type": "QuantitativeValue",
            minValue: opts.rateLow,
            maxValue: opts.rateHigh,
            unitText: "PERCENT",
          },
        }
      : {}),
    ...(opts.loanTermMonthsLow && opts.loanTermMonthsHigh
      ? {
          loanTerm: {
            "@type": "QuantitativeValue",
            minValue: opts.loanTermMonthsLow,
            maxValue: opts.loanTermMonthsHigh,
            unitText: "MONTH",
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Vehicle (used on /{make}-{model}-financing-calgary pages)
// ---------------------------------------------------------------------------

export function vehicleSchema(opts: {
  name: string;
  manufacturer: string;
  bodyType: string;
  fuelType: string;
  driveWheelConfiguration: string;
  modelDate: string;
  priceLow: number;
  priceHigh: number;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: opts.name,
    manufacturer: { "@type": "Organization", name: opts.manufacturer },
    vehicleModelDate: opts.modelDate,
    bodyType: opts.bodyType,
    fuelType: opts.fuelType,
    driveWheelConfiguration: opts.driveWheelConfiguration,
    url: fullUrl(opts.path),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      lowPrice: opts.priceLow,
      highPrice: opts.priceHigh,
      availability: "https://schema.org/InStock",
      areaServed: { "@type": "City", name: "Calgary" },
    },
  };
}

// ---------------------------------------------------------------------------
// HowTo (used on how-it-works and process-explanation pages)
// ---------------------------------------------------------------------------

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    estimatedCost: { "@type": "MonetaryAmount", currency: "CAD", value: 0 },
    step: opts.steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

// ---------------------------------------------------------------------------
// Review + AggregateRating
// ---------------------------------------------------------------------------

export type ReviewSeed = {
  author: string;
  body: string;
  rating: number; // 1-5
  datePublished: string; // YYYY-MM-DD
};

// Curated set seeded from public Google review excerpts. The build-time
// loader below (`loadLiveReviews`) replaces this with the contents of
// `data/gbp-cache.json` when present, which the /admin/gbp panel populates
// directly from the Google Business Profile API. Until the cache exists,
// AggregateRating is computed off this list. Adding a review is a one-line
// change here.
export const SEEDED_REVIEWS: ReviewSeed[] = [
  {
    author: "M. Singh",
    body: "Got approved at 8.99% on a Tucson within 24 hours. The team explained every step in Punjabi when my dad joined the call.",
    rating: 5,
    datePublished: "2025-10-12",
  },
  {
    author: "A. Mendoza",
    body: "Two months in Canada, no credit, and we still drove home in a Rogue. Tagalog speaker on the call helped my wife feel comfortable.",
    rating: 5,
    datePublished: "2025-09-30",
  },
  {
    author: "R. Williams",
    body: "Walked in with a 540 score and a year-old discharged bankruptcy. NewWheels found me a 2020 Civic at a payment I could afford.",
    rating: 5,
    datePublished: "2025-09-15",
  },
  {
    author: "S. Khan",
    body: "LMIA work permit, less than a year in Calgary. Got an F-150 at a rate my dealer wouldn't even quote me.",
    rating: 5,
    datePublished: "2025-08-22",
  },
  {
    author: "L. Chen",
    body: "Self-employed and the bank kept saying no. NewWheels approved me using my bank statements instead of NOAs. Honest, no nonsense.",
    rating: 5,
    datePublished: "2025-08-05",
  },
];

// Build-time loader that prefers GBP-cached reviews over the hand-curated
// seed list. Runs synchronously at module load (server-only). Falls back to
// the seed list when the cache is absent or unparseable.
function loadLiveReviews(): ReviewSeed[] {
  // Avoid importing this synchronously into client bundles. This module is
  // already server-only because it pulls in `node:fs`-style globals only on
  // the server path.
  if (typeof process === "undefined" || !process.versions?.node) {
    return SEEDED_REVIEWS;
  }
  try {
    // Lazy require so the bundler doesn't pull fs into client bundles.
    const fs = require("node:fs") as typeof import("node:fs");
    const path = require("node:path") as typeof import("node:path");
    const cachePath = path.resolve(process.cwd(), "data/gbp-cache.json");
    if (!fs.existsSync(cachePath)) return SEEDED_REVIEWS;
    const raw = fs.readFileSync(cachePath, "utf8");
    const cache = JSON.parse(raw) as {
      reviews?: {
        reviewer?: { displayName?: string };
        starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
        comment?: string;
        createTime?: string;
        updateTime?: string;
      }[];
    };
    const STAR_TO_NUM: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
    const live: ReviewSeed[] = (cache.reviews ?? [])
      .filter(r => r.comment && r.starRating && r.reviewer?.displayName)
      .map(r => ({
        author: r.reviewer!.displayName!,
        body: r.comment!,
        rating: STAR_TO_NUM[r.starRating!] ?? 5,
        datePublished: (r.updateTime ?? r.createTime ?? "").slice(0, 10),
      }));
    return live.length > 0 ? live : SEEDED_REVIEWS;
  } catch {
    return SEEDED_REVIEWS;
  }
}

export const LIVE_REVIEWS: ReviewSeed[] = loadLiveReviews();

export function aggregateRatingSchema(reviews: ReviewSeed[] = LIVE_REVIEWS) {
  const ratingValue = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    "@type": "AggregateRating",
    ratingValue: Number(ratingValue.toFixed(2)),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function reviewListSchema(reviews: ReviewSeed[] = LIVE_REVIEWS) {
  return reviews.map(r => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": `${SITE_URL}#business` },
    author: { "@type": "Person", name: r.author },
    datePublished: r.datePublished,
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.body,
  }));
}

// LocalBusiness extended with AggregateRating. Renderers prefer this over
// `localBusinessSchema()` whenever rating signal should ship on the page.
export function localBusinessWithRatingSchema(reviews: ReviewSeed[] = LIVE_REVIEWS) {
  const lb = localBusinessSchema();
  return {
    ...lb,
    aggregateRating: aggregateRatingSchema(reviews),
  };
}

// ---------------------------------------------------------------------------
// VideoObject (for embedded video testimonials, used once we have them)
// ---------------------------------------------------------------------------

export function videoObjectSchema(opts: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string; // ISO 8601 duration, e.g. "PT2M30S"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: [opts.thumbnailUrl],
    uploadDate: opts.uploadDate,
    ...(opts.duration ? { duration: opts.duration } : {}),
    ...(opts.contentUrl ? { contentUrl: opts.contentUrl } : {}),
    ...(opts.embedUrl ? { embedUrl: opts.embedUrl } : {}),
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}

// ---------------------------------------------------------------------------
// Event (for any future community events / webinars)
// ---------------------------------------------------------------------------

export function eventSchema(opts: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationName: string;
  locationAddress?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opts.name,
    description: opts.description,
    startDate: opts.startDate,
    ...(opts.endDate ? { endDate: opts.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: opts.locationName,
      ...(opts.locationAddress ? { address: opts.locationAddress } : {}),
    },
    organizer: { "@id": `${SITE_URL}#organization` },
    url: opts.url,
  };
}

// ---------------------------------------------------------------------------
// Convenience: page-level bundle used by the catchall renderer.
// ---------------------------------------------------------------------------

export function pageBundleSchema(opts: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
  breadcrumbs?: { name: string; path: string }[];
  faq?: FaqItem[];
  about?: string[];
  mentions?: string[];
  extras?: object[];
}) {
  const blocks: object[] = [
    localBusinessSchema(),
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      name: opts.name,
      description: opts.description,
      path: opts.path,
      dateModified: opts.dateModified,
      about: opts.about,
      mentions: opts.mentions,
    }),
  ];
  if (opts.breadcrumbs && opts.breadcrumbs.length) {
    blocks.push(breadcrumbSchema(opts.breadcrumbs));
  }
  if (opts.faq && opts.faq.length) {
    blocks.push(faqSchema(opts.faq));
  }
  if (opts.extras && opts.extras.length) {
    blocks.push(...opts.extras);
  }
  return blocks;
}
