import Link from "next/link";
import { BUSINESS } from "@/lib/site";
import LeadForm from "./LeadForm";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 80% -100px, rgba(34,197,94,0.18), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F4F7F5 100%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white px-3 py-1 text-xs font-semibold text-brand-primary">
            <span className="h-2 w-2 rounded-full bg-brand-accent" aria-hidden="true" /> Up to 6 months of payments covered
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-ink md:text-5xl lg:text-6xl">
            Car loans in Calgary,{" "}
            <span className="text-brand-primary">approved in 24 hours</span>, even with no
            Canadian credit.
          </h1>
          <p className="mt-4 max-w-prose text-lg text-neutral-800">
            Bad credit, newcomers, work-permit holders, and self-employed Calgarians welcome. We
            cover up to 6 months of your payments on qualified deals. Nothing else in Calgary
            matches this offer. Apply free in under 2 minutes.
          </p>
          <p className="mt-3 text-base font-medium text-brand-primary" lang="tl">
            Filipino newcomer? <span className="font-semibold">Bagong dating sa Canada, kaya namin tulungan ka.</span>
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-neutral-800 sm:grid-cols-2">
            <li className="flex items-start gap-2"><span className="text-brand-primary">✓</span> 24-hour approval, specialist calls in 1 hour</li>
            <li className="flex items-start gap-2"><span className="text-brand-primary">✓</span> Bad credit, bankruptcy, R7 OK</li>
            <li className="flex items-start gap-2"><span className="text-brand-primary">✓</span> Work permits, study permits, PR</li>
            <li className="flex items-start gap-2"><span className="text-brand-primary">✓</span> No hard credit check to apply</li>
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#apply" className="btn-primary text-base">Apply free, 2 minutes</Link>
            <Link href="/calculator" className="btn-secondary text-base">Run the calculator</Link>
            <a
              href={`tel:${BUSINESS.phoneHref}`}
              className="text-sm font-semibold text-brand-primary underline"
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
