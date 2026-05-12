import type { FaqItem } from "@/lib/schema";

export default function Faq({ items, heading = "Frequently asked questions" }: { items: FaqItem[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-20 md:py-[120px]">
      <h2 id="faq-heading" className="text-2xl font-bold md:text-3xl">
        {heading}
      </h2>
      <div className="mt-8 space-y-4">
        {items.map((item, idx) => (
          <details key={idx} className="group rounded-xl border border-brand-line bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-[#111111]">
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-[#6B7280] transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
