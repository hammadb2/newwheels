import Image from "next/image";

/**
 * Hero visual for the homepage. A photo of a Calgary customer with car keys
 * sits as the backdrop, with the NewWheels "APPROVAL" card mockup and a
 * floating key icon overlaid on top — echoing the card-on-photo hero used by
 * modern fintechs like Koho.
 */
export default function HeroIllustration() {
  return (
    <div className="relative aspect-[5/6] w-full overflow-hidden rounded-5xl shadow-card ring-1 ring-white/10">
      {/* Customer photo */}
      <Image
        src="/photos/hero-keys-handover.jpg"
        alt="Smiling Calgary customer holding car keys beside her newly financed SUV"
        fill
        priority
        sizes="(min-width: 1024px) 520px, (min-width: 640px) 60vw, 100vw"
        className="object-cover"
        style={{ objectPosition: "50% 25%" }}
      />

      {/* Dark wash to anchor the card and tie back to the deep-green hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,40,24,0.05) 0%, rgba(10,40,24,0.15) 45%, rgba(10,40,24,0.75) 100%)",
        }}
      />

      {/* Floating key badge, top-right */}
      <svg
        viewBox="0 0 96 60"
        aria-hidden="true"
        className="absolute right-5 top-5 h-12 w-auto drop-shadow-lg md:right-7 md:top-7 md:h-14"
      >
        <g transform="translate(24 30) rotate(15)">
          <circle cx="0" cy="0" r="22" fill="#0E3D24" stroke="#D9FF4E" strokeWidth="3" />
          <rect x="18" y="-6" width="46" height="12" rx="3" fill="#D9FF4E" />
          <rect x="48" y="6" width="10" height="8" rx="1.5" fill="#D9FF4E" />
          <rect x="60" y="6" width="6" height="8" rx="1.5" fill="#D9FF4E" />
        </g>
      </svg>

      {/* Approval card mockup, anchored to the bottom of the frame */}
      <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-forest to-[#155235] p-5 shadow-2xl ring-2 ring-brand-accent/90 md:p-6">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent">
              APPROVAL
            </span>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
            </div>
          </div>

          <p className="mt-3 font-display text-3xl font-extrabold leading-none text-white md:text-4xl">
            $24,500
          </p>
          <p className="mt-1.5 text-[11px] font-semibold tracking-[0.18em] text-brand-accent">
            PRE-APPROVED FINANCING
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-white">
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-white/60">
                APPLICANT
              </p>
              <p className="mt-0.5 text-sm font-semibold">Calgary Resident</p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-white/60">
                SPECIALIST
              </p>
              <p className="mt-0.5 text-sm font-semibold">Hammad B.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
