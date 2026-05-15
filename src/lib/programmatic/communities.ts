import type { Community } from "./types";

// Calgary newcomer community segments. Each has its own visa pathway mix and
// neighbourhood concentration. These drive both single-axis community pages
// and the cross-product community × neighbourhood pages.

export const COMMUNITIES: Community[] = [
  {
    id: "filipino",
    slugFragment: "filipino",
    fullName: "Filipino community in Calgary",
    shortName: "Filipino",
    language: "Tagalog",
    langCode: "tl",
    primaryCalgaryNeighbourhoods: ["Falconridge", "Saddle Ridge", "Martindale", "Forest Lawn"],
    visaPathways: ["TFW caregiver pathway", "Open work permit (spousal)", "PGWP", "Family-class PR"],
    cultureNotes:
      "Multi-household co-buying is common: caregiver pathway parents pooling income with PGWP children to buy a family SUV. Filipino caregiver applicants frequently lack a strong score but show 24+ months of stable income.",
  },
  {
    id: "south-asian",
    slugFragment: "south-asian",
    fullName: "South Asian community in Calgary",
    shortName: "South Asian",
    language: "English, Punjabi, Hindi, Urdu",
    primaryCalgaryNeighbourhoods: ["Saddle Ridge", "Martindale", "Falconridge", "Taradale", "Skyview"],
    visaPathways: ["LMIA work permit", "PGWP", "Family-class PR", "Express Entry PR"],
    cultureNotes:
      "Strong preference for Toyota and Honda over Korean or American makes; family SUV (Highlander, Sienna, Pilot) and pickup truck (Tacoma, F-150) demand dominate. Co-signers from established family members frequently lift first-time PR buyers into prime tiers.",
  },
  {
    id: "punjabi",
    slugFragment: "punjabi",
    fullName: "Punjabi community in Calgary",
    shortName: "Punjabi",
    language: "Punjabi",
    langCode: "pa",
    primaryCalgaryNeighbourhoods: ["Saddle Ridge", "Martindale", "Skyview", "Cornerstone", "Genesis (Airdrie)"],
    visaPathways: ["Express Entry PR", "PGWP", "LMIA work permit", "Family-class sponsorship"],
    cultureNotes:
      "Family-financing pattern: an established Punjabi household member often co-signs for newly landed PR family. Long-haul truck driver applicants are a large NewWheels segment with non-standard NOA income.",
  },
  {
    id: "tamil",
    slugFragment: "tamil",
    fullName: "Tamil community in Calgary",
    shortName: "Tamil",
    language: "Tamil",
    primaryCalgaryNeighbourhoods: ["Saddle Ridge", "Cornerstone", "Redstone", "Martindale"],
    visaPathways: ["PR sponsorship", "Refugee pathway", "Express Entry"],
    cultureNotes:
      "Growing Tamil professional cluster in Calgary (IT, healthcare). Many newcomers transition straight to PR via Express Entry and skip the work-permit step entirely.",
  },
  {
    id: "hindi",
    slugFragment: "hindi",
    fullName: "Hindi-speaking community in Calgary",
    shortName: "Hindi-speaking",
    language: "Hindi",
    primaryCalgaryNeighbourhoods: ["Saddle Ridge", "Skyview", "Cornerstone", "Redstone", "Martindale", "Cityscape"],
    visaPathways: ["Express Entry PR", "PGWP", "LMIA work permit", "Family sponsorship"],
    cultureNotes:
      "Largest single newcomer language community in Calgary by population. Strong preference for Japanese family SUVs (RAV4, CR-V, Highlander) plus growing EV interest (BYD Atto 3, Hyundai Kona EV) for second-vehicle households.",
  },
  {
    id: "latin-american",
    slugFragment: "latin-american",
    fullName: "Latin American community in Calgary",
    shortName: "Latin American",
    language: "Spanish",
    langCode: "es",
    primaryCalgaryNeighbourhoods: ["Forest Lawn", "Marlborough", "Falconridge", "Marlborough Park", "Pineridge"],
    visaPathways: ["Refugee pathway", "Family-class PR", "Express Entry", "LMIA work permit"],
    cultureNotes:
      "Large Forest Lawn cluster; trades and hospitality workers dominate. Many establish Canadian credit with NewWheels' first financed vehicle.",
  },
  {
    id: "arabic-speaking",
    slugFragment: "arabic-speaking",
    fullName: "Arabic-speaking community in Calgary",
    shortName: "Arabic-speaking",
    language: "Arabic",
    langCode: "ar",
    primaryCalgaryNeighbourhoods: ["Forest Lawn", "Marlborough", "Saddle Ridge", "Martindale", "Pineridge"],
    visaPathways: ["Refugee pathway", "Express Entry PR", "Family-class PR"],
    cultureNotes:
      "Many Syrian, Lebanese, Iraqi, and Egyptian households arrived through refugee or family-class pathways. Multi-generational co-signing is common; family-SUV demand outpaces sedans.",
  },
  {
    id: "somali",
    slugFragment: "somali",
    fullName: "Somali community in Calgary",
    shortName: "Somali",
    language: "Somali",
    primaryCalgaryNeighbourhoods: ["Forest Lawn", "Marlborough", "Penbrooke Meadows", "Falconridge"],
    visaPathways: ["Refugee pathway", "Family-class PR"],
    cultureNotes:
      "Cash-flow income (rideshare, hospitality, contract labour) frequently underwrites these applications. Many enter NewWheels through rideshare-driver financing.",
  },
  {
    id: "nigerian",
    slugFragment: "nigerian",
    fullName: "Nigerian community in Calgary",
    shortName: "Nigerian",
    language: "English",
    primaryCalgaryNeighbourhoods: ["Saddle Ridge", "Cornerstone", "Redstone", "Cityscape"],
    visaPathways: ["Express Entry PR", "PGWP", "Family-class sponsorship", "Study permit → PGWP"],
    cultureNotes:
      "Fastest-growing newcomer cluster in Calgary (2022–2025); heavy healthcare, IT, and finance professional concentration. Often hit prime tier within 12 months of landing.",
  },
  {
    id: "korean",
    slugFragment: "korean",
    fullName: "Korean community in Calgary",
    shortName: "Korean",
    language: "Korean",
    primaryCalgaryNeighbourhoods: ["NW Calgary", "Tuscany", "Edgemont", "Hamptons"],
    visaPathways: ["Study permit → PGWP", "Express Entry PR", "Investor / entrepreneur PR"],
    cultureNotes:
      "Strong Hyundai and Kia preference; substantial second-vehicle demand once spouses gain employment.",
  },
  {
    id: "vietnamese",
    slugFragment: "vietnamese",
    fullName: "Vietnamese community in Calgary",
    shortName: "Vietnamese",
    language: "Vietnamese",
    primaryCalgaryNeighbourhoods: ["Marlborough", "Forest Lawn", "Pineridge"],
    visaPathways: ["Family-class sponsorship", "Refugee pathway (historical)", "PGWP"],
    cultureNotes:
      "Multi-generational households; reliable Japanese-make preference (Toyota Corolla, Honda Civic, Camry).",
  },
  {
    id: "chinese-mandarin",
    slugFragment: "chinese-mandarin",
    fullName: "Chinese (Mandarin-speaking) community in Calgary",
    shortName: "Mandarin-speaking",
    language: "Mandarin",
    primaryCalgaryNeighbourhoods: ["NW Calgary", "Tuscany", "Aspen Woods", "Citadel", "Beacon Hill"],
    visaPathways: ["Investor / entrepreneur PR", "Study permit → PGWP", "Express Entry"],
    cultureNotes:
      "Premium-make demand outpaces market average (Lexus, Audi, Mercedes). Cash-down purchases are common but financing is increasingly used to preserve liquidity.",
  },
];

export function communityBySlugFragment(fragment: string): Community | undefined {
  return COMMUNITIES.find(c => c.slugFragment === fragment);
}
