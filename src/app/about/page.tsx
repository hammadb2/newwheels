import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";
import { personSchema } from "@/lib/schema";
import { BUSINESS } from "@/lib/site";

const SLUG = "/about";

export const metadata: Metadata = buildMetadata({
  title: "About NewWheels Calgary — Hammad's Story & AMVIC Credentials",
  description:
    "About NewWheels and Hammad — your Calgary car-loan specialist at South Trail Nissan. AMVIC licensed, real Calgary address, real story, real specialist who picks up the phone.",
  path: SLUG,
});

const FAQ = [
  {
    question: "Who runs NewWheels Calgary?",
    answer:
      `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}, an AMVIC-licensed automotive sales professional based in Calgary. He works on the floor at South Trail Nissan and built NewWheels to bring those programs and approvals to every Calgary buyer.`,
  },
  {
    question: "Is NewWheels a real Calgary business?",
    answer:
      "Yes. We have a Calgary address (listed in the footer), an Alberta-registered phone number, and an active AMVIC licence linked from every page. We're not a national broker pretending to be local.",
  },
  {
    question: "What's an AMVIC licence and why does it matter?",
    answer:
      "AMVIC (Alberta Motor Vehicle Industry Council) licenses every legal vehicle salesperson and dealership in Alberta. It's a consumer-protection requirement. Unlicensed sellers can't legally advertise vehicle financing in Alberta — if a Calgary lender doesn't display a licence number, that's a red flag.",
  },
  {
    question: "How is NewWheels different from AutoNova or Canada Drives?",
    answer:
      "We're a Calgary specialist with a named person responsible for every file. AutoNova is a generic broker, Canada Drives is a national algorithm. We pick up the phone within an hour. We know which Calgary lender to send your file to. And our 6-months-covered offer is unique in Calgary — nobody else does it on new vehicles.",
  },
  {
    question: "Does Hammad really work at South Trail Nissan?",
    answer:
      "Yes. That's how we offer brand-new 2026 Nissan financing alongside our regular pre-owned and multi-brand loans. South Trail Nissan is the Calgary dealership at 6520 50 Avenue SE.",
  },
  {
    question: "Where can I verify your AMVIC licence?",
    answer:
      "On the official AMVIC public registry. We link to it from every page footer. You can search by licence number or by name.",
  },
];

export default function Page() {
  return (
    <PageShell
      slug={SLUG}
      title={`About NewWheels — built by Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}, your Calgary car-loan specialist`}
      tagline="About"
      intro="NewWheels exists because I got tired of seeing Calgary newcomers, bad-credit buyers, and self-employed contractors get bounced around by faceless online brokers. I'm Hammad. I work at South Trail Nissan. I built NewWheels to bring those approvals — and the 6-months-covered offer — to every Calgary buyer."
      breadcrumb={[{ name: "About", path: SLUG }]}
      faq={FAQ}
      extraSchema={[personSchema()]}
      ctaHeading="Want to talk to Hammad? Apply free."
      internalLinks={[
        { href: "/how-it-works", label: "How our process works" },
        { href: "/nissan-financing-calgary", label: "Nissan financing through South Trail" },
        { href: "/", label: "Back to homepage" },
        { href: "/privacy", label: "Privacy policy" },
      ]}
    >
      <h2>The Calgary story</h2>
      <p>
        I&apos;ve sold cars in Calgary long enough to see two oil downturns, two newcomer
        booms, and every credit situation a Canadian can have. Forest Lawn welders rebuilding
        after a layoff. SAIT graduates buying their first vehicle. Filipino caregivers on PGWP
        who saved every dollar for a year. Each file is different. Each deserves a real human
        on the other end.
      </p>
      <p>
        AutoNova&apos;s playbook is to push every file through the same generic lender list. I
        watched that approach burn applicants for years — they&apos;d submit to five places at
        once, wreck the bureau with hard pulls, and end up with a worse rate than they should
        have gotten. I built NewWheels to do the opposite: one application, one matched
        lender, one phone call from a real Calgary specialist.
      </p>

      <h2>Why I work at South Trail Nissan too</h2>
      <p>
        Because being on the dealer floor gives me access to manufacturer programs that
        independent brokers never see. The Nissan Rogue at $99/week, the Kicks at 0%
        financing, the Sentra newcomer program — those come from inside the dealer network. I
        bring them to NewWheels customers first.
      </p>
      <p>
        It also keeps me sharp. The AMVIC licence isn&apos;t a piece of paper — it&apos;s a
        commitment to a standard of conduct that gets audited regularly. Every Calgary buyer
        deserves a sales professional who&apos;s actually licensed and accountable.
      </p>

      <h2>The 6 months covered story</h2>
      <p>
        Nobody else in Calgary does it on new vehicles. I built the offer because the first 6
        months after a new car purchase are the hardest — registration, insurance setup, new
        tires before winter, unexpected expenses. If I can lift the loan payment for those 6
        months I dramatically reduce the failure rate. That&apos;s the whole point of
        responsible subprime lending: structure the deal so the buyer actually succeeds.
      </p>

      <h2>What this site is</h2>
      <p>
        Plain English. Calgary specifics. No buzzwords. If something on this site is wrong,
        outdated, or unclear, email me directly at{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a>. We
        update the pages whenever lender programs or AMVIC rules change.
      </p>
    </PageShell>
  );
}
