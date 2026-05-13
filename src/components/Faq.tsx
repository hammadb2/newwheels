import type { FaqItem } from "@/lib/schema";

export default function Faq({
  items,
  heading = "Frequently asked questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  return (
    <section
      aria-labelledby="faq-heading"
      className="section-cream-soft"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 md:py-28">
        <span className="chip">FAQ</span>
        <h2
          id="faq-heading"
          className="display-headline mt-4 text-section font-extrabold text-brand-ink"
        >
          {heading}
        </h2>
        <div className="mt-8 space-y-3">
          {items.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-3xl border border-brand-line bg-white p-5 transition open:shadow-card [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-brand-ink md:text-lg">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-brand-cream text-brand-ink transition group-open:rotate-45 group-open:bg-brand-accent"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted md:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
