"use client";

// A single marketplace card. We blur the situation summary until the buyer
// has a card on file (per spec). Buy Now hits POST /api/portal/purchases.

import { useState } from "react";
import type { MarketplaceLeadCard } from "@/lib/crm/marketplace";

export function MarketplaceCard({ card, cardOnFile }: { card: MarketplaceLeadCard; cardOnFile: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/portal/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: card.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Purchase failed");
        return;
      }
      window.location.href = `/portal/purchases/${json.purchase_id}`;
    } finally {
      setBusy(false);
    }
  }

  const tierClass = card.tier === "hot" ? "tier-pill tier-pill-hot" : card.tier === "warm" ? "tier-pill tier-pill-warm" : "";
  const tierLabel = card.tier === "hot" ? "Hot" : card.tier === "warm" ? "Warm" : "Standard";
  const credit = card.credit_bracket === "good" ? "Good credit" : card.credit_bracket === "fair" ? "Fair credit" : "Poor credit";

  return (
    <div className="lead-card">
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-[#0A2818]">{card.first_name}</span>
        {tierClass ? <span className={tierClass}>{tierLabel}</span> : <span className="text-xs text-[#6B7280] uppercase tracking-wider">{tierLabel}</span>}
      </div>
      <p className={`text-sm text-[#0A2818] ${cardOnFile ? "" : "blur"}`}>{card.situation_summary}</p>
      <p className="text-xs uppercase tracking-wider text-[#6B7280]">{credit}</p>
      <div className="flex items-end justify-between pt-2 border-t border-[#F1F2EE]">
        <div>
          <p className="text-xs text-[#6B7280]">Current price</p>
          <p className="text-2xl font-extrabold text-[#0A2818]">{card.current_price_display}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={buy}
          disabled={!cardOnFile || busy}
        >
          {busy ? "Charging…" : cardOnFile ? "Buy now" : "Add card first"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
