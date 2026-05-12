import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallClickTracker from "@/components/CallClickTracker";
import { TrackingBody, TrackingHead } from "@/components/Tracking";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, TRACKING } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Car Loans Calgary, No Credit & Bad Credit Welcome`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: TRACKING.gscVerification || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#1A7A4A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={inter.variable}>
      <head>
        <TrackingHead />
      </head>
      <body className="bg-white font-sans text-brand-ink">
        <a className="skip-link" href="#main">Skip to content</a>
        <TrackingBody />
        <Header />
        <CallClickTracker />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
