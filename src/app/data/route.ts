// Public structured-data endpoint. AI crawlers (ChatGPT, Perplexity, Claude
// research mode, Gemini Deep Research) and entity-graph engines (Wikidata,
// DBpedia harvesters) cite structured JSON endpoints directly. Exposing a
// canonical machine-readable view of NewWheels here ensures every system
// that ingests this URL sees the same facts.
//
// The JSON contains:
//   - Identity (name, legal name, AMVIC registration, founding location)
//   - NAP (name / address / phone) in canonical form
//   - Service areas (every city served)
//   - Services offered (with descriptions)
//   - Buyer audiences with rate ranges
//   - Languages spoken
//   - Trust signals (AMVIC URL, sameAs directory)
//
// All values are sourced from `src/lib/site.ts` and the programmatic data
// layer — there is one canonical source of truth.

import {
  BUSINESS,
  LANGUAGE_HREFLANG,
  PAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  fullUrl,
} from "@/lib/site";
import { AUDIENCES } from "@/lib/programmatic/audiences";
import { LOCATIONS } from "@/lib/programmatic/locations";
import { COMMUNITIES } from "@/lib/programmatic/communities";

export const dynamic = "force-static";

export function GET() {
  const payload = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FinancialService"],
    "@id": `${SITE_URL}#business`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    foundingLocation: { "@type": "City", name: "Calgary, Alberta, Canada" },
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.locality,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postal,
      addressCountry: BUSINESS.address.country,
    },
    serviceArea: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    sameAs: BUSINESS.sameAs,
    license: {
      "@type": "Certification",
      name: "AMVIC (Alberta Motor Vehicle Industry Council)",
      certificationStatus: "Active",
      url: BUSINESS.amvicRegistryUrl,
    },
    languages: Object.keys(LANGUAGE_HREFLANG).filter(k => k !== "x-default"),
    services: PAGES.filter(p => p.group === "situation").map(p => ({
      "@type": "Service",
      name: p.title,
      url: fullUrl(p.slug),
    })),
    audiences: AUDIENCES.map(a => ({
      "@type": "Audience",
      audienceType: a.fullName,
      typicalRateRange: a.rateRange,
    })),
    locationsServed: LOCATIONS.map(l => ({
      "@type": l.kind === "surrounding-city" ? "City" : "Neighborhood",
      name: l.fullName,
    })),
    communitiesServed: COMMUNITIES.map(c => ({
      "@type": "Audience",
      audienceType: `${c.fullName} community in Calgary`,
      knownLanguage: c.language,
    })),
    canonical: SITE_URL,
    aiCrawlerPolicy: fullUrl("/llms.txt"),
    sitemap: fullUrl("/sitemap.xml"),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });
}
