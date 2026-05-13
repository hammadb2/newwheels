import Link from "next/link";
import ApplyFreeButton from "./ApplyFreeButton";

type Props = {
  heading?: string;
  body?: string;
  primaryLabel?: string;
};

export default function CtaBlock({
  heading = "Ready to get approved in Calgary?",
  body = "Apply free in under 2 minutes. Hammad calls you back within 1 hour during business hours.",
  primaryLabel = "Apply free",
}: Props) {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-5xl bg-brand-accent p-10 md:p-16">
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-primary opacity-10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-brand-primary opacity-10"
          />

          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="chip border-brand-ink/15 bg-brand-cream">
                Calgary specialist
              </span>
              <h2 className="display-headline mt-4 text-section font-extrabold uppercase text-brand-ink md:text-[clamp(2.5rem,5vw,4rem)]">
                {heading}
              </h2>
              <p className="mt-4 max-w-xl text-base text-brand-ink/80 md:text-lg">
                {body}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <ApplyFreeButton
                className="inline-flex w-full items-center justify-center rounded-pill bg-brand-ink px-8 py-4 text-base font-bold text-brand-accent transition hover:bg-brand-forest md:w-auto"
                label={primaryLabel}
              />
              <Link
                href="/calculator"
                className="inline-flex w-full items-center justify-center rounded-pill border-2 border-brand-ink px-8 py-3.5 text-base font-bold text-brand-ink transition hover:bg-brand-ink hover:text-brand-accent md:w-auto"
              >
                Run the calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
