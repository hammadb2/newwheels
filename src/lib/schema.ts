import { BUSINESS, SITE_NAME, SITE_URL, fullUrl } from "./site";

export type FaqItem = { question: string; answer: string };

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "FinancialService"],
    "@id": `${SITE_URL}#business`,
    name: SITE_NAME,
    description:
      "Calgary vehicle financing for bad credit, newcomers, and work-permit holders. Up to 6 months of payments covered on qualified deals.",
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    image: fullUrl("/og.png"),
    logo: fullUrl("/logo-horizontal.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.locality,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postal,
      addressCountry: BUSINESS.address.country,
    },
    areaServed: BUSINESS.serviceAreas.map(name => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    priceRange: "Free to apply",
    sameAs: Object.values(BUSINESS.socials),
    employee: {
      "@type": "Person",
      name: `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`,
      jobTitle: "Automotive Finance Specialist",
      description: "AMVIC-licensed automotive sales professional in Calgary, Alberta.",
    },
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "NewWheels helps Calgary residents get approved for vehicle financing regardless of credit history.",
    inLanguage: "en-CA",
    publisher: { "@id": `${SITE_URL}#business` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: fullUrl("/logo-horizontal.png"),
    sameAs: Object.values(BUSINESS.socials),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.phone,
        contactType: "customer service",
        areaServed: "CA",
        availableLanguage: ["English", "Tagalog"],
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: fullUrl(item.path),
    })),
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl(opts.path) },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    inLanguage: "en-CA",
    image: [fullUrl("/og.png")],
    author: {
      "@type": "Person",
      name: opts.authorName || `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`,
      jobTitle: "Automotive Finance Specialist",
      worksFor: { "@type": "Organization", name: SITE_NAME },
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: fullUrl("/logo-horizontal.png") },
    },
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`,
    jobTitle: "Automotive Finance Specialist",
    worksFor: { "@type": "Organization", name: SITE_NAME },
    description:
      "AMVIC-licensed automotive sales professional in Calgary who specializes in financing solutions for newcomers, credit rebuilds, and self-employed buyers.",
    image: fullUrl("/hammad.jpg"),
    url: fullUrl("/about"),
    knowsAbout: [
      "Vehicle financing",
      "Newcomer car loans",
      "Bad credit auto loans",
      "Consumer proposal car loans",
      "AMVIC compliance",
    ],
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NewWheels Car Loan Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: fullUrl("/calculator"),
    description:
      "Free Calgary car loan calculator. Estimate your monthly payment, interest, and Alberta no-PST savings before you apply.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}
