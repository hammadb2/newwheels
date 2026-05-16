"use client";

// Minimal Stripe Elements flow for adding a card. Loads stripe.js dynamically
// the first time the page renders, then collects a card via a CardElement
// against a SetupIntent we mint server-side.
//
// We don't use @stripe/react-stripe-js to keep the bundle small and avoid
// pulling in React peerDeps mismatches.

import { useEffect, useRef, useState } from "react";

type StripeJs = {
  elements: () => unknown;
  confirmCardSetup: (
    clientSecret: string,
    opts: { payment_method: { card: unknown; billing_details?: { name?: string; email?: string } } },
  ) => Promise<{ setupIntent?: { payment_method?: string }; error?: { message?: string } }>;
};

declare global {
  interface Window {
    Stripe?: (key: string) => StripeJs;
  }
}

export function PaymentClient({ stripePk }: { stripePk: string }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [stripe, setStripe] = useState<StripeJs | null>(null);
  const [cardEl, setCardEl] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!stripePk) {
      // Defer the setState until after this effect commit so we don't
      // synchronously cascade renders from within the effect body.
      const t = setTimeout(() => setError("Payments are not configured."), 0);
      return () => clearTimeout(t);
    }
    if (typeof window === "undefined") return;
    const existing = document.querySelector<HTMLScriptElement>("script[data-stripe-loader]");
    function init() {
      if (typeof window.Stripe !== "function") return;
      const s = window.Stripe(stripePk);
      setStripe(s);
      const elements = (s.elements as () => { create: (kind: string) => { mount: (el: HTMLElement) => void } })();
      const card = elements.create("card");
      if (cardRef.current) (card as { mount: (el: HTMLElement) => void }).mount(cardRef.current);
      setCardEl(card);
      setReady(true);
    }
    if (existing) {
      init();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.async = true;
    s.dataset.stripeLoader = "1";
    s.onload = init;
    document.body.appendChild(s);
  }, [stripePk]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !cardEl) return;
    setBusy(true);
    setError(null);
    try {
      const setupRes = await fetch("/api/portal/stripe/setup-intent", { method: "POST" });
      const setupJson = await setupRes.json();
      if (!setupRes.ok || !setupJson.ok) {
        setError(setupJson.error || "Couldn't initialise payment.");
        return;
      }
      const confirm = await stripe.confirmCardSetup(setupJson.client_secret, {
        payment_method: { card: cardEl },
      });
      if (confirm.error) {
        setError(confirm.error.message || "Card declined.");
        return;
      }
      const pmId = confirm.setupIntent?.payment_method;
      if (!pmId) {
        setError("No payment method returned.");
        return;
      }
      const saveRes = await fetch("/api/portal/stripe/save-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method_id: pmId }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson.ok) {
        setError(saveJson.error || "Couldn't save card.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        window.location.href = "/portal/marketplace";
      }, 1200);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-900">Card saved. Redirecting…</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div ref={cardRef} className="portal-input min-h-[44px]" />
      {!ready && <p className="text-sm text-[#6B7280]">Loading secure card form…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-primary" disabled={!ready || busy}>{busy ? "Saving…" : "Save card"}</button>
    </form>
  );
}
