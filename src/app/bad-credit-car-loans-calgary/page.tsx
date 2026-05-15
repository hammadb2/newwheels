import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import HubSpokes from "@/components/HubSpokes";
import { buildMetadata } from "@/lib/seo";
import { badCreditSpokes } from "@/lib/hub-spokes";

const SLUG = "/bad-credit-car-loans-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Bad Credit Car Loans Calgary | Approved in 24 Hours",
  description:
    "Bad credit car loans in Calgary. No minimum credit score. SE oil workers, NE newcomers, NW professionals. 24-hour approval. Up to 6 months of payments covered.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can I get a car loan in Calgary with bad credit?",
    answer:
      "Yes. NewWheels works with Calgary lenders who approve subprime files every day. There is no minimum credit score. We look at income stability, employment, and down payment together with credit.",
  },
  {
    question: "What is the minimum credit score required at NewWheels?",
    answer:
      "There isn't one. We've approved files in the 400s. A score below 600 means a higher rate, not a denial. We tell you the exact rate up front before you commit.",
  },
  {
    question: "How does NewWheels cover 6 months of payments?",
    answer:
      "On qualified deals, NewWheels structures the financing so your first 6 payments are covered. The exact mechanism depends on the deal. Your specialist walks you through the math on the call.",
  },
  {
    question: "How long does approval take for bad credit in Calgary?",
    answer:
      "Most subprime files have an answer within 24 hours. We can usually have you driving within 72 hours of applying.",
  },
  {
    question: "What documents do I need for a bad credit car loan in Calgary?",
    answer:
      "Two pieces of Calgary photo ID, proof of income (recent paystub or 3-month bank statement for self-employed), proof of address, and Canadian driver's licence. That's it.",
  },
  {
    question: "Will applying affect my credit score?",
    answer:
      "No. Our application is a soft inquiry only. A hard pull only happens after you confirm the lender terms, and even then it's a single pull, not the scattershot multi-inquiry damage that other Calgary brokers cause.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Bad credit car loans in Calgary, approved in 24 hours"
      tagline="Bad credit Calgary"
      intro="Bad credit doesn't disqualify you in Calgary. It just changes which lender we send your file to. We finance discharged bankruptcies, R7 collections, repossessions, and credit in the 400s every week, and we tell you the rate before you commit."
      breadcrumb={[{ name: "Bad Credit", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Bad credit? We've seen worse. Apply free."
      internalLinks={[
        { href: "/car-loan-after-bankruptcy-calgary", label: "Car loan after bankruptcy" },
        { href: "/consumer-proposal-car-loan-calgary", label: "Car loan during a consumer proposal" },
        { href: "/calculator", label: "Estimate your bad credit payment →" },
        { href: "/how-it-works", label: "How the 3-step process works" },
      ]}
    >
      <h2>Calgary has a specific bad-credit story, and your lender file has to match it</h2>
      <p>
        The boom-and-bust energy economy means a lot of Calgarians have credit damage from
        downturn-era job losses, missed Suncor or Cenovus contractor invoices, or a divorce
        during the 2014-2016 oil collapse. Lenders know this. SE Calgary contractors in Forest
        Lawn and Dover often get approved at better rates than their score suggests because the
        lender weights their income history more than their FICO. NE Calgary newcomers with
        thin Canadian credit need a different lender (usually NCF, ICCU, or Coast Capital)
        that prices off employment stability rather than score. NW professionals rebuilding
        after a proposal need a fourth lender entirely.
      </p>
      <p>
        AutoNova and the algorithm brokers don&apos;t make that distinction. They submit your
        file blindly. Our team picks the lender by hand. That&apos;s the difference.
      </p>

      <h2>What &quot;bad credit&quot; actually looks like to a Calgary auto lender</h2>
      <ul>
        <li>
          <strong>Score 600-680.</strong> Tier-2 alternative prime. Rates run roughly 8-11%. Fast
          approval, usually 24 hours.
        </li>
        <li>
          <strong>Score 500-599.</strong> True subprime. Rates 12-17% depending on income and down
          payment. Down payment of 5-10% usually unlocks a better rate.
        </li>
        <li>
          <strong>Score under 500 or active collections.</strong> Deep subprime. Rates 17-22%. We
          target a 24-month rebuild. Pay this loan on time, refinance at 12 months into a normal
          rate.
        </li>
        <li>
          <strong>Discharged bankruptcy.</strong> Mainstream subprime treats discharged bankruptcy
          almost identically to a 580 score. Lenders care about behaviour <em>after</em>{" "}
          discharge, not the discharge itself.
        </li>
      </ul>

      <h2>The Calgary rebuild path: what we actually recommend</h2>
      <ol>
        <li>
          Take a 60- or 72-month term, not 84. You pay less interest and the loan is paid down
          fast enough that refinancing at 12-18 months is realistic.
        </li>
        <li>
          Make every payment on time. Set up pre-authorised debits on payday. One late payment
          erases six months of rebuild.
        </li>
        <li>
          At 12 months, your score should be 100+ points higher. We refinance you into a prime
          rate. Your monthly drops, and the rest of the loan costs you a fraction of what it
          would have.
        </li>
      </ol>

      <h2>What we do that AutoNova doesn&apos;t</h2>
      <p>
        We&apos;ll tell you when <em>not</em> to buy. If your situation calls for 3 months of
        on-time rent receipts before you apply, we&apos;ll say so. If your debt-to-income is
        too high and a $400 monthly will push you into default, we won&apos;t sell you the
        loan. That&apos;s the AMVIC standard, that&apos;s the NewWheels standard, and
        that&apos;s what we built NewWheels on.
      </p>

      <HubSpokes
        title="Bad credit financing across Calgary"
        intro="Every neighbourhood and every make has different subprime lender economics. Jump straight to the page that fits your situation."
        groups={[
          {
            heading: "By Calgary location",
            blurb: "Same subprime program, neighbourhood-specific lender notes.",
            spokes: badCreditSpokes().byLocation,
          },
          {
            heading: "By vehicle make",
            blurb: "Subprime financing structured around the make-specific rate floor.",
            spokes: badCreditSpokes().byMake,
          },
        ]}
      />
    </PageShell>
  );
}
