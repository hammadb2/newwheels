import type { ProgrammaticPage } from "../types";
import { LOCATIONS } from "../locations";

// Generates one programmatic page per location. Slug pattern:
// /car-loans-{location-slug-fragment}
//
// Content is genuinely unique per location because we lean on landmarks +
// drive-time-note + buyer-archetype that we hand-wrote in `locations.ts`.

export function generateLocationPages(): ProgrammaticPage[] {
  return LOCATIONS.map((loc): ProgrammaticPage => {
    const slug = `car-loans-${loc.slugFragment}`;
    const isCity = loc.kind === "surrounding-city";
    const cityLabel = isCity ? loc.fullName : `${loc.fullName} (Calgary)`;
    return {
      slug,
      kind: "location",
      category: isCity ? "Surrounding cities" : "Calgary neighbourhoods & quadrants",
      metaTitle: `${loc.shortName} Car Loans | Bad Credit & Newcomers Approved`,
      metaDescription: `Car loans for ${cityLabel} buyers — bad credit, newcomers, work-permit, and self-employed approved in 24 hours. Up to 6 months covered on qualified deals.`,
      h1: `Car loans in ${loc.fullName}`,
      tagline: isCity ? "Surrounding city" : "Calgary location",
      intro: `NewWheels finances ${loc.shortName} buyers including those with bad credit, no Canadian credit, work permits, bankruptcy history, and self-employed income. Approval typically lands in 24 hours and a specialist calls within an hour of application. ${loc.buyerArchetype}`,
      sections: [
        {
          heading: `Why ${loc.shortName} buyers come to NewWheels`,
          paragraphs: [
            `${loc.shortName} concentrates a specific buyer pattern: ${loc.buyerArchetype.toLowerCase()} ${loc.driveTimeNote}`,
            `That mix changes which lender gives the best rate. National brokers ignore it; we don't. Every ${loc.shortName} application is matched to the single Calgary-friendly lender most likely to approve at the lowest rate, not blasted to five at once.`,
          ],
        },
        {
          heading: `${loc.shortName} landmarks NewWheels serves`,
          paragraphs: [
            `If you're shopping near ${loc.landmarks.slice(0, 3).join(", ")}, or ${loc.landmarks.slice(3).join(" or ") || "anywhere in " + loc.shortName}, NewWheels' specialist runs the paperwork remotely. You only show up for vehicle delivery and final signing.`,
          ],
          bullets: loc.landmarks.map(landmark => `Walk-up and remote service across ${landmark}`),
        },
        {
          heading: `What ${loc.shortName} applicants typically need`,
          paragraphs: [
            `Documentation is short. We collect just enough to match you to the right lender without damaging your bureau with unnecessary pulls.`,
          ],
          bullets: [
            "Valid Alberta driver's licence",
            "Two most-recent pay stubs (or NOAs / bank statements for self-employed)",
            `Proof of ${loc.shortName} residence (utility bill, lease, or government ID)`,
            "Passport + permit (if newcomer)",
          ],
        },
        {
          heading: `${loc.shortName} buyer financing situations we approve`,
          paragraphs: [`Every situation routes to a different best-fit lender. We approve all of them through one NewWheels application:`],
          bullets: [
            `${loc.shortName} bad-credit and credit-rebuild applications`,
            `${loc.shortName} newcomer households without Canadian credit`,
            `${loc.shortName} work-permit holders (LMIA, PGWP, open permit, TFW)`,
            `${loc.shortName} bankruptcy and consumer proposal applications`,
            `${loc.shortName} self-employed and gig-worker income`,
          ],
        },
      ],
      faq: [
        {
          question: `Can I get a car loan in ${loc.shortName} with bad credit?`,
          answer: `Yes. ${loc.shortName} buyers with sub-600 credit are approved through our sub-prime partner lenders every week. Rates run 13.99–19.99% depending on income and down payment. Apply free with a soft pull and we route the file to the single best-fit lender.`,
        },
        {
          question: `Can newcomers in ${loc.shortName} get a car loan without Canadian credit?`,
          answer: `Yes. Newcomer programs from Nissan, Toyota, Hyundai, and a small set of alternative-prime lenders approve newcomers in ${loc.shortName} without Canadian bureau history. Rates run 8.99–14.99% depending on visa type and employment stability.`,
        },
        {
          question: `Does NewWheels actually serve ${loc.shortName}?`,
          answer: `Yes. We serve every Calgary quadrant plus Airdrie, Cochrane, Okotoks, Chestermere, Strathmore, High River, Crossfield, and Carstairs. Most of the application is handled remotely — you only visit for final signing and vehicle delivery.`,
        },
        {
          question: `How fast is an approval in ${loc.shortName}?`,
          answer: `A specialist calls within 1 hour of application during business hours and approvals typically land within 24 hours. Same-day approvals are common for clean files.`,
        },
        {
          question: `Will applying from ${loc.shortName} hurt my credit?`,
          answer: `No. Applications use a soft pull. Only the final lender submission triggers a hard pull, and that only happens after you confirm the terms.`,
        },
        {
          question: `Where do I pick up my vehicle if I'm in ${loc.shortName}?`,
          answer: `Vehicle delivery is coordinated through dealer partners across Calgary. We do as much remotely as possible. Final signing and delivery happen at the dealer your specialist matches you with.`,
        },
      ],
      related: [
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
        { href: "/calculator", label: "Estimate your payment" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ],
      ctaHeading: `${loc.shortName} car loan. Apply free, no obligation.`,
      priority: isCity ? 0.75 : 0.8,
    };
  });
}
