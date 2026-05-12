import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/self-employed-car-loan-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Self-Employed Car Loan Calgary — Oil & Gas, Trades, Gig Workers",
  description:
    "Self-employed car loans in Calgary for oil and gas contractors, trades workers, and gig economy. We accept NOAs, bank statements, and contracts as income proof. 24-hour approval.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can I get a car loan in Calgary if I'm self-employed with no T4?",
    answer:
      "Yes. Calgary has more self-employed buyers than any city in Canada because of the energy sector. Lenders here are used to NOA, bank statements, and contract income as proof.",
  },
  {
    question: "What counts as proof of income for a self-employed Calgary buyer?",
    answer:
      "Two years of Notice of Assessment (NOA) is the gold standard. Alternatives: 6 months of business bank statements, signed contracts on letterhead, or a CRA stated-income form.",
  },
  {
    question: "I'm an oil-and-gas contractor — does irregular income disqualify me?",
    answer:
      "No. We average your last 12–24 months. As long as the average supports the payment, the lumpiness doesn't matter. Calgary's contract economy means this is a routine file for us.",
  },
  {
    question: "Do gig workers (Uber, SkipTheDishes, Instacart) qualify?",
    answer:
      "Yes, with 6 months of consistent earnings statements from the platform. We average your monthly take-home and apply standard debt-to-income ratios.",
  },
  {
    question: "Can I write off the vehicle on my taxes?",
    answer:
      "Yes — if used for business. We can structure the loan as a lease or finance with applicable Section 67.2 / CCA Class 10 deductions in mind. Talk to your accountant for specifics.",
  },
  {
    question: "What if I show low income on paper to minimise tax?",
    answer:
      "We know. Calgary self-employed buyers regularly understate income for tax purposes. We use stated-income programs that look at bank deposits rather than line 150. Be honest with us — we'll structure the file correctly.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Self-employed car loans in Calgary"
      tagline="Self-employed"
      intro="Oil and gas contractors, electricians, plumbers, drywallers, Uber drivers, photographers — Calgary's self-employed economy is enormous. Most online brokers can't handle non-T4 income. We can. NOA, bank statements, contracts, or platform earnings statements all work as income proof."
      breadcrumb={[{ name: "Self-Employed", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Self-employed in Calgary? You're our specialty."
      internalLinks={[
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit car loans Calgary" },
        { href: "/first-time-car-buyer-calgary", label: "First-time buyer Calgary" },
        { href: "/calculator", label: "Estimate your payment →" },
        { href: "/how-it-works", label: "How it works" },
      ]}
    >
      <h2>Three Calgary self-employed profiles we approve every week</h2>
      <h3>Oil and gas contractor / consultant</h3>
      <p>
        Day rates of $800–2,000, working 21-and-7 rotations out of Fort Mac or the SAGD plants.
        The lender we use averages 24 months of NOA — your last 60 days of inactivity
        doesn&apos;t torpedo the file as long as the average holds. Tip: bring 6 months of
        bank statements showing deposit history; it strengthens the file dramatically.
      </p>
      <h3>Trades worker (electrician, plumber, mechanic, drywaller)</h3>
      <p>
        Often incorporated as a numbered Alberta company. We finance the truck or work van as
        a business expense — the same lender that funds your file can sometimes deduct GST too.
        Bring your last NOA and the corporate bank statements; we handle the rest.
      </p>
      <h3>Gig and platform workers</h3>
      <p>
        Uber, DoorDash, Skip, Instacart, Lyft. The lenders that didn&apos;t touch this category
        in 2018 fight for it now. Six months of platform earnings statements is enough. Most
        Calgary gig workers approve at 11–14% with a 10% down payment.
      </p>

      <h2>Income-proof options — pick whichever you have</h2>
      <ul>
        <li><strong>NOA</strong> — Notice of Assessment from CRA. Two years is the gold standard.</li>
        <li><strong>Business bank statements</strong> — 6 months. We average net deposits.</li>
        <li><strong>Contracts</strong> — Signed, on letterhead, with day rate and duration.</li>
        <li><strong>Platform earnings</strong> — Direct from Uber, Skip, Instacart, etc.</li>
        <li><strong>Stated-income program</strong> — For privacy-sensitive buyers. Available for clients with $5K+ in down payment.</li>
      </ul>

      <h2>What we tell every self-employed Calgary buyer</h2>
      <p>
        Don&apos;t over-buy. The 2014 oil crash put a lot of contractors into vehicles they
        couldn&apos;t afford during the downturn. Pick a payment that&apos;s 8–10% of your
        average monthly net — not 15%. If oil drops 30% next year you still want to be able to
        make the payment without bleeding savings.
      </p>
    </PageShell>
  );
}
