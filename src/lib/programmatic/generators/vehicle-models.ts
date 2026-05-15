import type { ProgrammaticPage } from "../types";
import { VEHICLE_MODELS } from "../vehicle-models";
import { VEHICLE_MAKES } from "../vehicle-makes";
import { fullUrl } from "@/lib/site";

// Generates `/{make}-{model}-financing-calgary` for each top model. Each page
// carries Vehicle + FinancialProduct schema.

function makeShortName(makeId: string): string {
  return VEHICLE_MAKES.find(m => m.id === makeId)?.fullName ?? makeId;
}

export function generateVehicleModelPages(): ProgrammaticPage[] {
  return VEHICLE_MODELS.map((v): ProgrammaticPage => {
    const slug = `${v.slugFragment}-financing-calgary`;
    const make = makeShortName(v.make);
    return {
      slug,
      kind: "vehicle-model",
      category: "Vehicle models",
      metaTitle: `${v.fullName} Financing Calgary | New & Used ${v.shortName} Loans`,
      metaDescription: `Finance a new, used, or CPO ${v.fullName} in Calgary. Bad credit, newcomers, and work-permit approved. Estimate the payment, then apply free.`,
      h1: `${v.fullName} financing in Calgary`,
      tagline: `${v.shortName} financing`,
      intro: `NewWheels finances new, used, and certified-pre-owned ${v.fullName} models in Calgary across credit profiles. ${v.calgaryAngle}`,
      sections: [
        {
          heading: `Why the ${v.shortName} is a strong Calgary pick`,
          paragraphs: [
            `${v.calgaryAngle}`,
            `Body type: ${v.bodyType}. Fuel: ${v.fuelType}. Drivetrain: ${v.driveWheelConfig}. Calgary price range: $${v.approxPriceRange[0].toLocaleString()}–$${v.approxPriceRange[1].toLocaleString()}.`,
          ],
        },
        {
          heading: `${v.shortName} financing programs we route to`,
          paragraphs: [
            `${make} financing through NewWheels routes through the OEM finance arm first (often the cheapest rate), and falls through to alternative-prime or sub-prime lenders if the file is outside OEM eligibility. We confirm the right route during the 1-hour callback after you apply.`,
          ],
          bullets: [
            `OEM finance program for prime and near-prime applicants`,
            `Newcomer-program rates for PGWP, LMIA, and PR holders without Canadian credit`,
            `Alternative-prime lenders for thin-file and self-employed buyers`,
            `Sub-prime fallback for sub-600 score and post-bankruptcy applicants`,
          ],
        },
        {
          heading: `${v.shortName} buyer situations we approve`,
          paragraphs: [`Each situation routes to a different finance program. Apply once and we pick the best fit.`],
          bullets: [
            `${v.shortName} financing with bad credit`,
            `${v.shortName} newcomer financing (no Canadian credit required)`,
            `${v.shortName} financing on a work permit`,
            `${v.shortName} financing after bankruptcy or consumer proposal`,
            `${v.shortName} financing for self-employed buyers`,
          ],
        },
      ],
      faq: [
        {
          question: `Can I finance a ${v.fullName} in Calgary with bad credit?`,
          answer: `Yes. Bad-credit ${v.shortName} financing routes through sub-prime partners. Rates run 13.99–19.99%. Apply free and we route the file to the single best-fit Calgary lender.`,
        },
        {
          question: `Can newcomers finance a ${v.fullName} in Calgary without Canadian credit?`,
          answer: `Yes. ${make}'s newcomer program approves PGWP, LMIA, and PR applicants on most ${v.shortName} trims at rates between 8.99% and 14.99% — typically below third-party sub-prime.`,
        },
        {
          question: `What's a realistic monthly payment for a ${v.fullName} in Calgary?`,
          answer: `Depends on price, term, and rate. Use the NewWheels calculator at /calculator to model a ${v.shortName} payment across credit tiers, terms, and down payments.`,
        },
        {
          question: `Can I finance a used ${v.fullName} through NewWheels?`,
          answer: `Yes. We finance used and certified-pre-owned ${v.shortName} inventory. CPO units often finance 2–3 points below comparable used cars because of the OEM-backed extended warranty.`,
        },
        {
          question: `Is the ${v.shortName} a good Calgary winter vehicle?`,
          answer: `${v.driveWheelConfig.includes("AWD") || v.driveWheelConfig.includes("4×4") ? `Yes. ${v.driveWheelConfig} handles Calgary winter well.` : `FWD trims of the ${v.shortName} handle Calgary winter with proper winter tires; AWD trims (where available) handle it better.`}`,
        },
        {
          question: `How fast is approval on a ${v.shortName}?`,
          answer: `Approval typically lands within 24 hours of application during business hours. A specialist calls within 1 hour to confirm the file and route it to the right lender.`,
        },
      ],
      related: [
        { href: `/${VEHICLE_MAKES.find(m => m.id === v.make)?.slugFragment ?? "toyota"}-financing-calgary`, label: `${make} financing Calgary` },
        { href: "/calculator", label: `Estimate your ${v.shortName} payment` },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
      ],
      ctaHeading: `${v.fullName} in Calgary. Apply free, no obligation.`,
      // Vehicle + FinancialProduct schema attached.
      extraSchema: [
        {
          "@context": "https://schema.org",
          "@type": "Vehicle",
          name: v.fullName,
          manufacturer: { "@type": "Organization", name: make },
          vehicleModelDate: v.modelDate,
          bodyType: v.bodyType,
          fuelType: v.fuelType,
          driveWheelConfiguration: v.driveWheelConfig,
          url: fullUrl(`/${slug}`),
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "CAD",
            lowPrice: v.approxPriceRange[0],
            highPrice: v.approxPriceRange[1],
            availability: "https://schema.org/InStock",
            areaServed: { "@type": "City", name: "Calgary" },
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FinancialProduct",
          name: `${v.fullName} financing in Calgary`,
          provider: { "@type": "Organization", name: "NewWheels" },
          category: "Vehicle loan",
          areaServed: { "@type": "City", name: "Calgary" },
          url: fullUrl(`/${slug}`),
        },
      ],
      priority: 0.85,
    };
  });
}
