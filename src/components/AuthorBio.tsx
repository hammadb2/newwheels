import { SITE_NAME } from "@/lib/site";

type Props = {
  compact?: boolean;
  dark?: boolean;
};

export default function AuthorBio({ compact = false, dark = false }: Props) {
  const headingColor = dark ? "text-white" : "text-brand-ink";
  const bodyColor = dark ? "text-white/75" : "text-brand-muted";
  const mutedColor = dark ? "text-white/55" : "text-brand-muted/70";

  return (
    <div className={`flex ${compact ? "items-start" : "items-center"} gap-5`}>
      <div className="text-sm">
        <p className={`font-bold ${headingColor}`}>
          {SITE_NAME} · Calgary Vehicle Financing
        </p>
        <p className={`mt-1 leading-relaxed ${bodyColor}`}>
          {SITE_NAME} is Calgary&apos;s specialist vehicle financing lead generation platform.
          Bad credit, newcomers, work permits, and self-employed buyers approved in 24 hours
          through our dealer partner network.
        </p>
        <p className={`mt-1 text-xs ${mutedColor}`}>
          {SITE_NAME} works exclusively with AMVIC-licensed dealer partners across Calgary
          and Alberta.
        </p>
      </div>
    </div>
  );
}
