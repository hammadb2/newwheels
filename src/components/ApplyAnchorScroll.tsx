"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global handler that intercepts clicks on any in-page link that targets
 * `#apply` and vertically centers the `id="apply"` form section in the
 * viewport (instead of the default browser behaviour of pinning it to the
 * top). Works for the header Apply free button, hero/page CTAs, calculator,
 * blog, etc. Also re-centers when arriving on a page with `#apply` already
 * in the URL.
 */
export default function ApplyAnchorScroll() {
  const pathname = usePathname();

  useEffect(() => {
    function centerApply() {
      const target = document.getElementById("apply");
      if (!target) return false;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.(
        'a[href$="#apply"]'
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      const path = hashIndex === -1 ? href : href.slice(0, hashIndex);

      // Only intercept when the anchor is on the current page. A bare
      // "#apply" or a path matching the current pathname stays here.
      if (path && path !== "" && path !== window.location.pathname) return;
      if (!document.getElementById("apply")) return;

      event.preventDefault();
      centerApply();
      history.replaceState(null, "", "#apply");
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Re-center on initial load / pathname change when arriving via #apply.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#apply") return;
    const id = window.requestAnimationFrame(() => {
      const target = document.getElementById("apply");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
