import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={740}
        height={405}
        className="h-full w-auto"
        priority
      />
      <Image
        src="/logo-wordmark.png"
        alt="NewWheels"
        width={1362}
        height={303}
        className="h-[60%] w-auto"
        priority
      />
    </span>
  );
}
