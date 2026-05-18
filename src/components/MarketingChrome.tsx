"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const APP_PREFIXES = ["/crm", "/portal", "/apply"];

export default function MarketingChrome({ children, hidden = false }: { children: ReactNode; hidden?: boolean }) {
  const pathname = usePathname();
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isApp || hidden) return null;
  return <>{children}</>;
}
