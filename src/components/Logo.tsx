type Props = {
  className?: string;
  /** When true, renders the wordmark in white/lime for use on dark backgrounds. */
  dark?: boolean;
  /** No-op kept for backwards compat with existing callsites. */
  compact?: boolean;
};

export default function Logo({ className, dark = false }: Props) {
  const wordmarkFirst = dark ? "#FAF7F0" : "#0A2818";
  const wordmarkSecond = dark ? "#D9FF4E" : "#0E3D24";
  const badgeFill = dark ? "#D9FF4E" : "#0E3D24";
  const badgeGlyph = dark ? "#0A2818" : "#D9FF4E";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 56"
      role="img"
      aria-label="NewWheels"
      className={className}
    >
      <rect x="2" y="6" width="44" height="44" rx="14" fill={badgeFill} />
      <path
        d="M12 38 L12 18 L18 18 L24 30 L24 18 L30 18 L30 38 L24 38 L18 26 L18 38 Z"
        fill={badgeGlyph}
      />
      <circle cx="40" cy="44" r="3.5" fill={badgeGlyph} />
      <text
        x="56"
        y="36"
        fontFamily="Bricolage Grotesque, Inter, system-ui, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.02em"
        fill={wordmarkFirst}
      >
        New<tspan fill={wordmarkSecond}>Wheels</tspan>
      </text>
    </svg>
  );
}
