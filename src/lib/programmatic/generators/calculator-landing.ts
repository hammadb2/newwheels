import type { ProgrammaticPage } from "../types";
import { AUDIENCES } from "../audiences";
import { VEHICLE_TYPES } from "../vehicle-types";
import { VEHICLE_MAKES } from "../vehicle-makes";
import { fullUrl } from "@/lib/site";

// Calculator-as-SEO-asset pages. Each is a calculator landing page for a
// specific segment, render full content around the same calculator component,
// and carry SoftwareApplication schema with a segment-specific name.

type Seed = {
  slug: string;
  segmentLabel: string; // human label injected into copy
  prefill?: Record<string, string>;
  metaTitle: string;
  metaDescription: string;
};

function audienceSeeds(): Seed[] {
  return AUDIENCES.filter(a => ["bad-credit", "newcomer", "work-permit", "self-employed", "first-time-buyer"].includes(a.id)).map(a => ({
    slug: `car-payment-calculator-${a.slugFragment}-calgary`,
    segmentLabel: a.shortName,
    metaTitle: `${capitalize(a.shortName)} Car Payment Calculator Calgary | NewWheels`,
    metaDescription: `Calgary car payment calculator tuned to ${a.shortName} rate ranges (${a.rateRange}). Estimate weekly, bi-weekly, and monthly payments. Apply free.`,
  }));
}

function vehicleTypeSeeds(): Seed[] {
  return VEHICLE_TYPES.filter(v => ["truck", "suv", "ev"].includes(v.id)).map(v => ({
    slug: `${v.slugFragment}-payment-calculator-calgary`,
    segmentLabel: v.shortName,
    metaTitle: `${capitalize(v.shortName)} Payment Calculator Calgary | Estimate Yours`,
    metaDescription: `Estimate a Calgary ${v.shortName} payment across credit tiers, terms, and down payments. Bad credit, newcomers, work-permit approved. Apply free.`,
  }));
}

function makeSeeds(): Seed[] {
  return VEHICLE_MAKES.filter(m => ["toyota", "honda", "ford", "hyundai", "kia"].includes(m.id)).map(m => ({
    slug: `${m.slugFragment}-payment-calculator-calgary`,
    segmentLabel: m.fullName,
    metaTitle: `${m.fullName} Payment Calculator Calgary | NewWheels`,
    metaDescription: `Estimate a Calgary ${m.fullName} payment with realistic rate ranges per credit tier. Bad credit, newcomers, work-permit approved. Apply free.`,
  }));
}

export function generateCalculatorLandingPages(): ProgrammaticPage[] {
  const seeds = [...audienceSeeds(), ...vehicleTypeSeeds(), ...makeSeeds()];
  return seeds.map((s): ProgrammaticPage => ({
    slug: s.slug,
    kind: "calculator",
    category: "Calculator landing pages",
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    h1: `${capitalize(s.segmentLabel)} car payment calculator — Calgary`,
    tagline: "Calculator",
    intro: `Estimate the ${s.segmentLabel} car payment in Calgary using realistic rate ranges. Apply free once the payment lands where you need it — soft pull, specialist callback within 1 hour.`,
    sections: [
      {
        heading: `How the ${s.segmentLabel} calculator works`,
        paragraphs: [
          `Pick a credit tier, set a vehicle price, choose a term, and the calculator returns weekly, bi-weekly, and monthly payment estimates. Calgary-specific GST (5%) is included. The rate range slider reflects realistic Calgary lender pricing per tier.`,
        ],
      },
      {
        heading: `What the ${s.segmentLabel} payment depends on`,
        paragraphs: [`Four levers move the monthly payment.`],
        bullets: [
          `Vehicle price (and Alberta GST 5%, no PST)`,
          `Term (24–96 months)`,
          `Rate (depends on credit tier and lender match)`,
          `Down payment + trade-in equity`,
        ],
      },
    ],
    faq: [
      { question: `Is the ${s.segmentLabel} calculator accurate for Calgary?`, answer: `It's an estimate. Real rate depends on credit profile, lender match, vehicle, and current incentives. Apply free for the actual number.` },
      { question: `What credit tier should I pick?`, answer: `Pick the tier that matches your current bureau. If you're not sure, pick "Fair" — the soft-pull application returns the exact rate within 24 hours.` },
      { question: `Are these rates realistic for Calgary?`, answer: `Yes. Ranges reflect current Calgary lender pricing per tier. Newcomer programs and OEM finance arms occasionally beat the displayed sub-prime range by 2–5 points.` },
      { question: `Can I save my estimate?`, answer: `Yes. Apply free; the calculator scenario is attached to your file when the specialist calls back.` },
      { question: `What if my situation isn't on the list?`, answer: `Apply anyway. We approve every credit and visa profile through one application; the specialist routes the file correctly during the 1-hour callback.` },
      { question: `How accurate is the bi-weekly payment?`, answer: `Bi-weekly is calculated as monthly / 2.1667 — the standard lender split. It's accurate within a dollar or two for most loans.` },
    ],
    related: [
      { href: "/calculator", label: "Full Calgary car payment calculator" },
      { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
      { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
      { href: "/how-it-works", label: "How NewWheels works" },
    ],
    ctaHeading: `${capitalize(s.segmentLabel)} car payment in Calgary. Apply free.`,
    extraSchema: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: `${capitalize(s.segmentLabel)} car payment calculator — Calgary`,
        operatingSystem: "Any",
        applicationCategory: "FinanceApplication",
        url: fullUrl(`/${s.slug}`),
        offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
      },
    ],
    priority: 0.78,
  }));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
