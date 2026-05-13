/**
 * Stylized hero illustration for the homepage hero. Pure inline SVG so it
 * scales, renders crisp at any density, and is fully themable.
 *
 * It pairs a stylised Calgary mountain backdrop with a "NewWheels approval
 * card" mockup in the foreground, echoing the card-on-dark hero used by
 * modern fintechs like Koho.
 */
export default function HeroIllustration() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 520 560"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="NewWheels — Calgary financing approval"
        className="w-full"
      >
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#155235" />
            <stop offset="1" stopColor="#0A2818" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0E3D24" />
            <stop offset="1" stopColor="#155235" />
          </linearGradient>
          <linearGradient id="limeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#D9FF4E" />
            <stop offset="1" stopColor="#E9FF8E" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#155235" />
            <stop offset="1" stopColor="#0A2818" />
          </linearGradient>
        </defs>

        {/* Rounded backdrop */}
        <rect x="0" y="0" width="520" height="560" rx="40" fill="url(#sky)" />

        {/* Sun / accent disc */}
        <circle cx="360" cy="130" r="62" fill="url(#limeGrad)" opacity="0.95" />

        {/* Mountain range */}
        <path
          d="M-10 360 L80 240 L150 320 L220 220 L300 330 L380 250 L470 340 L530 280 L530 420 L-10 420 Z"
          fill="#0E3D24"
        />
        <path
          d="M-10 380 L70 300 L150 360 L240 270 L320 360 L400 300 L530 380 L530 420 L-10 420 Z"
          fill="#0A2818"
          opacity="0.85"
        />
        {/* Snow caps */}
        <path d="M210 230 L220 220 L232 235 L226 240 L218 232 Z" fill="#FAF7F0" opacity="0.9" />
        <path d="M370 258 L380 250 L392 265 L386 270 L378 263 Z" fill="#FAF7F0" opacity="0.85" />

        {/* Road */}
        <path d="M-10 420 L530 420 L530 560 L-10 560 Z" fill="url(#roadGrad)" />
        {/* Lane stripes */}
        <g fill="#D9FF4E" opacity="0.55">
          <rect x="120" y="500" width="40" height="6" rx="3" />
          <rect x="200" y="500" width="40" height="6" rx="3" />
          <rect x="280" y="500" width="40" height="6" rx="3" />
          <rect x="360" y="500" width="40" height="6" rx="3" />
          <rect x="440" y="500" width="40" height="6" rx="3" />
        </g>

        {/* Approval card */}
        <g transform="translate(70 270)">
          <rect width="380" height="220" rx="28" fill="url(#cardGrad)" stroke="#D9FF4E" strokeWidth="2" />
          <rect width="380" height="220" rx="28" fill="#D9FF4E" opacity="0.08" />

          {/* Card top row */}
          <text x="28" y="46" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="14" fontWeight="600" fill="#D9FF4E" letterSpacing="2">
            APPROVAL
          </text>
          <circle cx="346" cy="42" r="10" fill="#D9FF4E" opacity="0.95" />
          <circle cx="328" cy="42" r="10" fill="#FAF7F0" opacity="0.85" />

          {/* Big number */}
          <text
            x="28"
            y="116"
            fontFamily="Bricolage Grotesque, Inter, sans-serif"
            fontSize="46"
            fontWeight="800"
            fill="#FAF7F0"
            letterSpacing="-0.02em"
          >
            $24,500
          </text>
          <text x="28" y="142" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="13" fill="#D9FF4E" letterSpacing="1.5">
            PRE-APPROVED FINANCING
          </text>

          {/* Bottom info row */}
          <g transform="translate(28 168)">
            <text fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="11" fill="#FAF7F0" opacity="0.6" letterSpacing="1">
              APPLICANT
            </text>
            <text y="20" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="15" fontWeight="600" fill="#FAF7F0">
              Calgary Resident
            </text>
          </g>
          <g transform="translate(220 168)">
            <text fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="11" fill="#FAF7F0" opacity="0.6" letterSpacing="1">
              SPECIALIST
            </text>
            <text y="20" fontFamily="Bricolage Grotesque, Inter, sans-serif" fontSize="15" fontWeight="600" fill="#FAF7F0">
              Hammad B.
            </text>
          </g>
        </g>

        {/* "key" floating element */}
        <g transform="translate(380 60) rotate(15)">
          <circle cx="0" cy="0" r="22" fill="#0E3D24" stroke="#D9FF4E" strokeWidth="3" />
          <rect x="18" y="-6" width="46" height="12" rx="3" fill="#D9FF4E" />
          <rect x="48" y="6" width="10" height="8" rx="1.5" fill="#D9FF4E" />
          <rect x="60" y="6" width="6" height="8" rx="1.5" fill="#D9FF4E" />
        </g>
      </svg>
    </div>
  );
}
