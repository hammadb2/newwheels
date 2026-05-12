"use client";

import { useEffect } from "react";

// Attaches a single delegated listener to fire call_click events on any
// link tagged with data-analytics="call_click". This keeps the markup
// clean and works no matter where phone links appear (header, footer, etc.).
export default function CallClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const link = target?.closest('[data-analytics="call_click"]');
      if (!link) return;
      type CallWindow = Window & {
        dataLayer?: unknown[];
        gtag?: (action: string, name: string, params?: Record<string, unknown>) => void;
      };
      const w = window as CallWindow;
      try {
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "call_click" });
        w.gtag?.("event", "call_click");
      } catch {
        // Best-effort.
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
