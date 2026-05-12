"use client";

import { useMemo, useState } from "react";

type Tier = "Excellent" | "Good" | "Fair" | "Poor" | "No Canadian Credit" | "Bankruptcy/Proposal";

// Conservative Calgary subprime ranges as of mid-2026. These are estimates
// only. The calculator headline makes that clear and pushes to the form.
const RATE_RANGES: Record<Tier, [number, number]> = {
  Excellent: [5.99, 7.99],
  Good: [7.99, 10.99],
  Fair: [10.99, 13.99],
  Poor: [13.99, 19.99],
  "No Canadian Credit": [9.99, 14.99],
  "Bankruptcy/Proposal": [14.99, 21.99],
};

const CREDIT_OPTIONS: Tier[] = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "No Canadian Credit",
  "Bankruptcy/Proposal",
];

const TERMS = [24, 36, 48, 60, 72, 84];

function fmtCAD(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));
}

function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export default function Calculator() {
  const [price, setPrice] = useState(28000);
  const [down, setDown] = useState(2000);
  const [term, setTerm] = useState(72);
  const [credit, setCredit] = useState<Tier>("Fair");

  // Alberta GST only (5%), no PST. We apply it to the principal as a realistic estimate.
  const gst = 0.05;
  const taxed = price * (1 + gst);
  const principal = Math.max(0, taxed - down);
  const [rLow, rHigh] = RATE_RANGES[credit];
  const monthlyLow = pmt(principal, rLow, term);
  const monthlyHigh = pmt(principal, rHigh, term);
  const totalLow = monthlyLow * term;
  const totalHigh = monthlyHigh * term;
  const interestLow = Math.max(0, totalLow - principal);
  const interestHigh = Math.max(0, totalHigh - principal);

  // For comparison: same vehicle in Ontario (HST 13%) or BC (GST 5% + PST 7% = 12%).
  const ontarioTaxed = price * 1.13;
  const bcTaxed = price * 1.12;
  const albertaSavingsVsBC = Math.max(0, bcTaxed - taxed);
  const albertaSavingsVsON = Math.max(0, ontarioTaxed - taxed);

  const priceMin = 5000;
  const priceMax = 80000;
  const downMin = 0;
  const downMax = 20000;

  const pricePct = useMemo(
    () => ((price - priceMin) / (priceMax - priceMin)) * 100,
    [price],
  );
  const downPct = useMemo(
    () => ((down - downMin) / (downMax - downMin)) * 100,
    [down],
  );

  function trackUse() {
    type CalcWindow = Window & { dataLayer?: unknown[] };
    const w = window as CalcWindow;
    try {
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: "calculator_use" });
    } catch {
      // Best-effort: tracking should never break the calculator UI.
    }
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-brand-line bg-white p-5 md:p-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="price" className="label">Vehicle price</label>
            <span className="text-base font-semibold text-[#111111]">{fmtCAD(price)}</span>
          </div>
          <input
            id="price"
            type="range"
            className="slider mt-2 w-full"
            min={priceMin}
            max={priceMax}
            step={1000}
            value={price}
            onChange={e => {
              setPrice(Number(e.target.value));
              trackUse();
            }}
            style={{ ["--pct" as string]: `${pricePct}%` } as React.CSSProperties}
            aria-label="Vehicle price"
          />
          <div className="mt-1 flex justify-between text-xs text-[#9CA3AF]">
            <span>{fmtCAD(priceMin)}</span>
            <span>{fmtCAD(priceMax)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="down" className="label">Down payment</label>
            <span className="text-base font-semibold text-[#111111]">{fmtCAD(down)}</span>
          </div>
          <input
            id="down"
            type="range"
            className="slider mt-2 w-full"
            min={downMin}
            max={downMax}
            step={250}
            value={down}
            onChange={e => {
              setDown(Number(e.target.value));
              trackUse();
            }}
            style={{ ["--pct" as string]: `${downPct}%` } as React.CSSProperties}
            aria-label="Down payment"
          />
          <div className="mt-1 flex justify-between text-xs text-[#9CA3AF]">
            <span>{fmtCAD(downMin)}</span>
            <span>{fmtCAD(downMax)}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="term" className="label">Loan term</label>
            <select
              id="term"
              className="input mt-1"
              value={term}
              onChange={e => {
                setTerm(Number(e.target.value));
                trackUse();
              }}
            >
              {TERMS.map(t => (
                <option key={t} value={t}>{t} months</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="credit" className="label">Credit situation</label>
            <select
              id="credit"
              className="input mt-1"
              value={credit}
              onChange={e => {
                setCredit(e.target.value as Tier);
                trackUse();
              }}
            >
              {CREDIT_OPTIONS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="province" className="label">Province</label>
            <select id="province" disabled className="input mt-1 bg-[#F9F9F9]" value="AB">
              <option value="AB">Alberta (no PST)</option>
            </select>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Alberta is the only province with no PST. We&apos;ve set this for you.
            </p>
          </div>
        </div>
      </div>

      <div className="no-cls rounded-xl bg-brand-primary p-5 text-white md:p-6">
        <p className="text-sm uppercase tracking-wide text-white/80">Estimated monthly payment</p>
        <p className="mt-1 text-4xl font-bold leading-tight md:text-5xl">
          {fmtCAD(monthlyLow)}
          <span className="text-xl font-semibold opacity-80"> - {fmtCAD(monthlyHigh)}</span>
        </p>
        <p className="mt-1 text-sm text-white/90">
          Estimated rate range: {rLow.toFixed(2)}% - {rHigh.toFixed(2)}%
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Loan amount (incl. 5% GST)</dt>
            <dd className="font-semibold">{fmtCAD(principal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Total interest paid</dt>
            <dd className="font-semibold">
              {fmtCAD(interestLow)} - {fmtCAD(interestHigh)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Total cost over {term} months</dt>
            <dd className="font-semibold">
              {fmtCAD(totalLow + down)} - {fmtCAD(totalHigh + down)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-lg bg-white/10 p-3 text-sm">
          <p className="font-semibold">Alberta has no PST.</p>
          <p className="mt-1 text-white/90">
            On this vehicle you&apos;d save about <strong>{fmtCAD(albertaSavingsVsBC)}</strong> vs.
            BC and <strong>{fmtCAD(albertaSavingsVsON)}</strong> vs. Ontario in sales tax alone.
          </p>
        </div>

        <p className="mt-4 text-xs text-white/80">
          Estimates only. Your real rate depends on your credit profile, income, and the vehicle.
        </p>
        <a
          href="#apply"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 font-semibold text-brand-primary transition hover:bg-[#F9F9F9]"
        >
          Get my real numbers in 24 hours →
        </a>
      </div>
    </div>
  );
}
