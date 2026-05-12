import Image from "next/image";

export default function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
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
        width={compact ? 1362 : 1362}
        height={compact ? 186 : 303}
        className="h-[70%] w-auto"
        priority
      />
    </span>
  );
}
