import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import { BUSINESS } from "@/lib/site";

const SLUG = "/privacy";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — NewWheels Calgary (PIPEDA Compliant)",
  description:
    "How NewWheels collects, uses, and protects your personal information. PIPEDA compliant. No selling, no sharing without consent, full opt-out at any time.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Does NewWheels sell my personal information?",
    answer: "No. We never sell or rent your information to third parties. Lender submissions are explicit opt-in only.",
  },
  {
    question: "Is the application form a hard credit pull?",
    answer: "No. The application is a soft inquiry only. A hard credit pull only happens after you confirm the lender terms in writing.",
  },
  {
    question: "How do I delete my information from your systems?",
    answer: `Email ${BUSINESS.email} with subject "PIPEDA deletion request" and we remove your record within 30 days.`,
  },
  {
    question: "What tracking does the website use?",
    answer:
      "Google Tag Manager, Google Analytics 4, Facebook Pixel, and Microsoft Clarity. All can be blocked with standard browser settings or a Do Not Track flag.",
  },
  {
    question: "Where is my information stored?",
    answer: "On Canadian and US servers operated by Vercel, Resend, and Google. All compliant with PIPEDA cross-border transfer rules.",
  },
  {
    question: "Who can I contact about a privacy concern?",
    answer: `Email ${BUSINESS.email} or call ${BUSINESS.phone}. Hammad is the designated privacy contact for NewWheels.`,
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      slug={SLUG}
      title="NewWheels privacy policy"
      tagline="Privacy & PIPEDA"
      intro="We handle personal information the way we'd want our own handled — minimum collection, no selling, no surprises. This page explains exactly what we collect, why, where it goes, and how to delete it. PIPEDA-compliant under Canadian federal privacy law."
      breadcrumb={[{ name: "Privacy", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Still want to apply? Go ahead."
      internalLinks={[
        { href: "/", label: "Back to homepage" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/about", label: "About NewWheels" },
        { href: "/calculator", label: "Calculator" },
      ]}
    >
      <h2>What we collect</h2>
      <ul>
        <li>Name, phone, email, employment status, credit situation, and immigration status (only if applicable) — submitted by you on the application form.</li>
        <li>Page-level analytics (page views, time on page, scroll depth) — collected by Google Analytics 4 via Google Tag Manager.</li>
        <li>Session recordings and heatmaps — collected by Microsoft Clarity.</li>
        <li>Marketing audience data — collected by Facebook Pixel for retargeting if you visited NewWheels via a paid ad.</li>
        <li>IP address and browser metadata — logged by Vercel (our hosting provider) for security.</li>
      </ul>

      <h2>What we use it for</h2>
      <ul>
        <li>Contacting you about your car-loan application.</li>
        <li>Submitting your file to Canadian lenders <em>only with your explicit consent</em>.</li>
        <li>Measuring which pages help Calgary buyers and which don&apos;t.</li>
        <li>Detecting and preventing fraud.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Only the lender(s) you authorise during the application phone call. We don&apos;t sell
        leads to other brokers. We don&apos;t hand off your data to dealership networks
        outside what&apos;s required for the specific deal you&apos;re working on with us.
      </p>

      <h2>Your rights under PIPEDA</h2>
      <ul>
        <li>Access — request a copy of everything we hold about you.</li>
        <li>Correction — fix any inaccurate information.</li>
        <li>Deletion — we delete within 30 days of a written request.</li>
        <li>Opt-out — at any time, by any channel.</li>
      </ul>

      <h2>How to make a request</h2>
      <p>
        Email <a className="underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>{" "}
        with the subject &quot;PIPEDA request&quot; and the type of request (access,
        correction, deletion, opt-out). We respond within 5 business days and complete the
        request within 30 days.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        We use first-party cookies for application form state and third-party cookies for the
        analytics tools listed above. You can disable cookies in your browser settings; the
        application form still works (it just stops tracking conversions, which only affects
        our analytics, not your experience).
      </p>

      <h2>Last updated</h2>
      <p>This policy was last updated on the launch date of newwheels.ca.</p>
    </PageShell>
  );
}
