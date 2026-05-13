/**
 * Illustrations used across the marketing site. The three "situation" art
 * pieces (bad credit / newcomer / family) are painterly JPGs delivered via
 * next/image; the supporting illustrations are still inline SVGs themed with
 * the NewWheels evergreen + lime palette.
 *
 * Each illustration is a self-contained square (1:1) component so it can be
 * dropped into any feature card or page section.
 */
import Image from "next/image";
import type { SVGProps } from "react";

type Common = SVGProps<SVGSVGElement>;

function Frame({ children, ...rest }: { children: React.ReactNode } & Common) {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

type PainterlyProps = { className?: string; priority?: boolean };

function PainterlyTile({
  src,
  alt,
  className,
  priority,
}: { src: string; alt: string } & PainterlyProps) {
  // Source art is 1:1; reserve square space so layouts that only set width
  // (e.g. PageShell hero) still render at the right height.
  return (
    <div className={`relative aspect-square overflow-hidden ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/** Painterly winding mountain road with a small green car — bad credit / first-time buyer. */
export function CalgaryDriveIllustration({ className, priority }: PainterlyProps) {
  return (
    <PainterlyTile
      src="/illustrations/painterly-bad-credit.jpg"
      alt="Painterly illustration of a small green car driving a sunlit mountain road"
      className={className}
      priority={priority}
    />
  );
}

/** Painterly family loading an SUV with the Calgary skyline in the background. */
export function FamilyRoadTripIllustration({ className, priority }: PainterlyProps) {
  return (
    <PainterlyTile
      src="/illustrations/painterly-family.jpg"
      alt="Painterly illustration of a Calgary family packing an SUV with the city skyline behind"
      className={className}
      priority={priority}
    />
  );
}

/** Painterly newcomer driving past a "Welcome to Canada" sign toward a mountain skyline. */
export function NewcomerIllustration({ className, priority }: PainterlyProps) {
  return (
    <PainterlyTile
      src="/illustrations/painterly-newcomer.jpg"
      alt="Painterly illustration of an SUV passing a Welcome to Canada sign with mountains and a city skyline"
      className={className}
      priority={priority}
    />
  );
}

/** "Credit rebuild" — line graph going up. */
export function CreditRebuildIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#F5F1E8" />
      <rect x="40" y="40" width="320" height="280" rx="24" fill="#FAF7F0" stroke="#E7E2D6" strokeWidth="2" />
      {/* Bars going up */}
      <g>
        <rect x="70" y="240" width="36" height="50" rx="6" fill="#0E3D24" opacity="0.4" />
        <rect x="120" y="200" width="36" height="90" rx="6" fill="#0E3D24" opacity="0.55" />
        <rect x="170" y="160" width="36" height="130" rx="6" fill="#0E3D24" opacity="0.7" />
        <rect x="220" y="120" width="36" height="170" rx="6" fill="#0E3D24" opacity="0.85" />
        <rect x="270" y="80" width="36" height="210" rx="6" fill="#D9FF4E" stroke="#0E3D24" strokeWidth="3" />
      </g>
      {/* Score chip */}
      <g transform="translate(70 70)">
        <rect width="120" height="40" rx="20" fill="#0E3D24" />
        <text x="60" y="26" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="14" fontWeight="700" fill="#D9FF4E" letterSpacing="0.05em">
          SCORE 740
        </text>
      </g>
      <text x="200" y="370" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="18" fontWeight="700" fill="#0E3D24">
        Build credit, drive sooner
      </text>
    </Frame>
  );
}

/** "Work permit" — passport with maple leaf. */
export function WorkPermitIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#0E3D24" />
      <g transform="translate(110 60)">
        <rect width="180" height="240" rx="16" fill="#D9FF4E" />
        <rect x="20" y="20" width="140" height="80" rx="6" fill="#0E3D24" />
        <text x="90" y="56" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="14" fontWeight="700" fill="#D9FF4E" letterSpacing="0.1em">
          CANADA
        </text>
        <text x="90" y="76" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="10" fontWeight="500" fill="#D9FF4E" letterSpacing="0.15em" opacity="0.8">
          WORK PERMIT
        </text>
        <circle cx="90" cy="160" r="40" fill="#0E3D24" />
        <path d="M90 130 L95 145 L110 142 L101 154 L114 159 L102 162 L106 174 L96 169 L90 184 L84 169 L74 174 L78 162 L66 159 L79 154 L70 142 L85 145 Z" fill="#D9FF4E" />
        <rect x="40" y="210" width="100" height="6" rx="3" fill="#0E3D24" opacity="0.7" />
        <rect x="55" y="222" width="70" height="6" rx="3" fill="#0E3D24" opacity="0.5" />
      </g>
      <text x="200" y="350" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="20" fontWeight="700" fill="#FAF7F0">
        Work permits welcome
      </text>
    </Frame>
  );
}

/** "Self-employed" — clipboard + dollar bill. */
export function SelfEmployedIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#155235" />
      <circle cx="320" cy="80" r="50" fill="#D9FF4E" opacity="0.9" />
      <g transform="translate(70 70)">
        {/* Briefcase */}
        <rect x="0" y="40" width="220" height="160" rx="14" fill="#FAF7F0" />
        <rect x="60" y="15" width="100" height="36" rx="8" fill="#FAF7F0" />
        <rect x="70" y="22" width="80" height="22" rx="4" fill="#0E3D24" />
        <rect x="0" y="100" width="220" height="6" fill="#0E3D24" opacity="0.15" />
        {/* Dollar sign */}
        <circle cx="110" cy="140" r="36" fill="#D9FF4E" />
        <text x="110" y="155" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="40" fontWeight="800" fill="#0E3D24">
          $
        </text>
      </g>
      <text x="200" y="350" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="20" fontWeight="700" fill="#FAF7F0">
        Self-employed approvals
      </text>
    </Frame>
  );
}

/** Generic "approval card" — used for situation pages. */
export function ApprovalCardIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#0A2818" />
      <g transform="translate(40 70)">
        <rect width="320" height="200" rx="22" fill="#0E3D24" stroke="#D9FF4E" strokeWidth="2" />
        <text x="24" y="40" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="13" fontWeight="600" fill="#D9FF4E" letterSpacing="2">
          NEWWHEELS
        </text>
        <text x="24" y="100" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="42" fontWeight="800" fill="#FAF7F0" letterSpacing="-0.02em">
          APPROVED
        </text>
        <text x="24" y="130" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="12" fontWeight="500" fill="#D9FF4E" letterSpacing="1.5">
          IN 24 HOURS
        </text>
        <rect x="24" y="160" width="180" height="6" rx="3" fill="#FAF7F0" opacity="0.4" />
        <rect x="24" y="174" width="120" height="6" rx="3" fill="#FAF7F0" opacity="0.25" />
        <circle cx="280" cy="170" r="14" fill="#D9FF4E" />
      </g>
      <g transform="translate(40 290)">
        <rect width="100" height="70" rx="14" fill="#D9FF4E" />
        <text x="50" y="32" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="11" fontWeight="700" fill="#0E3D24" letterSpacing="1">
          UP TO
        </text>
        <text x="50" y="56" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="24" fontWeight="800" fill="#0E3D24">
          6 MO
        </text>
      </g>
      <g transform="translate(160 290)">
        <rect width="100" height="70" rx="14" fill="#FAF7F0" />
        <text x="50" y="32" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="11" fontWeight="700" fill="#0E3D24" letterSpacing="1">
          NO HARD
        </text>
        <text x="50" y="56" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="14" fontWeight="800" fill="#0E3D24">
          CREDIT PULL
        </text>
      </g>
      <g transform="translate(280 290)">
        <rect width="80" height="70" rx="14" fill="#155235" stroke="#D9FF4E" strokeWidth="2" />
        <text x="40" y="32" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="11" fontWeight="700" fill="#D9FF4E" letterSpacing="1">
          FREE
        </text>
        <text x="40" y="56" textAnchor="middle" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="13" fontWeight="800" fill="#FAF7F0">
          APPLY
        </text>
      </g>
    </Frame>
  );
}

/** Selector that returns the right illustration for a given situation slug. */
export function SituationIllustration({
  slug,
  className,
  ...rest
}: { slug: string; className?: string } & Common) {
  switch (slug) {
    case "/bad-credit-car-loans-calgary":
      return <CalgaryDriveIllustration className={className} />;
    case "/newcomer-car-loans-calgary":
      return <NewcomerIllustration className={className} />;
    case "/car-loan-work-permit-calgary":
      return <WorkPermitIllustration className={className} {...rest} />;
    case "/car-loan-after-bankruptcy-calgary":
      return <CreditRebuildIllustration className={className} {...rest} />;
    case "/self-employed-car-loan-calgary":
      return <SelfEmployedIllustration className={className} {...rest} />;
    case "/first-time-car-buyer-calgary":
      return <CalgaryDriveIllustration className={className} />;
    case "/consumer-proposal-car-loan-calgary":
      return <CreditRebuildIllustration className={className} {...rest} />;
    case "/nissan-financing-calgary":
      return <CalgaryDriveIllustration className={className} />;
    case "/how-it-works":
      return <FamilyRoadTripIllustration className={className} />;
    case "/about":
      return <ApprovalCardIllustration className={className} {...rest} />;
    case "/calculator":
      return <ApprovalCardIllustration className={className} {...rest} />;
    default:
      return <ApprovalCardIllustration className={className} {...rest} />;
  }
}
