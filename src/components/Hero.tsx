import Link from "next/link";
import { BUSINESS } from "@/lib/site";
import LeadForm from "./LeadForm";

export default function Hero() {
  return (
    <section className="relative flex min-h-[100vh] items-center">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h1 className="text-[2.5rem] font-bold leading-[1.1] text-[#111111] md:text-[3.5rem] lg:text-[4.25rem]">
            Car loans in Calgary, approved in 24 hours, even with no Canadian credit.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#6B7280]">
            Bad credit, newcomers, and work-permit holders welcome. Up to 6 months of payments
            covered on qualified deals. Nothing in Calgary matches this offer.
          </p>
          <p className="mt-3 text-base italic text-[#6B7280]" lang="tl">
            Filipino newcomer? Bagong dating sa Canada, kaya namin tulungan ka.
          </p>

          <p className="mt-6 text-sm text-[#6B7280]">
            24-hour approval &nbsp;·&nbsp; No hard credit check &nbsp;·&nbsp; Up to 6 months covered
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#apply" className="btn-primary text-base">Apply free, 2 minutes</Link>
            <Link href="/calculator" className="btn-secondary text-sm">Run the calculator</Link>
            <a
              href={`tel:${BUSINESS.phoneHref}`}
              className="text-sm font-semibold text-[#6B7280]"
              data-analytics="call_click"
            >
              Or call {BUSINESS.phone}
            </a>
          </div>
        </div>

        <div>
          <LeadForm
            variant="hero"
            sourcePage="/"
            heading="Get pre-approved for free"
            subheading="No hard credit check. Hammad personally calls every applicant within 1 hour during business hours."
          />
        </div>
      </div>
    </section>
  );
}
