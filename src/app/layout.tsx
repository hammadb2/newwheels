import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Bricolage_Grotesque } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallClickTracker from "@/components/CallClickTracker";
import ApplyAnchorScroll from "@/components/ApplyAnchorScroll";
import MarketingChrome from "@/components/MarketingChrome";
import { TrackingBody, TrackingHead } from "@/components/Tracking";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, TRACKING } from "@/lib/site";

const APP_SUBDOMAINS = ["crm", "portal", "apply", "team", "docs"];

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | Car Loans Calgary, No Credit & Bad Credit Welcome`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: TRACKING.gscVerification || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0E3D24",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const host = (hdrs.get("host") ?? "").split(":")[0].toLowerCase();
  const hideChrome = APP_SUBDOMAINS.some((s) => host.startsWith(`${s}.`));

  return (
    <html lang="en-CA" className={bricolage.variable}>
      <head>
        <TrackingHead />
      </head>
      <body className="bg-brand-creamSoft font-sans text-brand-ink">
        <a className="skip-link" href="#main">Skip to content</a>
        <TrackingBody />
        <MarketingChrome hidden={hideChrome}>
          <Header />
          <CallClickTracker />
          <ApplyAnchorScroll />
        </MarketingChrome>
        <main id="main">{children}</main>
        <MarketingChrome hidden={hideChrome}>
          <Footer />
        </MarketingChrome>
      </body>
    </html>
  );
}
