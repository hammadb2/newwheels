"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Pages that do NOT have an `id="apply"` anchor.
 * On these pages, the Apply free button needs to send the user to the
 * homepage form. Every other route renders the lead form locally
 * (via PageShell, the homepage section, /calculator, or /blog/[slug])
 * so the button stays on the current page.
 */
const PAGES_WITHOUT_FORM = new Set<string>(["/blog"]);

type Props = {
  className?: string;
  label?: string;
};

export default function ApplyFreeButton({
  className = "btn-primary px-5 py-2.5 text-sm",
  label = "Apply free",
}: Props) {
  const pathname = usePathname() || "/";
  const hasLocalForm = !PAGES_WITHOUT_FORM.has(pathname);
  const href = hasLocalForm ? "#apply" : "/#apply";

  return (
    <Link href={href} className={className} data-analytics="apply_click">
      {label}
    </Link>
  );
}
