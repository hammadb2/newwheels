import type { FaqItem } from "@/lib/schema";

export default function Faq({ items, heading = "Frequently asked questions" }: { items: FaqItem[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-12">
      <h2 id="faq-heading" className="text-2xl font-bold text-brand-ink md:text-3xl">
        {heading}
      </h2>
      <div className="mt-6 divide-y divide-brand-line rounded-xl border border-brand-line bg-white">
        {items.map((item, idx) => (
          <details key={idx} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-brand-ink">
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-brand-primary transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
