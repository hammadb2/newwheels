import Link from "next/link";
import { BUSINESS } from "@/lib/site";
import HeroIllustration from "./HeroIllustration";

export default function Hero() {
  return (
    <section className="section-deep relative overflow-hidden">
      {/* Decorative dotted backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(217,255,78,0.9) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="text-white">
          <span className="chip-accent">Calgary · Approved in 24 hrs</span>
          <h1 className="mt-5 display-headline text-[clamp(2.5rem,7vw,5.5rem)] uppercase text-white">
            Car loans for
            <span className="block text-brand-accent">every Calgarian.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            Bad credit, newcomers, and work-permit holders welcome. Up to{" "}
            <span className="text-brand-accent">6 months of payments</span> covered on
            qualified deals. Nothing in Calgary matches this offer.
          </p>
          <p className="mt-2 text-base italic text-white/70" lang="tl">
            Filipino newcomer? Bagong dating sa Canada, kaya namin tulungan ka.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#apply" className="btn-primary-dark min-h-[58px] px-8 text-base">
              Apply free, 2 minutes
            </Link>
            <Link href="/calculator" className="btn-ghost-dark text-sm">
              Run the calculator
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
              24-hour approval
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
              No hard credit check
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
              Up to 6 months covered
            </span>
          </div>

          <p className="mt-6 text-sm text-white/60">
            Or call{" "}
            <a
              href={`tel:${BUSINESS.phoneHref}`}
              className="font-semibold text-brand-accent underline-offset-4 hover:underline"
              data-analytics="call_click"
            >
              {BUSINESS.phone}
            </a>{" "}
            — Hammad picks up.
          </p>
        </div>

        <div className="relative">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
