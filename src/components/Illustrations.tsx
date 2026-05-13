/**
 * Inline SVG illustrations used across the marketing site. Themed with the
 * NewWheels evergreen + lime palette and Bricolage Grotesque-friendly shapes.
 *
 * Each illustration is a self-contained square (1:1) component so it can be
 * dropped into any feature card or page section.
 */
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

/** Calgary skyline behind a stylised sedan — used for "drive to work" / general car loan cards. */
export function CalgaryDriveIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#F5F1E8" />
      <circle cx="305" cy="110" r="48" fill="#D9FF4E" />
      <path d="M0 270 L70 200 L130 250 L200 180 L260 240 L330 200 L400 270 L400 320 L0 320 Z" fill="#155235" />
      <path d="M0 295 L80 250 L160 290 L240 240 L320 295 L400 260 L400 320 L0 320 Z" fill="#0E3D24" />
      {/* Road */}
      <rect x="0" y="320" width="400" height="80" fill="#0A2818" />
      <rect x="40" y="358" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="120" y="358" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="200" y="358" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="280" y="358" width="40" height="4" rx="2" fill="#D9FF4E" />
      {/* Car */}
      <g transform="translate(120 280)">
        <path d="M0 30 L20 0 L130 0 L150 30 L160 30 L160 60 L0 60 Z" fill="#D9FF4E" />
        <path d="M28 5 L60 5 L65 27 L25 27 Z" fill="#FAF7F0" opacity="0.8" />
        <path d="M75 5 L120 5 L130 27 L80 27 Z" fill="#FAF7F0" opacity="0.8" />
        <circle cx="30" cy="60" r="14" fill="#0A2818" />
        <circle cx="30" cy="60" r="6" fill="#D9FF4E" />
        <circle cx="130" cy="60" r="14" fill="#0A2818" />
        <circle cx="130" cy="60" r="6" fill="#D9FF4E" />
      </g>
    </Frame>
  );
}

/** "Family road trip" — minivan + suitcases. */
export function FamilyRoadTripIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#155235" />
      {/* Sun */}
      <circle cx="80" cy="100" r="40" fill="#D9FF4E" />
      {/* Mountain */}
      <path d="M150 250 L220 130 L290 250 Z" fill="#0E3D24" />
      <path d="M230 145 L240 130 L252 148 L246 153 L238 147 Z" fill="#FAF7F0" />
      {/* Road */}
      <rect x="0" y="300" width="400" height="100" fill="#0A2818" />
      <rect x="60" y="350" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="140" y="350" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="220" y="350" width="40" height="4" rx="2" fill="#D9FF4E" />
      <rect x="300" y="350" width="40" height="4" rx="2" fill="#D9FF4E" />
      {/* Van */}
      <g transform="translate(100 240)">
        <rect x="0" y="20" width="180" height="50" rx="8" fill="#FAF7F0" />
        <rect x="20" y="0" width="100" height="30" fill="#FAF7F0" />
        <rect x="28" y="6" width="35" height="20" fill="#0A2818" opacity="0.8" />
        <rect x="70" y="6" width="46" height="20" fill="#0A2818" opacity="0.8" />
        <circle cx="40" cy="72" r="14" fill="#0A2818" />
        <circle cx="40" cy="72" r="6" fill="#D9FF4E" />
        <circle cx="150" cy="72" r="14" fill="#0A2818" />
        <circle cx="150" cy="72" r="6" fill="#D9FF4E" />
        {/* Roof rack with bag */}
        <rect x="35" y="-12" width="120" height="6" rx="2" fill="#0A2818" />
        <rect x="55" y="-30" width="90" height="20" rx="4" fill="#D9FF4E" />
      </g>
    </Frame>
  );
}

/** "First Canadian car" — newcomer + maple leaf accent. */
export function NewcomerIllustration(props: Common) {
  return (
    <Frame {...props}>
      <rect width="400" height="400" rx="32" fill="#D9FF4E" />
      {/* Maple leaf */}
      <g transform="translate(60 60)" fill="#0E3D24">
        <path d="M40 0 L48 18 L70 14 L58 30 L80 38 L60 44 L66 62 L48 56 L40 80 L32 56 L14 62 L20 44 L0 38 L22 30 L10 14 L32 18 Z" />
      </g>
      {/* Big number */}
      <text
        x="200"
        y="190"
        textAnchor="middle"
        fontFamily="Bricolage Grotesque, Inter, sans-serif"
        fontSize="120"
        fontWeight="800"
        fill="#0E3D24"
        letterSpacing="-0.05em"
      >
        1ST
      </text>
      <text
        x="200"
        y="220"
        textAnchor="middle"
        fontFamily="Bricolage Grotesque, Inter, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#0E3D24"
        letterSpacing="0.05em"
      >
        CANADIAN CAR
      </text>
      {/* Mini car */}
      <g transform="translate(120 270)">
        <rect x="0" y="20" width="160" height="40" rx="6" fill="#0E3D24" />
        <rect x="20" y="0" width="120" height="25" rx="4" fill="#0E3D24" />
        <rect x="30" y="6" width="40" height="15" fill="#FAF7F0" opacity="0.7" />
        <rect x="80" y="6" width="50" height="15" fill="#FAF7F0" opacity="0.7" />
        <circle cx="40" cy="60" r="12" fill="#0A2818" />
        <circle cx="40" cy="60" r="5" fill="#D9FF4E" />
        <circle cx="130" cy="60" r="12" fill="#0A2818" />
        <circle cx="130" cy="60" r="5" fill="#D9FF4E" />
      </g>
    </Frame>
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
  ...rest
}: { slug: string } & Common) {
  switch (slug) {
    case "/bad-credit-car-loans-calgary":
      return <CreditRebuildIllustration {...rest} />;
    case "/newcomer-car-loans-calgary":
      return <NewcomerIllustration {...rest} />;
    case "/car-loan-work-permit-calgary":
      return <WorkPermitIllustration {...rest} />;
    case "/car-loan-after-bankruptcy-calgary":
      return <CreditRebuildIllustration {...rest} />;
    case "/self-employed-car-loan-calgary":
      return <SelfEmployedIllustration {...rest} />;
    case "/first-time-car-buyer-calgary":
      return <CalgaryDriveIllustration {...rest} />;
    case "/consumer-proposal-car-loan-calgary":
      return <CreditRebuildIllustration {...rest} />;
    case "/nissan-financing-calgary":
      return <CalgaryDriveIllustration {...rest} />;
    case "/how-it-works":
      return <FamilyRoadTripIllustration {...rest} />;
    case "/about":
      return <ApprovalCardIllustration {...rest} />;
    case "/calculator":
      return <ApprovalCardIllustration {...rest} />;
    default:
      return <ApprovalCardIllustration {...rest} />;
  }
}
