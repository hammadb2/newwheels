import Image from "next/image";
import { BUSINESS, SITE_NAME } from "@/lib/site";

type Props = { compact?: boolean };

export default function AuthorBio({ compact = false }: Props) {
  const name = `Hammad${BUSINESS.hammadLastName ? " " + BUSINESS.hammadLastName : ""}`;
  return (
    <div className={`flex ${compact ? "items-start" : "items-center"} gap-4`}>
      <Image
        src="/hammad.jpg"
        alt={name}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div className="text-sm">
        <p className="font-semibold text-[#111111]">{name} · Automotive Finance Specialist</p>
        <p className="mt-1 text-[#6B7280]">
          AMVIC-licensed automotive sales professional in Calgary, Alberta. Specializes in
          financing solutions for newcomers, buyers rebuilding credit, and self-employed
          Calgarians. Personally helped hundreds of Calgary families get into a vehicle
          regardless of credit situation. Author of every page on {SITE_NAME}.
        </p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          AMVIC licence:{" "}
          <a href={BUSINESS.amvicRegistryUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {BUSINESS.amvic}
          </a>
        </p>
      </div>
    </div>
  );
}
