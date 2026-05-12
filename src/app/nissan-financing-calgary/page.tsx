import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

const SLUG = "/nissan-financing-calgary";

export const metadata: Metadata = buildMetadata({
  title: "Nissan Financing Calgary — Rogue, Kicks, Sentra Programs",
  description:
    "Brand-new 2026 Nissan financing in Calgary through Hammad at South Trail Nissan. Rogue, Kicks, Sentra, and Armada with current manufacturer programs. Newcomer and bad credit welcome.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Can NewWheels really finance a brand-new Nissan in Calgary?",
    answer:
      "Yes. Hammad works at South Trail Nissan in Calgary. New 2026 Rogue, Kicks, Sentra, Armada, and Pathfinder are all available with current Nissan Canada Finance programs.",
  },
  {
    question: "What current Nissan promotions are available in Calgary?",
    answer:
      "Programs change monthly. Recent promotions include Rogue from $99/week with $0 down, 0% financing on Kicks, and a Sentra newcomer program for first-time buyers. We tell you the current month's programs on the call.",
  },
  {
    question: "Can newcomers get a new Nissan with no Canadian credit?",
    answer:
      "Yes. The Nissan Canada Finance newcomer program approves PGWP holders, LMIA work-permit holders, and new PRs without Canadian credit history. Typically the rates beat third-party subprime.",
  },
  {
    question: "Can I get a Nissan with bad credit in Calgary?",
    answer:
      "Yes. Bad credit Nissan financing routes through subprime partner lenders. Rates are higher (13–18%) but approvals are routine.",
  },
  {
    question: "Where is South Trail Nissan?",
    answer:
      "6520 50 Avenue SE, Calgary. We do most of the paperwork remotely — you only need to visit for final signing and vehicle delivery.",
  },
  {
    question: "Is leasing or financing better for a Nissan in Calgary?",
    answer:
      "Depends on your usage. Sub-15,000 km/year drivers often save with a lease. Calgary commuters from Airdrie or Cochrane usually finance. We model both on the calculator so you can decide.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="Nissan financing in Calgary — through Hammad at South Trail"
      tagline="Nissan financing"
      intro="The reason every other Calgary broker can't match this page: they don't have a dealer relationship. We do. Hammad is on the floor at South Trail Nissan and brings the current Nissan Canada Finance programs to NewWheels customers directly — including new-vehicle approvals for newcomers and credit rebuilds."
      breadcrumb={[{ name: "Nissan Financing", path: SLUG }]}
      faq={FAQ}
      ctaHeading="Brand-new Nissan in Calgary — apply free."
      internalLinks={[
        { href: "/newcomer-car-loans-calgary", label: "Newcomer car loans (Nissan newcomer program)" },
        { href: "/bad-credit-car-loans-calgary", label: "Bad credit Nissan financing" },
        { href: "/calculator", label: "Estimate your Nissan monthly →" },
        { href: "/about", label: "About Hammad" },
      ]}
    >
      <h2>The Nissan lineup we finance in Calgary</h2>
      <h3>Nissan Rogue — Calgary&apos;s most-financed SUV through NewWheels</h3>
      <p>
        The 2026 Rogue is the Calgary buyer&apos;s default SUV. AWD trims handle Calgary
        winters, the Variable Compression Turbo engine sips fuel, and the trade-in value holds
        better than the Tucson or RAV4 over 5 years. Current programs frequently include $99
        per week with $0 down for qualified buyers. We&apos;ve approved Rogues for newcomers
        through Nissan Canada Finance&apos;s newcomer program at rates that beat third-party
        subprime.
      </p>
      <h3>Nissan Kicks — newcomer and first-time-buyer favourite</h3>
      <p>
        Smallest crossover in the Nissan lineup. Often runs with 0% financing for qualified
        buyers, which means the only thing you pay is principal — a massive advantage for
        first-time buyers building credit. Insurance on the Kicks is also among the lowest in
        Calgary for newer drivers.
      </p>
      <h3>Nissan Sentra — Calgary&apos;s first-car sedan</h3>
      <p>
        SAIT and U of C graduates buy more Sentras than any other vehicle through NewWheels.
        Lowest payment of the new-Nissan lineup, excellent fuel economy for the LRT-deprived
        commute from Airdrie or Cochrane, and the only sedan in the lineup with both heated
        seats and Apple CarPlay standard.
      </p>
      <h3>Nissan Armada — the only Calgary new-vehicle full-size SUV we approve</h3>
      <p>
        For oil-and-gas families, contractors hauling equipment, or anyone with 3+ kids. Higher
        payment, much higher trade-in retention. Often pairs with the 6-months-covered offer
        for first-time Armada buyers.
      </p>

      <h2>Why the dealer relationship matters for Calgary buyers</h2>
      <ul>
        <li>
          <strong>Manufacturer subvention.</strong> Nissan Canada Finance subsidises rates on
          specific models. Independent brokers can&apos;t access these — only the dealer can.
        </li>
        <li>
          <strong>Newcomer programs.</strong> Nissan&apos;s newcomer financing approves work
          permits and PGWP at better rates than third-party subprime. The dealer F&amp;I
          office submits the file.
        </li>
        <li>
          <strong>Dealer holdback and dealer rebates.</strong> Programs that don&apos;t appear
          on the public website — Hammad knows about them in real time.
        </li>
        <li>
          <strong>Trade-in advantage.</strong> South Trail Nissan&apos;s used-car desk can
          appraise your trade in person and apply it as down payment.
        </li>
      </ul>

      <h2>Disclosure — Hammad is a South Trail Nissan salesperson</h2>
      <p>
        We disclose this clearly so you can decide. Hammad is licensed at South Trail Nissan
        and earns a commission on Nissan sales. He also operates NewWheels independently and
        will quote you a non-Nissan vehicle if it&apos;s the right fit. Most Calgary buyers
        end up with a Nissan because the programs are genuinely the best in the city for
        newcomers and credit rebuilds — but we will tell you when another make is the smarter
        buy.
      </p>
    </PageShell>
  );
}
