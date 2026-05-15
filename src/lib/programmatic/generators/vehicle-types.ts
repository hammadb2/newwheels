import type { ProgrammaticPage } from "../types";
import { VEHICLE_TYPES } from "../vehicle-types";

// Generates `/{type}-financing-calgary` for each vehicle type
// (SUV, truck, sedan, minivan, crossover, EV, hybrid, used, new, CPO).

export function generateVehicleTypePages(): ProgrammaticPage[] {
  return VEHICLE_TYPES.map((v): ProgrammaticPage => {
    const slug = `${v.slugFragment}-financing-calgary`;
    return {
      slug,
      kind: "vehicle-type",
      category: "Vehicle types",
      metaTitle: `${capitalize(v.fullName)} Financing Calgary | NewWheels`,
      metaDescription: `Finance a ${v.fullName} in Calgary. Bad credit, newcomers, work-permit, and self-employed approved. Up to 6 months covered on qualified deals. Apply free.`,
      h1: `${capitalize(v.fullName)} financing in Calgary`,
      tagline: capitalize(v.shortName),
      intro: `NewWheels finances ${v.fullName}s in Calgary across credit profiles, visa types, and income situations. ${v.useCase} ${v.calgaryFitNote}`,
      sections: [
        {
          heading: `Why a ${v.shortName} works in Calgary`,
          paragraphs: [v.calgaryFitNote, `${capitalize(v.useCase)}`],
        },
        {
          heading: `${v.shortName} financing situations we approve`,
          paragraphs: [`We approve every credit profile against the right lender — not the same lender for every file.`],
          bullets: [
            `${v.shortName} financing with bad credit`,
            `${v.shortName} financing for newcomers without Canadian credit`,
            `${v.shortName} financing for work-permit holders`,
            `${v.shortName} financing for self-employed and gig-worker income`,
            `${v.shortName} financing after bankruptcy or consumer proposal`,
          ],
        },
        {
          heading: `Calgary ${v.shortName} buyer tips`,
          paragraphs: [
            `${v.calgaryFitNote}`,
            `Calgary's no-PST advantage means a ${v.shortName} purchase here is roughly $2,100 cheaper than the same vehicle in BC and $2,400 cheaper than Ontario before financing. That saving stretches further on a ${v.shortName} financed at the right rate.`,
          ],
        },
      ],
      faq: [
        {
          question: `Can I finance a ${v.fullName} in Calgary with bad credit?`,
          answer: `Yes. Sub-prime ${v.shortName} financing in Calgary lands rates between 13.99% and 19.99% depending on score, income, and down payment. Apply free with a soft pull.`,
        },
        {
          question: `Can newcomers finance a ${v.fullName} in Calgary without Canadian credit?`,
          answer: `Yes. Manufacturer-backed newcomer programs and alternative-prime newcomer lenders approve ${v.shortName} financing for PGWP, LMIA, and new PR applicants between 8.99% and 14.99%.`,
        },
        {
          question: `What's a realistic monthly payment for a ${v.fullName}?`,
          answer: `Depends on price, term, and rate. Use the NewWheels calculator at /calculator to model the payment across credit tiers, terms, and down payments.`,
        },
        {
          question: `Is the ${v.shortName} a good Calgary choice?`,
          answer: v.calgaryFitNote,
        },
        {
          question: `Can I finance a used ${v.fullName} through NewWheels?`,
          answer: `Yes. We finance used, certified-pre-owned, and new ${v.fullName}s. CPO units often finance 2–3 points below comparable used inventory.`,
        },
        {
          question: `How fast is approval on a ${v.shortName}?`,
          answer: `Approval typically lands within 24 hours of application. A specialist calls within 1 hour during business hours to confirm the file.`,
        },
      ],
      related: [
        { href: "/calculator", label: `Estimate your ${v.shortName} payment` },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ],
      ctaHeading: `${capitalize(v.fullName)} financing in Calgary. Apply free.`,
      priority: 0.8,
    };
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
