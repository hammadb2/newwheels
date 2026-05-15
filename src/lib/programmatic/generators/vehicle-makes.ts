import type { ProgrammaticPage } from "../types";
import { VEHICLE_MAKES } from "../vehicle-makes";

// Generates `/{make}-financing-calgary` for every major OEM sold in Calgary.
// Note: `/nissan-financing-calgary` already exists as a hand-built page so we
// skip it from the programmatic catchall (else Next.js would fight us — the
// static route wins anyway, but skipping keeps the registry honest).

export function generateVehicleMakePages(): ProgrammaticPage[] {
  return VEHICLE_MAKES.filter(m => m.slugFragment !== "nissan").map((m): ProgrammaticPage => {
    const slug = `${m.slugFragment}-financing-calgary`;
    return {
      slug,
      kind: "vehicle-make",
      category: "Vehicle makes",
      metaTitle: `${m.fullName} Financing Calgary | New & Used ${m.shortName} Loans`,
      metaDescription: `Finance a new or used ${m.fullName} in Calgary. Bad credit, newcomers, and work-permit approved. ${m.financeProgram}. Apply free, approval in 24 hours.`,
      h1: `${m.fullName} financing in Calgary`,
      tagline: `${m.fullName} financing`,
      intro: `NewWheels finances new and used ${m.fullName} vehicles in Calgary through ${m.financeProgram}. Bad credit, newcomers, work-permit holders, and self-employed buyers are all approved through the same application. ${m.brandNote}`,
      sections: [
        {
          heading: `Why finance a ${m.fullName} in Calgary through NewWheels`,
          paragraphs: [
            `${m.calgaryNote}`,
            `Through ${m.financeProgram}, ${m.fullName} financing rates routinely beat third-party sub-prime quotes — especially for newcomer and first-time-buyer applicants. We match each application to the OEM finance program plus a back-up alternative-prime lender so the approval lands in 24 hours with the lowest rate on the file.`,
          ],
        },
        {
          heading: `Top ${m.fullName} models we finance`,
          paragraphs: [`Calgary buyers concentrate around the models below. We finance each new, used, or certified-pre-owned.`],
          bullets: m.topModels.map(model => `${m.fullName} ${model}: financing available new, used, and CPO`),
        },
        {
          heading: `${m.fullName} financing situations we approve`,
          paragraphs: [`Each situation routes to a different lender within the ${m.fullName} financing stack. We pick the lender most likely to approve at the lowest rate.`],
          bullets: [
            `${m.fullName} financing with bad credit (sub-600 score)`,
            `${m.fullName} financing for newcomers without Canadian credit`,
            `${m.fullName} financing on LMIA, PGWP, open, and TFW work permits`,
            `${m.fullName} financing after bankruptcy or consumer proposal`,
            `${m.fullName} financing for self-employed and gig-worker income`,
          ],
        },
        {
          heading: `How NewWheels approves ${m.fullName} buyers in 24 hours`,
          paragraphs: [
            `Step 1 — apply free with a soft credit pull. Step 2 — a specialist calls within 1 hour during business hours to confirm the file. Step 3 — we route to ${m.financeProgram} (or the right back-up lender) and the approval lands within 24 hours. Step 4 — final signing and vehicle delivery is coordinated at the partner dealership closest to your Calgary address.`,
          ],
        },
      ],
      faq: [
        {
          question: `Can I finance a ${m.fullName} in Calgary with bad credit?`,
          answer: `Yes. Calgary sub-prime lenders approve ${m.fullName} financing on most models. Rates run 13.99–19.99% depending on score, income, term, and down payment. Apply free with a soft pull.`,
        },
        {
          question: `Can newcomers without Canadian credit finance a ${m.fullName}?`,
          answer: `Yes. ${m.financeProgram} approves newcomer applicants on most ${m.fullName} models. Approval rates run 8.99–14.99% depending on visa type and employment stability — and often beat third-party sub-prime by 3–5 points.`,
        },
        {
          question: `What are current ${m.fullName} promotions in Calgary?`,
          answer: `Programs change monthly. Recent ${m.fullName} promotions have included quarter-end cash incentives, low-rate financing on outgoing model-year inventory, and newcomer-program rate sheets. We confirm the current month's promotions on the call.`,
        },
        {
          question: `Can I finance a used ${m.fullName} through NewWheels?`,
          answer: `Yes. We finance used and certified-pre-owned ${m.fullName} vehicles. CPO inventory often beats used rates by 2–3 points because of the OEM-backed extended warranty.`,
        },
        {
          question: `What ${m.fullName} models does NewWheels handle?`,
          answer: `We finance the full ${m.fullName} lineup. Top sellers in Calgary include ${m.topModels.slice(0, 5).join(", ")}.`,
        },
        {
          question: `Is leasing or financing better for a ${m.fullName} in Calgary?`,
          answer: `Depends on annual kilometres. Under 15,000 km/year drivers often save by leasing. Calgary commuters from Airdrie or Cochrane usually finance. We model both on the calculator so you can pick.`,
        },
      ],
      related: [
        { href: "/calculator", label: `Estimate your ${m.shortName} payment` },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ],
      ctaHeading: `New or used ${m.shortName} in Calgary. Apply free.`,
      priority: 0.85,
    };
  });
}
