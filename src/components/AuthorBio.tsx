import { BUSINESS, SITE_NAME } from "@/lib/site";

type Props = { compact?: boolean };

export default function AuthorBio({ compact = false }: Props) {
  const name = `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`;
  return (
    <div className={`flex ${compact ? "items-start" : "items-center"} gap-4`}>
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white"
        aria-hidden="true"
      >
        H
      </div>
      <div className="text-sm">
        <p className="font-semibold text-brand-ink">{name} · Automotive Finance Specialist</p>
        <p className="mt-1 text-neutral-700">
          AMVIC-licensed automotive sales professional in Calgary, Alberta. Specializes in
          financing solutions for newcomers, buyers rebuilding credit, and self-employed
          Calgarians. Personally helped hundreds of Calgary families get into a vehicle
          regardless of credit situation. Author of every page on {SITE_NAME}.
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          AMVIC licence:{" "}
          <a href={BUSINESS.amvicRegistryUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {BUSINESS.amvic}
          </a>
        </p>
      </div>
    </div>
  );
}
