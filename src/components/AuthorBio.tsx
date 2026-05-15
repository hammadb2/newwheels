import { BUSINESS, SITE_NAME } from "@/lib/site";

type Props = {
  compact?: boolean;
  dark?: boolean;
};

export default function AuthorBio({ compact = false, dark = false }: Props) {
  const headingColor = dark ? "text-white" : "text-brand-ink";
  const bodyColor = dark ? "text-white/75" : "text-brand-muted";
  const mutedColor = dark ? "text-white/55" : "text-brand-muted/70";
  const linkColor = dark
    ? "text-brand-accent underline-offset-4 hover:underline"
    : "underline underline-offset-4 hover:text-brand-ink";

  return (
    <div className={`flex ${compact ? "items-start" : "items-center"} gap-5`}>
      <div className="text-sm">
        <p className={`font-bold ${headingColor}`}>
          {SITE_NAME} · Calgary Vehicle Financing
        </p>
        <p className={`mt-1 leading-relaxed ${bodyColor}`}>
          {SITE_NAME} is Calgary&apos;s specialist vehicle financing platform. Bad credit,
          newcomers, work permits, and self-employed buyers approved in 24 hours. Our
          AMVIC-licensed specialist has helped hundreds of Calgary families get into a vehicle
          regardless of credit situation.
        </p>
        <p className={`mt-1 text-xs ${mutedColor}`}>
          AMVIC licence:{" "}
          <a
            href={BUSINESS.amvicRegistryUrl}
            className={linkColor}
            target="_blank"
            rel="noopener noreferrer"
          >
            {BUSINESS.amvic}
          </a>
        </p>
      </div>
    </div>
  );
}
