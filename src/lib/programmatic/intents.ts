import type { Intent, Seasonal } from "./types";

export const INTENTS: Intent[] = [
  {
    id: "lease-vs-buy",
    slugFragment: "compare-lease-vs-buy",
    fullName: "Lease vs buy",
    shortName: "lease vs buy",
    intent: "Comparing whether to lease or finance the same vehicle in Calgary.",
    calgaryAngle: "Calgary commuters from Airdrie or Cochrane drive 25,000+ km/year — usually past lease km caps. Sub-15,000 km/year drivers in downtown or SW Calgary frequently save by leasing.",
  },
  {
    id: "trade-in-upgrade",
    slugFragment: "trade-in-and-upgrade",
    fullName: "Trade-in and upgrade",
    shortName: "trade and upgrade",
    intent: "Trading a current vehicle for a newer one without paying off the old loan first.",
    calgaryAngle: "We roll negative equity into a refinanced loan when the math works and recommend payoff-then-buy when it doesn't.",
  },
  {
    id: "refinance",
    slugFragment: "refinance",
    fullName: "Refinance an existing loan",
    shortName: "refinance",
    intent: "Lowering a rate or extending term on a current vehicle loan.",
    calgaryAngle: "Calgary buyers who took sub-prime financing during a low-credit period often refinance 18–24 months later as their bureau heals.",
  },
  {
    id: "first-vehicle-in-canada",
    slugFragment: "first-vehicle-in-canada",
    fullName: "First vehicle in Canada",
    shortName: "first Canadian vehicle",
    intent: "A newly arrived buyer purchasing their first Canadian-financed vehicle.",
    calgaryAngle: "Newcomer program rates plus a Calgary-only dealer relationship usually beat any \"newcomer\" rate a national broker can quote.",
  },
  {
    id: "work-vehicle",
    slugFragment: "work-vehicle",
    fullName: "Vehicle for work (tradesperson, delivery, rideshare)",
    shortName: "work vehicle",
    intent: "Financing a vehicle used primarily for trades, delivery, or rideshare income.",
    calgaryAngle: "We pair self-employed and gig-worker income documentation paths with vehicles selected for low operating cost (RAV4 Hybrid, Sienna, Sentra).",
  },
  {
    id: "family-vehicle",
    slugFragment: "family-vehicle",
    fullName: "Family vehicle",
    shortName: "family vehicle",
    intent: "Three-row SUVs, minivans, and family-sized crossovers for Calgary households.",
    calgaryAngle: "Highlander Hybrid, Sienna, Pilot, and Telluride are the four most-financed family vehicles through NewWheels.",
  },
  {
    id: "winter-ready",
    slugFragment: "winter-ready-vehicle",
    fullName: "Winter-ready vehicle for Calgary",
    shortName: "winter-ready",
    intent: "Selecting a vehicle for Calgary winter — AWD, traction, ground clearance, cold-start reliability.",
    calgaryAngle: "We rank Calgary winter-ready vehicles by drivetrain (AWD vs FWD), ground clearance, factory winter packages, and battery cold-soak (for EVs and hybrids).",
  },
  {
    id: "fuel-efficient",
    slugFragment: "fuel-efficient-vehicle",
    fullName: "Fuel-efficient vehicle for Calgary",
    shortName: "fuel-efficient",
    intent: "Hybrids, EVs, and small-displacement vehicles ranked by Calgary real-world fuel economy.",
    calgaryAngle: "Calgary -30°C mornings hurt EV range; hybrids preserve range better than pure EVs in Calgary winter.",
  },
];

export const SEASONALS: Seasonal[] = [
  {
    id: "winter-tires-financing",
    slugFragment: "winter-tires-financing",
    fullName: "Winter tires financing in Calgary",
    shortName: "winter tires",
    monthsActive: "October–December",
    calgaryAngle: "Calgary winter snowfall starts late October. We can roll a winter-tire package into the vehicle loan for buyers who haven't bought yet, or finance the tires separately for existing owners.",
  },
  {
    id: "tax-refund-down-payment",
    slugFragment: "tax-refund-car-loan",
    fullName: "Tax-refund car loan in Calgary",
    shortName: "tax-refund down payment",
    monthsActive: "February–May",
    calgaryAngle: "Most Albertans see refunds large enough to cover a 10–20% vehicle down payment. Putting the refund toward the vehicle plus pre-approval before April lowers the rate sheet considerably.",
  },
  {
    id: "end-of-year-deals",
    slugFragment: "end-of-year-car-deals",
    fullName: "End-of-year car deals in Calgary",
    shortName: "year-end deals",
    monthsActive: "November–December",
    calgaryAngle: "Calgary dealers clear outgoing model-year inventory hardest in November and December. Quarter-end OEM incentives stack with model-year-end discounts.",
  },
  {
    id: "summer-vehicle-deals",
    slugFragment: "summer-vehicle-deals",
    fullName: "Summer vehicle deals in Calgary",
    shortName: "summer deals",
    monthsActive: "May–August",
    calgaryAngle: "May–June Stampede-adjacent promos and August new-model-year transitions drive Calgary's second-strongest discount period.",
  },
];

export function intentBySlugFragment(fragment: string): Intent | undefined {
  return INTENTS.find(i => i.slugFragment === fragment);
}

export function seasonalBySlugFragment(fragment: string): Seasonal | undefined {
  return SEASONALS.find(s => s.slugFragment === fragment);
}
