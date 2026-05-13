import Image from "next/image";
import { BUSINESS, SITE_NAME } from "@/lib/site";

type Props = {
  compact?: boolean;
  dark?: boolean;
};

export default function AuthorBio({ compact = false, dark = false }: Props) {
  const name = `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`;
  const headingColor = dark ? "text-white" : "text-brand-ink";
  const bodyColor = dark ? "text-white/75" : "text-brand-muted";
  const mutedColor = dark ? "text-white/55" : "text-brand-muted/70";
  const linkColor = dark
    ? "text-brand-accent underline-offset-4 hover:underline"
    : "underline underline-offset-4 hover:text-brand-ink";

  return (
    <div className={`flex ${compact ? "items-start" : "items-center"} gap-5`}>
      <Image
        src="/hammad.jpg"
        alt={name}
        width={72}
        height={72}
        className="h-16 w-16 shrink-0 rounded-pill object-cover ring-2 ring-brand-accent md:h-[72px] md:w-[72px]"
      />
      <div className="text-sm">
        <p className={`font-bold ${headingColor}`}>
          {name} · Automotive Finance Specialist
        </p>
        <p className={`mt-1 leading-relaxed ${bodyColor}`}>
          AMVIC-licensed automotive sales professional in Calgary, Alberta. Specializes in
          financing solutions for newcomers, buyers rebuilding credit, and self-employed
          Calgarians. Personally helped hundreds of Calgary families get into a vehicle
          regardless of credit situation. Author of every page on {SITE_NAME}.
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
