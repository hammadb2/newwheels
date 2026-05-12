export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 48"
      role="img"
      aria-label="NewWheels"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nwBadge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1A7A4A" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="36" height="36" rx="10" fill="url(#nwBadge)" />
      <path
        d="M11 31 L11 17 L17 17 L21 25 L21 17 L26 17 L26 31 L21 31 L17 23 L17 31 Z"
        fill="#fff"
      />
      <text
        x="48"
        y="32"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#111"
      >
        New
        <tspan fill="#1A7A4A">Wheels</tspan>
      </text>
    </svg>
  );
}
