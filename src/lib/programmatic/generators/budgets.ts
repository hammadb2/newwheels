import type { ProgrammaticPage } from "../types";
import { BUDGETS } from "../budgets";

function budgetTitle(slugFragment: string, shortName: string): string {
  if (slugFragment.startsWith("under-")) {
    if (slugFragment.includes("month")) return `Car loan ${shortName} in Calgary`;
    return `Car loan ${shortName} in Calgary`;
  }
  if (slugFragment === "zero-down") return `Zero-down car loan in Calgary`;
  if (slugFragment === "low-down-payment") return `Low-down-payment car loan in Calgary`;
  return `Car loan ${shortName} in Calgary`;
}

function budgetMetaTitle(shortName: string, slugFragment: string): string {
  if (slugFragment === "zero-down") return `Zero-Down Car Loan Calgary | $0 Down Financing`;
  if (slugFragment === "low-down-payment") return `Low Down Payment Car Loan Calgary | NewWheels`;
  return `Car Loan ${shortName} | Calgary Financing | NewWheels`;
}

function budgetDescription(b: typeof BUDGETS[number]): string {
  if (b.maxPrice) {
    return `Car loans for vehicles ${b.shortName} in Calgary. Bad credit, newcomers, and work-permit approved. Estimate the payment and apply free with a soft pull.`;
  }
  if (b.maxMonthly) {
    return `Vehicle financing keeping the monthly payment ${b.shortName} in Calgary. Bad credit, newcomers, and work-permit approved. Apply free, soft pull.`;
  }
  if (b.zeroDown) {
    return `$0 down car loans in Calgary. Bad credit, newcomers, and work-permit approved on qualifying deals. Apply free with a soft pull.`;
  }
  return `Low-down-payment car loans in Calgary. Bad credit, newcomers, and work-permit approved. Apply free with a soft pull.`;
}

export function generateBudgetPages(): ProgrammaticPage[] {
  return BUDGETS.map((b): ProgrammaticPage => {
    const slug = `car-loan-${b.slugFragment}-calgary`;
    const isMonthly = !!b.maxMonthly;
    const isZeroDown = !!b.zeroDown;
    const isLowDown = !!b.lowDown;
    return {
      slug,
      kind: "budget",
      category: "Budget pages",
      metaTitle: budgetMetaTitle(b.shortName, b.slugFragment),
      metaDescription: budgetDescription(b),
      h1: budgetTitle(b.slugFragment, b.shortName),
      tagline: "Budget",
      intro: isZeroDown
        ? `Yes — $0 down car loans are available in Calgary on qualifying deals through NewWheels. We approve bad credit, newcomers, work-permit holders, and self-employed buyers. Soft pull on application; specialist callback within 1 hour.`
        : isLowDown
          ? `Low-down-payment vehicle financing in Calgary across credit profiles. NewWheels matches each application to the lender most likely to approve the smallest possible down payment for your file. Soft pull on application; specialist callback within 1 hour.`
          : isMonthly
            ? `Yes — NewWheels finances Calgary buyers keeping the monthly payment ${b.shortName}. We model price, term, rate, and down payment together so the payment lands where you need it. Apply free with a soft pull.`
            : `Yes — NewWheels finances Calgary vehicles ${b.shortName}. Used and certified-pre-owned inventory dominates this price band. Apply free with a soft pull and we route the file to the best-fit Calgary lender.`,
      sections: [
        {
          heading: isZeroDown
            ? "How $0-down financing works in Calgary"
            : isLowDown
              ? "How low-down-payment financing works"
              : isMonthly
                ? `How NewWheels keeps the payment ${b.shortName}`
                : `What you can buy ${b.shortName} in Calgary`,
          paragraphs: [
            isZeroDown
              ? `Lenders approve $0 down when the loan-to-value ratio works. Used vehicles with high book value and prime credit profiles are the easiest $0-down approvals. Newcomer-program and OEM-backed deals on new vehicles frequently allow $0 down even with thin credit.`
              : isLowDown
                ? `Low-down-payment approvals depend on the lender's loan-to-value tolerance and your income. NewWheels matches each application to the lender most flexible on down payment for the specific vehicle and credit profile.`
                : isMonthly
                  ? `Monthly payment is a function of price, term, rate, and down payment. NewWheels adjusts all four together — usually keeping the vehicle price flexible and the term between 60 and 84 months — to land the payment ${b.shortName} without pushing total interest higher than necessary.`
                  : `Used and certified-pre-owned inventory dominates this price band in Calgary. Toyota Corolla, Honda Civic, Hyundai Elantra, Mazda3, Nissan Versa, and Kia Forte are the most-financed vehicles ${b.shortName} in NewWheels' Calgary book.`,
          ],
        },
        {
          heading: `Credit situations we approve ${b.shortName}`,
          paragraphs: [`Each credit situation maps to a different best-fit Calgary lender.`],
          bullets: [
            `Bad credit (sub-600 score) — sub-prime lender match`,
            `Newcomers without Canadian credit — manufacturer-backed newcomer program or alternative-prime`,
            `Work-permit holders (LMIA, PGWP, open, TFW) — alternative-prime newcomer lenders`,
            `Self-employed or gig-worker income — stated-income / bank-statement lenders`,
            `Post-bankruptcy and post-proposal — niche specialist sub-prime lenders`,
          ],
        },
        {
          heading: `Calgary buyer tips ${b.shortName}`,
          paragraphs: [
            `Alberta's no-PST advantage means a vehicle purchase in Calgary is roughly $2,100 cheaper than the same vehicle in BC and $2,400 cheaper than Ontario before financing. That saving stretches further when you're keeping the budget tight.`,
            `Use the NewWheels calculator at /calculator to model price, term, rate, and down payment in real time. Apply free once the payment lands where you need it.`,
          ],
        },
      ],
      faq: [
        {
          question: `Can I get a car loan ${b.shortName} in Calgary with bad credit?`,
          answer: `Yes. Bad-credit car loans ${b.shortName} land rates between 13.99% and 19.99% depending on score, income, term, and down payment. Apply free with a soft pull.`,
        },
        {
          question: `Can newcomers get a car loan ${b.shortName} without Canadian credit?`,
          answer: `Yes. Newcomer-program rates run 8.99–14.99% and lenders approve ${b.shortName} financing on most vehicles. Apply free; we match to the lender with the best newcomer-program fit.`,
        },
        {
          question: `What credit profile gets the cheapest rate ${b.shortName}?`,
          answer: `Established prime credit lands sub-8% on most Calgary deals. PGWP holders, new PRs, and first-time buyers usually land 8.99–12.99% on OEM newcomer programs. Sub-prime sits at 13.99% and up.`,
        },
        {
          question: isMonthly ? `Is the calculator accurate for "${b.shortName}"?` : `What term should I pick ${b.shortName}?`,
          answer: isMonthly
            ? `It's an estimate. Real rate depends on credit profile, income, term, vehicle, and lender match. Apply free and we give you the actual number within 24 hours.`
            : `Most Calgary buyers ${b.shortName} land at 60–84 months. We model the trade-off between monthly payment and total interest so you pick the term that minimises lifetime cost given your goals.`,
        },
        {
          question: `Does the 6-months-covered offer apply ${b.shortName}?`,
          answer: `On qualifying deals, yes. NewWheels' up-to-6-months-covered offer applies across price bands. The amount covered depends on the deal structure; the specialist explains the terms before you sign.`,
        },
        {
          question: `Can I get $0 down ${b.shortName}?`,
          answer: `On qualifying deals, yes. $0 down approvals depend on loan-to-value, vehicle, credit profile, and income. We pre-screen during the call to set realistic expectations.`,
        },
      ],
      related: [
        { href: "/calculator", label: "Estimate your payment" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
        { href: "/car-loan-work-permit-calgary", label: "Work-permit car loans" },
        { href: "/how-it-works", label: "How NewWheels works" },
      ],
      ctaHeading: `Car loan ${b.shortName} in Calgary. Apply free, no obligation.`,
      priority: 0.8,
    };
  });
}
