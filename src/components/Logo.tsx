import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-horizontal.png"
      alt="NewWheels"
      width={160}
      height={69}
      className={className}
      priority
    />
  );
}
