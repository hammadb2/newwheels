import type { Metadata } from "next";
import { LANGUAGE_HREFLANG, SITE_NAME, SITE_URL, fullUrl } from "./site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  imageAlt?: string;
  // When true (default) emit hreflang alternates pointing at the same path
  // under every language prefix in LANGUAGE_HREFLANG. Set false on pages that
  // are intentionally English-only (e.g. privacy policy legal copy).
  multilingual?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  imageAlt,
  multilingual = true,
}: SeoInput): Metadata {
  const canonical = fullUrl(path);
  const ogImage = fullUrl("/og.png");
  // og.png is regenerated from public/og.svg at build time. The PNG is what most social platforms read.
  // Bare title in <title> to respect Google's 50-60 char limit; brand suffix
  // appears in OG/Twitter cards (which display larger and outside SERPs).
  const socialTitle = title.endsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // hreflang alternates. We declare every language prefix from
  // LANGUAGE_HREFLANG up front even though the translated content lands in a
  // later PR — this reserves the namespace and prevents Google from picking
  // the wrong canonical when translated subroutes go live. The English
  // canonical doubles as x-default which is what Google expects for fallback.
  const languages: Record<string, string> = {};
  if (multilingual) {
    for (const [code, prefix] of Object.entries(LANGUAGE_HREFLANG)) {
      const url = prefix === "" ? fullUrl(path) : fullUrl(`${prefix}${path}`);
      languages[code] = url;
    }
  }

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      ...(multilingual ? { languages } : {}),
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_CA",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt || socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
