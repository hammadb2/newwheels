import Image from "next/image";

type Props = {
  className?: string;
  /** When true, renders the wordmark inverted to white for use on dark backgrounds. */
  dark?: boolean;
  /** Use the compact (single-line, no tagline) wordmark variant. */
  compact?: boolean;
};

export default function Logo({ className, dark = false, compact = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={740}
        height={405}
        className="h-full w-auto"
        priority
      />
      <Image
        src={compact ? "/logo-wordmark-compact.png" : "/logo-wordmark.png"}
        alt="NewWheels"
        width={1362}
        height={compact ? 186 : 303}
        className={`h-[70%] w-auto${dark ? " brightness-0 invert" : ""}`}
        priority
      />
    </span>
  );
}
