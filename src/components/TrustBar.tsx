const ITEMS = [
  { label: "100% free to apply", sub: "No obligation" },
  { label: "No hard credit check", sub: "Doesn't ding your score" },
  { label: "24-hour approval", sub: "Specialist calls in 1 hour" },
  { label: "Up to 6 months covered", sub: "On qualified deals" },
  { label: "AMVIC licensed", sub: "Real Calgary specialist" },
];

export default function TrustBar() {
  return (
    <div className="border-b border-brand-line">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-sm md:grid-cols-5">
        {ITEMS.map(item => (
          <li key={item.label} className="flex flex-col">
            <span className="font-semibold text-[#111111]">{item.label}</span>
            <span className="text-xs text-[#6B7280]">{item.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
