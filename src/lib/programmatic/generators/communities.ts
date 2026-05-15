import type { ProgrammaticPage } from "../types";
import { COMMUNITIES } from "../communities";

// Generates one programmatic page per Calgary newcomer community segment.
// Slug pattern: /{community-slug-fragment}-car-loans-calgary

export function generateCommunityPages(): ProgrammaticPage[] {
  return COMMUNITIES.map((c): ProgrammaticPage => {
    const slug = `${c.slugFragment}-car-loans-calgary`;
    return {
      slug,
      kind: "community",
      category: "Calgary community segments",
      metaTitle: `${c.shortName} Car Loans Calgary | No Canadian Credit Approved`,
      metaDescription: `${c.shortName} car loans in Calgary — newcomer programs, work-permit financing, and family co-signing. Approval in 24 hours. ${c.language} support available.`,
      h1: `Car loans for the ${c.fullName}`,
      tagline: `${c.shortName} community`,
      intro: `NewWheels finances ${c.shortName} households across Calgary, including newcomers without Canadian credit, work-permit holders, and family-class PR buyers. ${c.cultureNotes}`,
      sections: [
        {
          heading: `Why the ${c.shortName} community comes to NewWheels`,
          paragraphs: [
            `Calgary's ${c.shortName} community concentrates in ${c.primaryCalgaryNeighbourhoods.join(", ")} — close to the largest newcomer hubs in the city.`,
            `National brokers treat every newcomer file identically. They blast the application to five lenders, damage the bureau with hard pulls, and produce a generic approval. NewWheels matches each ${c.shortName} application to the single best-fit Calgary lender given the visa pathway, household structure, and target vehicle.`,
          ],
        },
        {
          heading: `Visa pathways we routinely approve`,
          paragraphs: [`Every visa type maps to a different lender. We've approved each of the pathways below in the last 90 days.`],
          bullets: c.visaPathways.map(p => `${p} financing — pre-screened against the best-fit lender's documentation list`),
        },
        {
          heading: `${c.shortName} household financing patterns we handle`,
          paragraphs: [c.cultureNotes],
          bullets: [
            "Co-signed applications using a Canadian PR family member",
            "Multi-household income consolidation (caregiver + PGWP child + working spouse)",
            "Stated-income / bank-statement-based files where the NOA understates real cash flow",
            "Newcomer-program rates that beat third-party sub-prime by 3–5 points",
          ],
        },
        {
          heading: `Documentation we ask ${c.shortName} applicants for`,
          paragraphs: [`The shorter list a lender accepts, the faster the approval. Bring the items below; we handle the rest.`],
          bullets: [
            "Passport + visa or PR card",
            "Job offer or employment letter (or last 2 NOAs if self-employed)",
            "Two most-recent pay stubs (or 90 days of bank statements)",
            "Proof of Calgary address",
            "Calgary driver's licence",
          ],
        },
      ],
      faq: [
        {
          question: `Can ${c.shortName} newcomers get a car loan in Calgary without Canadian credit?`,
          answer: `Yes. Calgary lenders run dedicated newcomer programs that don't require Canadian bureau history. ${c.shortName} families are approved at rates between 8.99% and 14.99% depending on visa type, employment stability, and down payment.`,
        },
        {
          question: `Does NewWheels offer ${c.language} support?`,
          answer: `We can connect ${c.shortName} families with a specialist who speaks ${c.language} or English-with-${c.language}-context. The Calgary specialist team is built for newcomer files and works through documentation in plain language.`,
        },
        {
          question: `Can a family member with Canadian credit co-sign for me?`,
          answer: `Yes. ${c.shortName} families frequently co-sign for newly arrived PR or work-permit relatives. A co-signer with established Canadian credit usually drops the rate by 2–5 points compared to a stand-alone newcomer application.`,
        },
        {
          question: `Where do most ${c.shortName} buyers live in Calgary?`,
          answer: `Calgary's ${c.shortName} community concentrates in ${c.primaryCalgaryNeighbourhoods.slice(0, 4).join(", ")}. NewWheels serves every Calgary quadrant plus Airdrie, Cochrane, and the surrounding cities — vehicle delivery is coordinated through dealer partners closest to your address.`,
        },
        {
          question: `What documents do ${c.shortName} applicants typically need?`,
          answer: `Passport, valid visa or PR card, employment letter or two recent pay stubs, 90 days of bank statements, and proof of Calgary address. Newcomer programs add a recent landing date check and sometimes a Canadian co-signer for thin-file applicants.`,
        },
        {
          question: `Is the application free?`,
          answer: `Yes. The application is free and uses a soft credit pull. Only the final lender submission triggers a hard pull, after you confirm the terms.`,
        },
      ],
      related: [
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans" },
        { href: "/calculator", label: "Estimate your payment" },
        { href: "/about", label: "About NewWheels" },
      ],
      ctaHeading: `${c.shortName} car loan in Calgary. Apply free, no obligation.`,
      priority: 0.8,
    };
  });
}
