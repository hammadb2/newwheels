import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import { teamSchema } from "@/lib/schema";
import { BUSINESS } from "@/lib/site";

const SLUG = "/about";

export const metadata: Metadata = buildMetadata({
  title: "About NewWheels Calgary | Vehicle Financing Lead Generation Platform",
  description:
    "NewWheels was founded to fix how newcomers and bad-credit buyers get financed. One application, matched to AMVIC-licensed dealer partners across Calgary and Alberta, one call from a real person.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Who runs NewWheels Calgary?",
    answer:
      "NewWheels is run by a Calgary automotive finance team with years of experience in subprime and newcomer financing.",
  },
  {
    question: "Is NewWheels a real Calgary business?",
    answer:
      "Yes. We have a Calgary address (listed in the footer) and an Alberta-registered phone number. NewWheels is a lead generation platform that connects Calgary buyers with AMVIC-licensed dealer partners. We're not a national broker pretending to be local.",
  },
  {
    question: "What's AMVIC and how does it apply to NewWheels?",
    answer:
      "AMVIC (Alberta Motor Vehicle Industry Council) licenses every legal vehicle salesperson and dealership in Alberta. NewWheels is a lead generation platform, not a dealership or licensed automotive retailer, so an AMVIC licence is not required for what we do. NewWheels works exclusively with AMVIC-licensed dealer partners across Calgary and Alberta.",
  },
  {
    question: "How is NewWheels different from AutoNova or Canada Drives?",
    answer:
      "We're a Calgary specialist with a named team responsible for every file. AutoNova is a generic broker, Canada Drives is a national algorithm. We pick up the phone within an hour. We know which Calgary lender to send your file to. And our 6-months-covered offer is unique in Calgary. Nobody else does it on new vehicles.",
  },
  {
    question: "Who handles my application?",
    answer:
      "A specialist reviews every application personally and calls you within 1 hour, then refers your file to an AMVIC-licensed dealer partner that best matches your situation.",
  },
  {
    question: "Which dealers do you work with?",
    answer:
      "NewWheels works exclusively with AMVIC-licensed dealer partners across Calgary and Alberta. After your application is reviewed, your file is referred to the partner most likely to approve you at the best rate.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title="About NewWheels — Calgary's specialist vehicle financing platform"
      tagline="About"
      intro="NewWheels was founded by a Calgary automotive finance specialist who watched newcomers and bad-credit buyers get burned by faceless national brokers. Built to fix that — one application, one matched lender, one phone call from a real person who knows Calgary."
      breadcrumb={[{ name: "About", path: SLUG }]}
      faq={FAQ}
      extraSchema={[teamSchema()]}
      ctaHeading="Want to talk to a specialist? Apply free."
      internalLinks={[
        { href: "/how-it-works", label: "How our process works" },
        { href: "/nissan-financing-calgary", label: "Nissan financing Calgary" },
        { href: "/team", label: "Meet the team" },
        { href: "/", label: "Back to homepage" },
        { href: "/privacy", label: "Privacy policy" },
      ]}
    >
      <h2>Who NewWheels is</h2>
      <p>
        NewWheels is a Calgary-only vehicle financing lead generation platform. The
        company was founded by a Calgary automotive finance specialist with years of
        subprime, newcomer, and visa-pathway financing experience. NewWheels operates
        from Calgary, Alberta and serves buyers across the Calgary metro area plus the
        surrounding cities (Airdrie, Cochrane, Okotoks, Chestermere, Strathmore, High
        River, Crossfield, Carstairs). NewWheels works exclusively with AMVIC-licensed
        dealer partners across Calgary and Alberta.
      </p>

      <h2>What NewWheels does</h2>
      <p>
        NewWheels matches Calgary car buyers to the single lender most likely to approve
        their file at the best rate, then handles every step from application to keys.
        That includes lender selection, documentation, dealer coordination, trade-in
        valuation, and final paperwork. Customers go through one application and one
        soft credit pull, instead of the five hard pulls that national brokers blast
        across the bureau.
      </p>

      <h2>Who NewWheels serves</h2>
      <p>
        Calgary residents and surrounding Alberta buyers — specifically: bad credit
        (scores under 600), newcomers to Canada (PR, work permit, study permit, refugee
        status), self-employed and gig workers, first-time buyers, post-bankruptcy and
        consumer-proposal buyers, and the Filipino, South Asian, Punjabi, Tamil, Hindi,
        Latin American, Arabic, Somali, Nigerian, Korean, and Vietnamese communities of
        Calgary.
      </p>

      <h2>Where NewWheels operates</h2>
      <p>
        Service area covers Calgary&rsquo;s four quadrants (NE, SE, SW, NW) plus
        downtown and every major neighbourhood (Forest Lawn, Marlborough, Falconridge,
        Saddle Ridge, Martindale). Surrounding cities served: Airdrie, Cochrane,
        Okotoks, Chestermere, Strathmore, High River, Crossfield, Carstairs. Hours are
        Monday to Saturday 9 AM to 7 PM Mountain Time; closed Sundays.
      </p>

      <h2>What makes NewWheels different</h2>
      <p>
        Unlike AutoNova Finance or Canada Drives, NewWheels is a Calgary-only specialist
        with a named team responsible for every file. Unlike national algorithm brokers,
        every application is reviewed by a real licensed specialist who calls within an
        hour. Unlike most subprime brokers, NewWheels offers up to 6 months of car
        payments covered on qualified deals — an offer no other Calgary broker or dealer
        runs on new vehicles.
      </p>

      <h2>Why NewWheels was built</h2>
      <p>
        NewWheels was built because there was no honest option for Calgary buyers with bad credit,
        no credit, or non-standard income. The national brokers like AutoNova and Canada Drives
        treat every file the same. They run your application through an algorithm, blast it to
        five lenders at once, damage your bureau with hard pulls, and send you a generic
        approval email. Nobody calls you. Nobody knows which Calgary lender actually fits your
        file. NewWheels was built to be the opposite of that: one application, one matched lender, one
        phone call from a real person who knows Calgary.
      </p>

      <h2>The Calgary story</h2>
      <p>
        Our founding specialist has sold cars in Calgary long enough to see two oil downturns, two newcomer
        booms, and every credit situation a Canadian can have. Forest Lawn welders rebuilding
        after a layoff. SAIT graduates buying their first vehicle. Filipino caregivers on PGWP
        who saved every dollar for a year. Each file is different. Each deserves a real human
        on the other end.
      </p>
      <p>
        AutoNova&apos;s playbook is to push every file through the same generic lender list. We
        watched that approach burn applicants for years. They&apos;d submit to five places at
        once, wreck the bureau with hard pulls, and end up with a worse rate than they should
        have gotten. NewWheels does the opposite: one application, one matched
        lender, one phone call from a real Calgary specialist.
      </p>

      <h2>Why the dealer relationship matters</h2>
      <p>
        Being connected to the dealer floor gives our team access to manufacturer programs that
        independent brokers never see. The Nissan Rogue at $99/week, the Kicks at 0%
        financing, the Sentra newcomer program. Those come from inside the dealer network. We
        bring them to NewWheels customers first.
      </p>
      <p>
        NewWheels works exclusively with AMVIC-licensed dealer partners across Calgary and
        Alberta. The Alberta Motor Vehicle Industry Council (AMVIC) licenses every legal
        vehicle salesperson and dealership in Alberta as a consumer-protection requirement.
        Every Calgary buyer deserves to deal with a sales professional who is actually
        licensed and accountable, which is why we only refer applicants to AMVIC-licensed
        partners.
      </p>

      <h2>The 6 months covered story</h2>
      <p>
        Nobody else in Calgary does it on new vehicles. We built the offer because the first 6
        months after a new car purchase are the hardest: registration, insurance setup, new
        tires before winter, unexpected expenses. If we can lift the loan payment for those 6
        months we dramatically reduce the failure rate. That&apos;s the whole point of
        responsible subprime lending: structure the deal so the buyer actually succeeds.
      </p>

      <h2>What this site is</h2>
      <p>
        Plain English. Calgary specifics. No buzzwords. If something on this site is wrong,
        outdated, or unclear, email us directly at{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>. We
        update the pages whenever lender programs or Alberta consumer-protection rules
        change.
      </p>
    </PageShell>
  );
}
