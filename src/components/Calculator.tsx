"use client";

import { useMemo, useState } from "react";

type Tier = "Excellent" | "Good" | "Fair" | "Poor" | "No Canadian Credit" | "Bankruptcy/Proposal";
type Mode = "estimate" | "traditional";

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

function fmtCADCents(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, n));
}

function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function trackUse() {
  type CalcWindow = Window & { dataLayer?: unknown[] };
  const w = window as CalcWindow;
  try {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "calculator_use" });
  } catch {
    // Best-effort
  }
}

function NumericInput({
  id,
  label,
  value,
  onChange,
  prefix = "$",
  suffix,
  step = 100,
  min = 0,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);

  function commit(s: string) {
    const n = parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
    const clamped = Math.min(max ?? Infinity, Math.max(min, n));
    onChange(clamped);
    setRaw(String(clamped));
    trackUse();
  }

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative mt-1">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={`input w-full ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
          value={focused ? raw : value.toLocaleString("en-CA")}
          onFocus={() => {
            setFocused(true);
            setRaw(String(value));
          }}
          onBlur={e => {
            setFocused(false);
            commit(e.target.value);
          }}
          onChange={e => {
            setRaw(e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(max ?? Infinity, value + step);
              onChange(next);
              setRaw(String(next));
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = Math.max(min, value - step);
              onChange(next);
              setRaw(String(next));
            } else if (e.key === "Enter") {
              commit(raw);
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brand-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Estimate Calculator (original) ────────────────────────────────────
function EstimateCalculator() {
  const [price, setPrice] = useState(28000);
  const [down, setDown] = useState(2000);
  const [term, setTerm] = useState(72);
  const [credit, setCredit] = useState<Tier>("Fair");

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-7">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="price" className="label">Vehicle price</label>
            <span className="text-lg font-extrabold text-brand-ink">{fmtCAD(price)}</span>
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
          <div className="mt-1 flex justify-between text-xs text-brand-muted/70">
            <span>{fmtCAD(priceMin)}</span>
            <span>{fmtCAD(priceMax)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="down" className="label">Down payment</label>
            <span className="text-lg font-extrabold text-brand-ink">{fmtCAD(down)}</span>
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
          <div className="mt-1 flex justify-between text-xs text-brand-muted/70">
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
            <select id="province" disabled className="input mt-1 bg-brand-cream" value="AB">
              <option value="AB">Alberta (no PST)</option>
            </select>
            <p className="mt-1 text-xs text-brand-muted">
              Alberta is the only province with no PST. We&apos;ve set this for you.
            </p>
          </div>
        </div>
      </div>

      <div className="no-cls rounded-3xl bg-brand-deep p-6 text-white md:p-8">
        <span className="chip-accent">Estimated monthly</span>
        <p className="mt-3 text-4xl font-extrabold leading-none md:text-[3.25rem]">
          {fmtCAD(monthlyLow)}
          <span className="text-lg font-semibold text-white/70"> &ndash; {fmtCAD(monthlyHigh)}</span>
        </p>
        <p className="mt-2 text-sm text-brand-accent">
          Rate range: {rLow.toFixed(2)}% &ndash; {rHigh.toFixed(2)}%
        </p>

        <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Loan amount (incl. 5% GST)</dt>
            <dd className="font-semibold">{fmtCAD(principal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Total interest paid</dt>
            <dd className="font-semibold">
              {fmtCAD(interestLow)} &ndash; {fmtCAD(interestHigh)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Total cost over {term} months</dt>
            <dd className="font-semibold">
              {fmtCAD(totalLow + down)} &ndash; {fmtCAD(totalHigh + down)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-2xl bg-brand-accent/10 p-4 text-sm ring-1 ring-brand-accent/30">
          <p className="font-bold text-brand-accent">Alberta has no PST.</p>
          <p className="mt-1 text-white/85">
            On this vehicle you&apos;d save about <strong className="text-brand-accent">{fmtCAD(albertaSavingsVsBC)}</strong> vs.
            BC and <strong className="text-brand-accent">{fmtCAD(albertaSavingsVsON)}</strong> vs. Ontario in sales tax alone.
          </p>
        </div>

        <p className="mt-4 text-xs text-white/55">
          Estimates only. Your real rate depends on your credit profile, income, and the vehicle.
        </p>
        <a
          href="#apply"
          className="btn-primary-dark mt-5 w-full text-sm"
        >
          Get my real numbers →
        </a>
      </div>
    </div>
  );
}

// ── Traditional Calculator ────────────────────────────────────────────
function TraditionalCalculator() {
  const [price, setPrice] = useState(28000);
  const [rate, setRate] = useState(9.99);
  const [term, setTerm] = useState(72);
  const [downPayment, setDownPayment] = useState(2000);
  const [tradeIn, setTradeIn] = useState(0);
  const [owingOnTrade, setOwingOnTrade] = useState(0);

  // Alberta GST (5%) applies on (vehicle price - trade-in value).
  // Trade-in reduces the taxable amount in Alberta.
  const taxableAmount = Math.max(0, price - tradeIn);
  const gstAmount = taxableAmount * 0.05;

  // Negative equity: if you owe more on trade than trade-in is worth
  const negativeEquity = Math.max(0, owingOnTrade - tradeIn);
  const tradeEquity = Math.max(0, tradeIn - owingOnTrade);

  // financed = (price - trade-in) × 1.05 + max(0, owing - trade-in) - down
  const financed = Math.max(0, taxableAmount * 1.05 + negativeEquity - downPayment);

  const monthly = pmt(financed, rate, term);
  const totalPayments = monthly * term;
  const costOfBorrowing = Math.max(0, totalPayments - financed);
  const totalCost = totalPayments + downPayment + tradeEquity;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <NumericInput
            id="trad-price"
            label="Vehicle price"
            value={price}
            onChange={setPrice}
            step={500}
            min={0}
            max={200000}
          />
          <NumericInput
            id="trad-rate"
            label="Interest rate"
            value={rate}
            onChange={setRate}
            prefix=""
            suffix="%"
            step={0.25}
            min={0}
            max={30}
          />
        </div>

        <div>
          <label htmlFor="trad-term" className="label">Loan term</label>
          <select
            id="trad-term"
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

        <NumericInput
          id="trad-down"
          label="Down payment"
          value={downPayment}
          onChange={setDownPayment}
          step={250}
          min={0}
          max={100000}
        />

        <div className="rounded-2xl bg-brand-cream/60 p-4 ring-1 ring-brand-line">
          <p className="label mb-3">Trade-in</p>
          <div className="grid gap-4 md:grid-cols-2">
            <NumericInput
              id="trad-trade"
              label="Trade-in value"
              value={tradeIn}
              onChange={setTradeIn}
              step={250}
              min={0}
              max={100000}
            />
            <NumericInput
              id="trad-owing"
              label="Amount owing on trade"
              value={owingOnTrade}
              onChange={setOwingOnTrade}
              step={250}
              min={0}
              max={100000}
            />
          </div>
          {negativeEquity > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              You have {fmtCAD(negativeEquity)} in negative equity — this will be added to your loan.
            </p>
          )}
          {tradeEquity > 0 && (
            <p className="mt-2 text-xs text-emerald-700">
              Your trade-in equity of {fmtCAD(tradeEquity)} reduces your loan.
            </p>
          )}
        </div>

        <p className="text-xs text-brand-muted">
          GST (5%) is calculated on the difference between the vehicle price and trade-in value (Alberta).
        </p>
      </div>

      <div className="no-cls rounded-3xl bg-brand-deep p-6 text-white md:p-8">
        <span className="chip-accent">Monthly payment</span>
        <p className="mt-3 text-4xl font-extrabold leading-none md:text-[3.25rem]">
          {fmtCADCents(monthly)}
        </p>
        <p className="mt-2 text-sm text-brand-accent">
          at {rate.toFixed(2)}% over {term} months
        </p>

        <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Vehicle price</dt>
            <dd className="font-semibold">{fmtCAD(price)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">GST (5%)</dt>
            <dd className="font-semibold">{fmtCAD(gstAmount)}</dd>
          </div>
          {tradeIn > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-white/70">Trade-in {negativeEquity > 0 ? "(negative equity)" : "equity"}</dt>
              <dd className="font-semibold">
                {negativeEquity > 0 ? `+${fmtCAD(negativeEquity)}` : `-${fmtCAD(tradeEquity)}`}
              </dd>
            </div>
          )}
          {downPayment > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-white/70">Down payment</dt>
              <dd className="font-semibold">-{fmtCAD(downPayment)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-white/15 pt-3">
            <dt className="text-white/70">Amount financed</dt>
            <dd className="font-semibold">{fmtCAD(financed)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Cost of borrowing</dt>
            <dd className="font-semibold text-brand-accent">{fmtCAD(costOfBorrowing)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Total of {term} payments</dt>
            <dd className="font-semibold">{fmtCAD(totalPayments)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-white/55">
          Estimates only. Actual terms depend on your credit profile and lender.
        </p>
        <a
          href="#apply"
          className="btn-primary-dark mt-5 w-full text-sm"
        >
          Get my real numbers →
        </a>
      </div>
    </div>
  );
}

// ── Main Calculator (with toggle) ─────────────────────────────────────
export default function Calculator() {
  const [mode, setMode] = useState<Mode>("estimate");

  return (
    <div className="rounded-4xl bg-white p-6 shadow-card ring-1 ring-brand-line md:p-10">
      {mode === "estimate" ? <EstimateCalculator /> : <TraditionalCalculator />}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setMode(mode === "estimate" ? "traditional" : "estimate")}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-cream px-4 py-1.5 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-line"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
            <path fillRule="evenodd" d="M13.5 2a.5.5 0 0 0-.5.5V5H9.5a.5.5 0 0 0 0 1H13a1 1 0 0 0 1-1V2.5a.5.5 0 0 0-.5-.5ZM2.5 14a.5.5 0 0 0 .5-.5V11h3.5a.5.5 0 0 0 0-1H3a1 1 0 0 0-1 1v2.5a.5.5 0 0 0 .5.5Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M14.08 5.012a6.5 6.5 0 0 0-12.16 0 .5.5 0 1 0 .937.35 5.5 5.5 0 0 1 10.286 0 .5.5 0 1 0 .937-.35ZM1.92 10.988a6.5 6.5 0 0 0 12.16 0 .5.5 0 0 0-.937-.35 5.5 5.5 0 0 1-10.286 0 .5.5 0 0 0-.937.35Z" clipRule="evenodd" />
          </svg>
          {mode === "estimate" ? "Switch to traditional calculator" : "Switch to estimate calculator"}
        </button>
      </div>
    </div>
  );
}
