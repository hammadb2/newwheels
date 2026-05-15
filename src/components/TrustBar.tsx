const ITEMS = [
  { label: "100% free", sub: "No obligation" },
  { label: "No hard credit check", sub: "Doesn't ding your score" },
  { label: "24-hour approval", sub: "A specialist calls in 1 hour" },
  { label: "Up to 6 months covered", sub: "On qualified deals" },
  { label: "AMVIC licensed", sub: "Real Calgary specialist" },
];

export default function TrustBar() {
  return (
    <div className="border-b border-brand-line bg-brand-cream">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-sm md:grid-cols-5">
        {ITEMS.map(item => (
          <li
            key={item.label}
            className="flex flex-col rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-brand-line"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-brand-forest">
              {item.label}
            </span>
            <span className="mt-0.5 text-xs text-brand-muted">{item.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
