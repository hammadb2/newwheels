import Link from "next/link";

type Props = {
  heading?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export default function CtaBlock({
  heading = "Ready to get approved in Calgary?",
  body = "Apply free in under 2 minutes. Hammad calls you back within 1 hour during business hours.",
  primaryHref = "/#apply",
  primaryLabel = "Apply free",
}: Props) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-2xl bg-brand-primary p-8 text-white shadow-card md:p-10">
        <h2 className="text-2xl font-bold md:text-3xl">{heading}</h2>
        <p className="mt-2 max-w-2xl text-white/90">{body}</p>
        <div className="mt-5 flex flex-col gap-3 md:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 font-semibold text-brand-primary transition hover:bg-brand-muted"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Run the calculator
          </Link>
        </div>
      </div>
    </section>
  );
}
