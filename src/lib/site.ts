// Single source of truth for site-wide constants.
// Anything you might want to swap when going live (phone, address, IDs)
// is wired through env vars and falls back to safe defaults so the
// site can be built and reviewed end-to-end without credentials.

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
export const SITE_URL = envUrl && envUrl.length > 0 ? envUrl : "https://newwheels.ca";

export const SITE_NAME = "NewWheels";
export const SITE_TAGLINE = "Calgary vehicle financing for bad credit, newcomers, and work permits";
export const SITE_DESCRIPTION =
  "Get approved for a car loan in Calgary in 24 hours. Bad credit, newcomers, work-permit holders, and self-employed buyers welcome. Up to 6 months of payments covered on qualifying deals. Apply free, no obligation.";

export const BUSINESS = {
  name: SITE_NAME,
  legalName: "NewWheels Calgary",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "(587) 900-6051",
  phoneHref: process.env.NEXT_PUBLIC_BUSINESS_PHONE_HREF || "+15879006051",
  email: process.env.LEAD_FROM_EMAIL || "hello@newwheels.ca",
  hours: "Mon-Sat 9 AM - 7 PM",
  address: {
    street: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_STREET || "Calgary, AB",
    locality: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_LOCALITY || "Calgary",
    region: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_REGION || "AB",
    postal: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_POSTAL || "",
    country: "CA",
  },
  amvic: process.env.NEXT_PUBLIC_AMVIC_LICENSE || "AMVIC licence on file",
  amvicRegistryUrl: "https://www.amvic.org/consumers/check-amvic-licensed-businesses-salespeople/",
  hammadLastName: process.env.NEXT_PUBLIC_HAMMAD_LAST_NAME || "",
  serviceAreas: [
    "Calgary",
    "Airdrie",
    "Cochrane",
    "Okotoks",
    "Chestermere",
    "Strathmore",
    "High River",
  ],
  socials: {
    facebook: "https://facebook.com/newwheelsca",
    instagram: "https://instagram.com/newwheels.ca",
    linkedin: "https://www.linkedin.com/company/newwheels",
  },
};

export const TRACKING = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "",
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
};

export function fullUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}

// Phase 1 page registry. Powers nav, footer, sitemap, and internal-link logic.
export type SitePage = {
  slug: string;
  title: string;
  shortTitle: string;
  group: "core" | "situation" | "info" | "blog" | "vehicle";
};

export const PAGES: SitePage[] = [
  { slug: "/", title: "Home", shortTitle: "Home", group: "core" },
  { slug: "/bad-credit-car-loans-calgary", title: "Bad Credit Car Loans Calgary", shortTitle: "Bad Credit", group: "situation" },
  { slug: "/newcomer-car-loans-calgary", title: "Newcomer Car Loans Calgary", shortTitle: "Newcomers", group: "situation" },
  { slug: "/car-loan-work-permit-calgary", title: "Work Permit Car Loans Calgary", shortTitle: "Work Permit", group: "situation" },
  { slug: "/car-loan-after-bankruptcy-calgary", title: "Car Loan After Bankruptcy Calgary", shortTitle: "After Bankruptcy", group: "situation" },
  { slug: "/self-employed-car-loan-calgary", title: "Self-Employed Car Loans Calgary", shortTitle: "Self-Employed", group: "situation" },
  { slug: "/first-time-car-buyer-calgary", title: "First-Time Car Buyer Calgary", shortTitle: "First-Time Buyer", group: "situation" },
  { slug: "/consumer-proposal-car-loan-calgary", title: "Consumer Proposal Car Loans Calgary", shortTitle: "Consumer Proposal", group: "situation" },
  { slug: "/how-it-works", title: "How It Works", shortTitle: "How It Works", group: "info" },
  { slug: "/about", title: "About NewWheels", shortTitle: "About", group: "info" },
  { slug: "/calculator", title: "Car Loan Calculator Calgary", shortTitle: "Calculator", group: "core" },
  { slug: "/nissan-financing-calgary", title: "Nissan Financing Calgary", shortTitle: "Nissan Financing", group: "vehicle" },
  { slug: "/blog", title: "NewWheels Blog", shortTitle: "Blog", group: "blog" },
  { slug: "/privacy", title: "Privacy Policy", shortTitle: "Privacy", group: "info" },
];

export const PRIMARY_NAV: SitePage[] = PAGES.filter(p =>
  ["/", "/how-it-works", "/calculator", "/nissan-financing-calgary", "/about", "/blog"].includes(p.slug),
);

export const SITUATION_NAV: SitePage[] = PAGES.filter(p => p.group === "situation");
