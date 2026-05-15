import type { ProgrammaticPage } from "../types";
import { INTENTS, SEASONALS } from "../intents";

export function generateIntentPages(): ProgrammaticPage[] {
  return INTENTS.map((i): ProgrammaticPage => {
    const slug = `${i.slugFragment}-calgary`;
    return {
      slug,
      kind: "intent",
      category: "Buyer intents",
      metaTitle: `${i.fullName} in Calgary | NewWheels Financing`,
      metaDescription: `${i.fullName} in Calgary — financing across credit profiles, with Calgary-specific guidance for every buyer type. Apply free, soft pull.`,
      h1: `${i.fullName} in Calgary`,
      tagline: i.shortName,
      intro: `${i.intent} ${i.calgaryAngle} NewWheels handles every situation through one application.`,
      sections: [
        {
          heading: `How NewWheels handles "${i.shortName}" in Calgary`,
          paragraphs: [
            i.calgaryAngle,
            `A NewWheels specialist runs the math and the credit fit together. The application is free, uses a soft pull, and the specialist calls back within 1 hour during business hours.`,
          ],
        },
        {
          heading: `Credit profiles we approve`,
          paragraphs: [`Each credit profile maps to a different best-fit Calgary lender, even within the same intent.`],
          bullets: [
            `Prime and near-prime — OEM finance arms`,
            `Newcomers without Canadian credit — manufacturer-backed newcomer programs`,
            `Sub-600 credit — sub-prime partner lenders`,
            `Self-employed and gig income — stated-income and bank-statement lenders`,
            `Post-bankruptcy and post-proposal — niche specialist lenders`,
          ],
        },
        {
          heading: `Calgary-specific factors that change the answer`,
          paragraphs: [
            `Alberta's no-PST advantage saves Calgary buyers ~$2,100 vs BC and ~$2,400 vs Ontario on a $30,000 vehicle. Calgary winter shifts the AWD vs FWD calculation, and high annual kilometres on long commutes from Airdrie or Cochrane often tip the lease-vs-buy answer toward financing.`,
            `${i.calgaryAngle}`,
          ],
        },
      ],
      faq: [
        {
          question: `${i.fullName} in Calgary — how does NewWheels handle it?`,
          answer: `${i.calgaryAngle} A specialist runs the math and the lender match together, then walks you through the trade-offs on the call.`,
        },
        {
          question: `What's the soft-pull process?`,
          answer: `Applications use a soft credit pull that doesn't damage your score. Only the final lender submission triggers a hard pull, after you confirm the terms.`,
        },
        {
          question: `How fast is approval?`,
          answer: `Approval typically lands within 24 hours of application. A specialist calls within 1 hour during business hours to confirm the file.`,
        },
        {
          question: `Can I do this with bad credit?`,
          answer: `Yes. Sub-prime financing in Calgary lands between 13.99% and 19.99%. Apply free with a soft pull and we route the file to the single best-fit sub-prime lender.`,
        },
        {
          question: `Does the 6-months-covered offer apply?`,
          answer: `On qualifying deals, yes. The amount depends on the deal structure. The specialist explains it before you sign.`,
        },
        {
          question: `Where do I pick up the vehicle?`,
          answer: `Vehicle delivery is coordinated through dealer partners closest to your Calgary address. Most of the paperwork is remote — you only show up for final signing and delivery.`,
        },
      ],
      related: [
        { href: "/calculator", label: "Estimate your payment" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/how-it-works", label: "How NewWheels works" },
        { href: "/about", label: "About NewWheels" },
      ],
      ctaHeading: `${i.fullName} in Calgary. Apply free.`,
      priority: 0.78,
    };
  });
}

export function generateSeasonalPages(): ProgrammaticPage[] {
  return SEASONALS.map((s): ProgrammaticPage => {
    const slug = `${s.slugFragment}-calgary`;
    return {
      slug,
      kind: "seasonal",
      category: "Seasonal & timing",
      metaTitle: `${s.fullName} | NewWheels`,
      metaDescription: `${s.fullName} — Calgary-specific guidance for ${s.monthsActive}. NewWheels finances bad credit, newcomers, and work-permit applicants through one application.`,
      h1: s.fullName,
      tagline: s.shortName,
      intro: `${s.calgaryAngle} NewWheels covers this seasonal window (${s.monthsActive}) for Calgary buyers across credit profiles.`,
      sections: [
        {
          heading: `Why ${s.shortName} matters in Calgary`,
          paragraphs: [s.calgaryAngle, `Timing the application correctly inside the ${s.monthsActive} window often unlocks a 1–3 point rate improvement and stacks with OEM cash incentives.`],
        },
        {
          heading: `What NewWheels does inside this window`,
          paragraphs: [`Our specialist watches OEM and partner-lender incentive calendars across the ${s.monthsActive} window so each application lands at the cheapest moment.`],
          bullets: [
            `Quarter-end OEM incentive matching (Ford Credit, GM Financial, Toyota Financial, Hyundai Capital)`,
            `Outgoing model-year inventory clearance routing`,
            `Tax-refund-down-payment optimisation (Feb–May)`,
            `Winter-tire package rolled into the loan (Oct–Dec)`,
          ],
        },
      ],
      faq: [
        {
          question: `Is ${s.shortName} actually a better time to buy a car in Calgary?`,
          answer: `Yes, with caveats. Some windows (year-end, tax-refund season) consistently produce cheaper deals; others depend on the specific OEM's incentive calendar. NewWheels tracks the calendar so your application lands at the right moment.`,
        },
        {
          question: `Should I wait for ${s.shortName} or apply now?`,
          answer: `Applying now is free. The soft-pull pre-approval doesn't expire, so you can lock in your file and the specialist tells you whether to wait for ${s.shortName} or close immediately.`,
        },
        {
          question: `Can I get the seasonal rate with bad credit?`,
          answer: `Some seasonal incentives are credit-tier-specific (prime only) and some are universal (cash rebates, factory-to-dealer incentives). We pre-screen each file to maximise the layered savings.`,
        },
        {
          question: `Does the 6-months-covered offer stack with seasonal incentives?`,
          answer: `On most deals, yes. The specialist confirms which incentives stack and which exclude each other.`,
        },
        {
          question: `What months should I watch for the best Calgary deals?`,
          answer: `October–December for year-end and winter, February–May for tax-refund season and spring quarter-end, August for model-year transition. We confirm which window fits your file on the call.`,
        },
        {
          question: `Will my application be valid in the next window?`,
          answer: `Soft-pull pre-approval doesn't expire; we update the file when the right window opens.`,
        },
      ],
      related: [
        { href: "/calculator", label: "Estimate your payment" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ],
      ctaHeading: `${s.fullName}. Apply free.`,
      priority: 0.74,
    };
  });
}
