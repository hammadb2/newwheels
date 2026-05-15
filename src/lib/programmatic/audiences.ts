import type { Audience } from "./types";

// Every audience the financing market treats as a distinct underwriting bucket.
// Used to drive the existing situation pages AND the programmatic cross-products
// (audience × location, audience × make, audience × budget).

export const AUDIENCES: Audience[] = [
  {
    id: "bad-credit",
    slugFragment: "bad-credit",
    fullName: "Bad-credit buyers in Calgary",
    shortName: "bad credit",
    rateRange: "13.99–19.99%",
    docs: ["Valid Alberta driver's licence", "Two most recent pay stubs", "90 days of bank statements", "Proof of Calgary residence"],
    lenderNotes:
      "Sub-prime lenders price off employment stability and disposable income more than score. We route to a small set of Calgary-friendly sub-prime partners who care about the file holistically.",
    calgarySignal: "Forest Lawn, Marlborough, and Falconridge buyers rebuilding after a layoff are the largest concentration.",
  },
  {
    id: "newcomer",
    slugFragment: "newcomer",
    fullName: "Newcomers to Canada in Calgary",
    shortName: "newcomers",
    rateRange: "8.99–14.99%",
    docs: ["Passport + COPR / PR card / work permit", "Job offer or employment letter", "Proof of Calgary address", "First Canadian pay stub if you have one"],
    lenderNotes:
      "Manufacturer-backed newcomer programs (Nissan Canada Finance, Toyota Financial Services, Hyundai Capital) are usually the cheapest. Alternative-prime newcomer lenders price off employment stability rather than credit.",
    calgarySignal: "Largest population cluster in Saddle Ridge, Martindale, Falconridge, and Genesis (Airdrie).",
  },
  {
    id: "work-permit",
    slugFragment: "work-permit",
    fullName: "Work-permit holders in Alberta",
    shortName: "work-permit",
    rateRange: "9.99–15.99%",
    docs: ["Valid work permit (LMIA / PGWP / open / TFW / caregiver)", "Employment letter on company letterhead", "Two recent pay stubs", "Calgary lease or utility bill"],
    lenderNotes:
      "Most lenders want at least 12 months remaining on your permit. A handful approve at 6 months if your employer signs a continuity letter. Term capped at the lesser of 60 months or the permit expiry.",
    calgarySignal: "PGWP graduates from SAIT, U of C, Bow Valley College, and Mount Royal University make up roughly 40% of this segment.",
  },
  {
    id: "lmia-permit",
    slugFragment: "lmia-work-permit",
    fullName: "LMIA work-permit holders in Alberta",
    shortName: "LMIA",
    rateRange: "9.99–15.99%",
    docs: ["LMIA-supported work permit", "Employment letter on company letterhead", "Pay stubs covering at least 90 days", "Calgary address proof"],
    lenderNotes:
      "LMIA approvals usually move through alternative-prime lenders that specialise in employer-tied permits. Approvals tend to land within 24 hours when the employer letter is on file.",
    calgarySignal: "Concentrated in trades and oil and gas roles servicing Calgary and surrounding industrial parks.",
  },
  {
    id: "pgwp-permit",
    slugFragment: "pgwp",
    fullName: "PGWP holders in Calgary",
    shortName: "PGWP",
    rateRange: "8.49–13.99%",
    docs: ["PGWP", "Graduation transcript or diploma", "First-job employment letter", "Two pay stubs", "Calgary address proof"],
    lenderNotes:
      "PGWP files frequently route through manufacturer-backed newcomer programs at rates that beat third-party sub-prime by 3–5 points. The post-graduation employment bump matters more than the score.",
    calgarySignal: "SAIT, U of C, MRU, Bow Valley, and Robertson College graduates working in tech, healthcare, finance, and trades.",
  },
  {
    id: "open-work-permit",
    slugFragment: "open-work-permit",
    fullName: "Open work-permit holders in Alberta",
    shortName: "open permit",
    rateRange: "9.99–14.99%",
    docs: ["Open work permit (spousal or other)", "Employment letter", "Pay stubs", "Calgary address proof"],
    lenderNotes:
      "Open permits usually require slightly longer employment tenure (90–180 days) compared to LMIA-supported permits.",
    calgarySignal: "Often spouses of PGWP holders or skilled workers waiting on PR processing.",
  },
  {
    id: "tfw-permit",
    slugFragment: "tfw",
    fullName: "TFW (Temporary Foreign Worker) buyers",
    shortName: "TFW",
    rateRange: "10.99–16.99%",
    docs: ["TFW permit + LMIA", "Employer continuity letter", "Pay stubs"],
    lenderNotes:
      "TFW files move through a narrower set of lenders. We pre-screen for permit duration and employer-letter continuity before submission to avoid bureau hits.",
    calgarySignal: "Hospitality, agriculture-adjacent, and skilled trades servicing the Calgary region.",
  },
  {
    id: "bankruptcy",
    slugFragment: "after-bankruptcy",
    fullName: "Buyers after bankruptcy in Calgary",
    shortName: "post-bankruptcy",
    rateRange: "14.99–19.99%",
    docs: ["Trustee discharge papers (if discharged)", "Pay stubs", "Bank statements (90 days)", "Calgary address proof"],
    lenderNotes:
      "Discharged bankruptcies typically need 12 months of re-established credit; undischarged files route to a small set of niche lenders.",
    calgarySignal: "Disproportionately Calgary tradespeople recovering from oil downturns and consumer-debt restructures.",
  },
  {
    id: "consumer-proposal",
    slugFragment: "consumer-proposal",
    fullName: "Consumer-proposal buyers in Calgary",
    shortName: "consumer proposal",
    rateRange: "13.99–18.99%",
    docs: ["Proposal trustee paperwork", "Proof of monthly proposal payments", "Pay stubs", "Address proof"],
    lenderNotes:
      "Active proposals can be financed; we usually need 6+ months of on-time payments. Completed proposals route to a wider lender pool.",
    calgarySignal: "Often paired with credit-rebuild buyers in the Forest Lawn and SE Calgary cluster.",
  },
  {
    id: "self-employed",
    slugFragment: "self-employed",
    fullName: "Self-employed buyers in Calgary",
    shortName: "self-employed",
    rateRange: "7.49–13.99%",
    docs: ["Two years of NOAs (or 6 months of bank statements for stated-income files)", "Articles of incorporation if applicable", "GST number if applicable", "Calgary address proof"],
    lenderNotes:
      "Stated-income and bank-statement programs handle Calgary contractors, ride-share drivers, and small-business owners whose NOAs understate cash flow.",
    calgarySignal: "Owner-operators in trucking, oil and gas consulting, trades, and rideshare.",
  },
  {
    id: "first-time-buyer",
    slugFragment: "first-time-buyer",
    fullName: "First-time vehicle buyers in Calgary",
    shortName: "first-time buyer",
    rateRange: "8.99–13.99%",
    docs: ["Driver's licence", "Employment letter or 2 pay stubs", "Bank statement", "Calgary address proof"],
    lenderNotes:
      "First-time-buyer programs from Toyota, Hyundai, and Nissan offer step-rate discounts vs sub-prime, even with thin credit.",
    calgarySignal: "Bow Valley, MRU, SAIT, U of C grads buying their first vehicle in Calgary.",
  },
  {
    id: "student",
    slugFragment: "student-loan",
    fullName: "Student car loans in Calgary",
    shortName: "students",
    rateRange: "9.99–14.99%",
    docs: ["Valid student ID", "Proof of enrolment", "Part-time pay stubs or co-signer", "Address proof"],
    lenderNotes:
      "Manufacturer first-time-buyer programs accept part-time income with a co-signer. Pre-approval works well to cap monthly spending while you shop.",
    calgarySignal: "Largest student concentration: U of C, SAIT, MRU campuses; ride-share-side income is common.",
  },
  {
    id: "international-student",
    slugFragment: "international-student",
    fullName: "International students in Calgary",
    shortName: "international student",
    rateRange: "10.99–14.99%",
    docs: ["Study permit", "Letter of enrolment", "Co-signer (usually required if no Canadian income)", "Address proof"],
    lenderNotes:
      "International-student files almost always need a Canadian co-signer or a substantial down payment. We pre-screen to ensure files land at lenders that approve study-permit buyers.",
    calgarySignal: "Predominantly U of C, SAIT, Bow Valley, and Ambrose University students from India, Nigeria, and the Philippines.",
  },
  {
    id: "seasonal",
    slugFragment: "seasonal-worker",
    fullName: "Seasonal workers in Alberta",
    shortName: "seasonal worker",
    rateRange: "10.99–15.99%",
    docs: ["Last 2 years of NOAs (to demonstrate cyclical income)", "Pay stubs from current season", "90-day bank statements", "Address proof"],
    lenderNotes:
      "Lenders that handle seasonal Alberta income (forestry, agriculture, oil and gas, hospitality) want 24 months of NOAs showing a stable annual average.",
    calgarySignal: "Construction, oil and gas, hospitality, and farm-belt workers commuting to Calgary in shoulder seasons.",
  },
  {
    id: "gig-worker",
    slugFragment: "gig-worker",
    fullName: "Gig and rideshare drivers in Calgary",
    shortName: "gig worker",
    rateRange: "9.99–14.99%",
    docs: ["Uber / Lyft / DoorDash payout statements (6 months)", "Bank statements (90 days)", "Address proof"],
    lenderNotes:
      "Stated-income programs and a handful of fintech lenders treat 6 months of platform payout statements like NOAs.",
    calgarySignal: "Heavy Uber, Lyft, DoorDash, and Skip the Dishes drivers; mainly NE Calgary and Forest Lawn.",
  },
  {
    id: "new-pr",
    slugFragment: "new-permanent-resident",
    fullName: "New permanent residents in Calgary",
    shortName: "new PR",
    rateRange: "8.49–13.99%",
    docs: ["COPR / PR card", "Employment letter or two pay stubs", "First Canadian bank statement", "Calgary address proof"],
    lenderNotes:
      "New PRs generally qualify for the most generous newcomer programs (manufacturer-backed) at rates close to prime once stable employment is shown.",
    calgarySignal: "Saddle Ridge, Martindale, Skyview, Cornerstone, and Genesis (Airdrie) are the densest new-PR neighbourhoods.",
  },
];

export function audienceBySlugFragment(fragment: string): Audience | undefined {
  return AUDIENCES.find(a => a.slugFragment === fragment);
}
