import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, fullUrl } from "./site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  imageAlt?: string;
};

export function buildMetadata({ title, description, path, imageAlt }: SeoInput): Metadata {
  const canonical = fullUrl(path);
  const ogImage = fullUrl("/og.png");
  // og.png is regenerated from public/og.svg at build time. The PNG is what most social platforms read.
  // Bare title in <title> to respect Google's 50-60 char limit; brand suffix
  // appears in OG/Twitter cards (which display larger and outside SERPs).
  const socialTitle = title.endsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
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
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}
