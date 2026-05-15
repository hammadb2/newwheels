import type { ProgrammaticPage } from "../types";

// Service-intent pages — content plays that rank for mechanic / repair /
// insurance-adjacent searches and convert repair intent into new vehicle
// financing intent. NewWheels is not a mechanic; we publish neighbourhood-aware
// content that answers the question and offers financing as the alternative.

type ServiceSeed = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  sections: ProgrammaticPage["sections"];
  faq: ProgrammaticPage["faq"];
  ctaHeading: string;
};

const SEEDS: ServiceSeed[] = [
  {
    slug: "car-service-financing-calgary",
    metaTitle: "Car Service Financing Calgary | Finance Unexpected Repair Bills",
    metaDescription: "When a Calgary repair bill is large enough that a newer vehicle becomes the better answer, NewWheels finances the upgrade. Bad credit, newcomers, work-permit approved.",
    h1: "Car service financing in Calgary",
    tagline: "Service financing",
    intro:
      "Calgary repair bills of $3,000+ on a vehicle worth $6,000 are usually the trigger to upgrade rather than fix. NewWheels finances the upgrade in 24 hours, even for bad credit, no Canadian credit, work-permit, and self-employed buyers. Soft pull on the application.",
    sections: [
      {
        heading: "When repair turns into refinance-and-replace",
        paragraphs: [
          "A common Calgary scenario: transmission flag on a 2014 Equinox, $4,200 estimate from the shop, vehicle Kelley Blue Book is $7,800. Spending $4,200 on a six-figure-mileage transmission rarely makes sense when the same payment over 60 months covers a newer vehicle with warranty.",
          "We run the math both ways during the 1-hour callback. Sometimes the repair wins. Often the financing wins. Applying is free and uses a soft pull, so even running the comparison costs nothing.",
        ],
      },
      {
        heading: "Credit situations we finance for upgrade-vs-repair buyers",
        paragraphs: ["Each credit profile maps to a different best-fit Calgary lender."],
        bullets: [
          "Bad credit / sub-600 score — sub-prime partner match",
          "Newcomers without Canadian credit — manufacturer-backed newcomer programs",
          "Work-permit holders — alternative-prime newcomer lenders",
          "Self-employed and gig income — stated-income lenders",
          "Post-bankruptcy and post-proposal — niche specialist sub-prime",
        ],
      },
    ],
    faq: [
      { question: "Should I repair or finance a newer vehicle?", answer: "Repair if the bill is under 30% of the current vehicle's Kelley Blue Book and the vehicle has under 200,000 km. Refinance-and-replace usually wins above that threshold." },
      { question: "Can NewWheels finance an unexpected repair bill?", answer: "Indirectly, yes. If the repair makes sense, a personal loan from your bank or credit union is the cheapest route. If it doesn't, NewWheels finances a newer vehicle in 24 hours through the same application." },
      { question: "What if I owe money on my current vehicle?", answer: "Negative equity can be rolled into the new loan if the math works. We sometimes recommend paying down the old loan first if it doesn't. The specialist walks through both options on the call." },
      { question: "Can I trade in my current vehicle even if it needs repairs?", answer: "Yes. Most Calgary dealers accept trade-ins as-is and adjust the trade value down to cover anticipated repairs." },
      { question: "How fast is the refinance-and-replace approval?", answer: "Approval typically lands within 24 hours. A specialist calls within 1 hour during business hours to run the math." },
      { question: "Does the 6-months-covered offer apply?", answer: "On qualifying deals, yes. The amount depends on the deal structure." },
    ],
    ctaHeading: "Calgary repair bill bigger than the car is worth? Apply free.",
  },
  {
    slug: "mechanic-near-me-calgary",
    metaTitle: "Mechanic Near Me Calgary | Trusted Auto Repair + Financing",
    metaDescription: "Calgary trusted mechanics by neighbourhood, plus when to finance a newer vehicle instead. NewWheels approves bad credit, newcomers, and work-permit applicants in 24 hours.",
    h1: "Mechanic near me — Calgary",
    tagline: "Service intent",
    intro:
      "Calgary has solid independent shops in every quadrant. When the repair bill is bigger than the vehicle is worth, NewWheels finances the upgrade in 24 hours. Soft pull on the application.",
    sections: [
      {
        heading: "Calgary mechanic options by quadrant",
        paragraphs: [
          "We're not a mechanic. We're not affiliated with any shop. This is a general orientation for Calgary buyers shopping for repair quotes — followed by a financing alternative when the math swings.",
        ],
        bullets: [
          "NE Calgary — Saddle Ridge, Falconridge, Marlborough corridors have several independent shops near 36th Street NE and Memorial Drive.",
          "SE Calgary — Foothills industrial park concentrates dealer-trained mechanics willing to work on retail vehicles.",
          "SW Calgary — Glenmore Trail and 17th Avenue SW carry multiple independent and chain shops.",
          "NW Calgary — McKnight and Crowchild corridors carry dealer-adjacent independent shops.",
          "Downtown — fewer independent shops; most Downtown buyers drive to NE or SW for service.",
        ],
      },
      {
        heading: "When the math says finance a newer vehicle instead",
        paragraphs: [
          "A common scenario: $3,500 transmission quote on a 2013 vehicle worth $6,000. The math usually says replace. Apply free; soft pull, no obligation. A specialist runs the trade-vs-repair math on the call.",
        ],
      },
    ],
    faq: [
      { question: "Does NewWheels recommend mechanics?", answer: "No. We're a financing specialist, not a mechanic. We orient Calgary buyers toward independent shop options and finance the upgrade if a repair bill is bigger than the vehicle is worth." },
      { question: "What repair bill should trigger a refinance-and-replace conversation?", answer: "Repair quotes above 30% of the vehicle's Kelley Blue Book, or any repair on a vehicle over 200,000 km, are usually the trigger." },
      { question: "Can I finance a newer vehicle in 24 hours?", answer: "Yes. Approval typically lands within 24 hours. A specialist calls within 1 hour during business hours." },
      { question: "Does NewWheels offer a soft-pull pre-approval?", answer: "Yes. Applications use a soft pull that doesn't damage your score." },
      { question: "Can I trade in my current vehicle?", answer: "Yes. Trade-in value is appraised during the financing process." },
      { question: "What if I have bad credit?", answer: "We approve sub-600 credit on most Calgary deals through sub-prime partner lenders." },
    ],
    ctaHeading: "Calgary mechanic quoted too much? Run the upgrade math free.",
  },
  {
    slug: "when-to-replace-vs-repair-calgary",
    metaTitle: "Replace vs Repair a Car in Calgary | Decision Guide",
    metaDescription: "Should you repair your current Calgary vehicle or finance a newer one? Plain-English guide plus a free soft-pull financing pre-approval if upgrade wins.",
    h1: "Replace vs repair a car in Calgary",
    tagline: "Decision guide",
    intro:
      "Replace if the repair quote is above 30% of the vehicle's Kelley Blue Book value or the vehicle is over 200,000 km. Repair otherwise. NewWheels runs the math both ways on the call and finances the upgrade in 24 hours if replacement wins.",
    sections: [
      {
        heading: "The 30% rule, the 200,000 km rule, and the cost-per-month rule",
        paragraphs: [
          "The cleanest decision rule: if the repair quote is more than 30% of the vehicle's Kelley Blue Book and the vehicle is above 200,000 km, replace it. The second rule is the cost-per-month test: divide the repair bill by 12. If the resulting per-month figure plus your existing maintenance and insurance is higher than the financed payment on a newer vehicle, replace it.",
        ],
      },
      {
        heading: "How NewWheels handles the financing if replacement wins",
        paragraphs: [
          "Soft pull, 1-hour callback, 24-hour approval, vehicle delivery through dealer partners. Up to 6 months of payments covered on qualifying deals.",
        ],
      },
    ],
    faq: [
      { question: "What's the rule of thumb for repair vs replace?", answer: "Repair if the bill is under 30% of the vehicle's Kelley Blue Book and the vehicle is below 200,000 km. Replace otherwise." },
      { question: "What if I owe money on the current vehicle?", answer: "We can roll negative equity into a new loan if the math works, or recommend paying down the old loan first if it doesn't." },
      { question: "Can NewWheels finance a replacement vehicle even with bad credit?", answer: "Yes. Sub-prime financing in Calgary lands rates between 13.99% and 19.99% depending on profile." },
      { question: "How long does the replacement timeline take?", answer: "Application to vehicle delivery typically lands within 3–7 business days." },
      { question: "Is the soft pull free?", answer: "Yes." },
      { question: "Does the 6-months-covered offer apply to replacement vehicles?", answer: "On qualifying deals, yes. The amount depends on the deal structure." },
    ],
    ctaHeading: "Run the replace-vs-repair math free.",
  },
  {
    slug: "car-insurance-and-financing-calgary",
    metaTitle: "Car Insurance & Financing Calgary | What Lenders Need",
    metaDescription: "How Calgary car insurance interacts with vehicle financing — minimum coverage, lender requirements, and how it affects your monthly payment.",
    h1: "Car insurance and financing in Calgary",
    tagline: "Insurance + financing",
    intro:
      "Calgary lenders require full coverage insurance with comprehensive and collision while the loan is open. That requirement plus Alberta's PIPP rules sets the minimum monthly insurance cost. NewWheels walks every applicant through realistic monthly insurance budgets before signing.",
    sections: [
      {
        heading: "What Calgary lenders require on a financed vehicle",
        paragraphs: [
          "Lenders need to see comprehensive + collision coverage with the lender listed as a loss payee. Alberta's basic PIPP plus mandatory third-party liability ($200,000 minimum) is layered on top. Realistic Calgary monthly insurance on a typical first-time-buyer profile lands $180–$320 depending on age, neighbourhood, and vehicle.",
        ],
      },
      {
        heading: "How insurance affects the financing approval",
        paragraphs: [
          "Lenders confirm insurance is in place before releasing the vehicle. A high insurance premium pushes the total monthly cost up but doesn't change the loan rate itself. The NewWheels specialist walks through realistic Calgary insurance numbers during the 1-hour callback so you don't get surprised at signing.",
        ],
      },
    ],
    faq: [
      { question: "Does my insurance rate change my car loan rate?", answer: "Indirectly. The loan rate itself is set by credit profile and the lender. Insurance affects your total monthly cost and your debt-service ratio, which can affect approval at the edge." },
      { question: "How much is insurance on a financed vehicle in Calgary?", answer: "Realistic ranges run $180–$320/month for first-time buyers depending on age, postal code, and vehicle. We walk through realistic numbers on the 1-hour callback." },
      { question: "What's the minimum coverage a Calgary lender requires?", answer: "Comprehensive + collision with the lender listed as loss payee, plus Alberta's basic PIPP and third-party liability minimums." },
      { question: "Can I shop my insurance separately?", answer: "Yes. We recommend getting at least two Calgary insurance quotes before signing the financing paperwork." },
      { question: "Will NewWheels arrange my insurance?", answer: "No. We finance the vehicle and walk you through realistic Calgary insurance ranges; you pick the carrier." },
      { question: "What if I can't afford the insurance after the loan starts?", answer: "Don't sign. The specialist runs the all-in monthly (loan + insurance + fuel + maintenance) on the call so you only sign when the all-in number works." },
    ],
    ctaHeading: "All-in Calgary monthly cost? Apply free; specialist runs the math.",
  },
];

export function generateServiceIntentPages(): ProgrammaticPage[] {
  return SEEDS.map((s): ProgrammaticPage => ({
    slug: s.slug,
    kind: "service-intent",
    category: "Service intent",
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    h1: s.h1,
    tagline: s.tagline,
    intro: s.intro,
    sections: s.sections,
    faq: s.faq,
    related: [
      { href: "/calculator", label: "Estimate your payment" },
      { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
      { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans Calgary" },
      { href: "/how-it-works", label: "How NewWheels works" },
    ],
    ctaHeading: s.ctaHeading,
    priority: 0.75,
  }));
}
