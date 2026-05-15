"use client";

import { useMemo, useState } from "react";

type Tier = "Excellent" | "Good" | "Fair" | "Poor" | "No Canadian Credit" | "Bankruptcy/Proposal";
type Mode = "estimate" | "traditional";

type Scenario = {
  id: number;
  price: number;
  rate: number;
  term: number;
  downPayment: number;
  tradeIn: number;
  owingOnTrade: number;
};

type ScenarioResult = Scenario & {
  gstAmount: number;
  negativeEquity: number;
  tradeEquity: number;
  financed: number;
  monthly: number;
  totalPayments: number;
  costOfBorrowing: number;
};

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

function calcScenario(s: Scenario): ScenarioResult {
  const taxableAmount = Math.max(0, s.price - s.tradeIn);
  const gstAmount = taxableAmount * 0.05;
  const negativeEquity = Math.max(0, s.owingOnTrade - s.tradeIn);
  const tradeEquity = Math.max(0, s.tradeIn - s.owingOnTrade);
  const financed = Math.max(0, taxableAmount * 1.05 + negativeEquity - s.downPayment);
  const monthly = pmt(financed, s.rate, s.term);
  const totalPayments = monthly * s.term;
  const costOfBorrowing = Math.max(0, totalPayments - financed);
  return { ...s, gstAmount, negativeEquity, tradeEquity, financed, monthly, totalPayments, costOfBorrowing };
}

function defaultScenario(id: number): Scenario {
  return { id, price: 28000, rate: 9.99, term: 72, downPayment: 2000, tradeIn: 0, owingOnTrade: 0 };
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

// ── Scenario Results Panel ────────────────────────────────────────────
function ScenarioPanel({ result }: { result: ScenarioResult }) {
  return (
    <>
      <span className="chip-accent">Monthly payment</span>
      <p className="mt-3 text-4xl font-extrabold leading-none md:text-[3.25rem]">
        {fmtCADCents(result.monthly)}
      </p>
      <p className="mt-2 text-sm text-brand-accent">
        at {result.rate.toFixed(2)}% over {result.term} months
      </p>

      <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Vehicle price</dt>
          <dd className="font-semibold">{fmtCAD(result.price)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">GST (5%)</dt>
          <dd className="font-semibold">{fmtCAD(result.gstAmount)}</dd>
        </div>
        {result.tradeIn > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Trade-in {result.negativeEquity > 0 ? "(negative equity)" : "equity"}</dt>
            <dd className="font-semibold">
              {result.negativeEquity > 0 ? `+${fmtCAD(result.negativeEquity)}` : `-${fmtCAD(result.tradeEquity)}`}
            </dd>
          </div>
        )}
        {result.downPayment > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-white/70">Down payment</dt>
            <dd className="font-semibold">-{fmtCAD(result.downPayment)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-white/15 pt-3">
          <dt className="text-white/70">Amount financed</dt>
          <dd className="font-semibold">{fmtCAD(result.financed)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Cost of borrowing</dt>
          <dd className="font-semibold text-brand-accent">{fmtCAD(result.costOfBorrowing)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/70">Total of {result.term} payments</dt>
          <dd className="font-semibold">{fmtCAD(result.totalPayments)}</dd>
        </div>
      </dl>
    </>
  );
}

// ── Scenario Input Form ───────────────────────────────────────────────
function ScenarioForm({
  scenario,
  onChange,
  idPrefix,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
  idPrefix: string;
}) {
  const result = calcScenario(scenario);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <NumericInput
          id={`${idPrefix}-price`}
          label="Vehicle price"
          value={scenario.price}
          onChange={v => onChange({ ...scenario, price: v })}
          step={500}
          min={0}
          max={200000}
        />
        <NumericInput
          id={`${idPrefix}-rate`}
          label="Interest rate"
          value={scenario.rate}
          onChange={v => onChange({ ...scenario, rate: v })}
          prefix=""
          suffix="%"
          step={0.25}
          min={0}
          max={30}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-term`} className="label">Loan term</label>
        <select
          id={`${idPrefix}-term`}
          className="input mt-1"
          value={scenario.term}
          onChange={e => {
            onChange({ ...scenario, term: Number(e.target.value) });
            trackUse();
          }}
        >
          {TERMS.map(t => (
            <option key={t} value={t}>{t} months</option>
          ))}
        </select>
      </div>

      <NumericInput
        id={`${idPrefix}-down`}
        label="Down payment"
        value={scenario.downPayment}
        onChange={v => onChange({ ...scenario, downPayment: v })}
        step={250}
        min={0}
        max={100000}
      />

      <div className="rounded-2xl bg-brand-cream/60 p-4 ring-1 ring-brand-line">
        <p className="label mb-3">Trade-in</p>
        <div className="grid gap-4 md:grid-cols-2">
          <NumericInput
            id={`${idPrefix}-trade`}
            label="Trade-in value"
            value={scenario.tradeIn}
            onChange={v => onChange({ ...scenario, tradeIn: v })}
            step={250}
            min={0}
            max={100000}
          />
          <NumericInput
            id={`${idPrefix}-owing`}
            label="Amount owing on trade"
            value={scenario.owingOnTrade}
            onChange={v => onChange({ ...scenario, owingOnTrade: v })}
            step={250}
            min={0}
            max={100000}
          />
        </div>
        {result.negativeEquity > 0 && (
          <p className="mt-2 text-xs text-amber-700">
            You have {fmtCAD(result.negativeEquity)} in negative equity — this will be added to your loan.
          </p>
        )}
        {result.tradeEquity > 0 && (
          <p className="mt-2 text-xs text-emerald-700">
            Your trade-in equity of {fmtCAD(result.tradeEquity)} reduces your loan.
          </p>
        )}
      </div>

      <p className="text-xs text-brand-muted">
        GST (5%) is calculated on the difference between the vehicle price and trade-in value (Alberta).
      </p>
    </div>
  );
}

// ── Traditional Calculator (multi-scenario) ───────────────────────────
function TraditionalCalculator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([defaultScenario(1)]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const results = scenarios.map(calcScenario);
  const activeResult = results[activeIdx];
  let nextId = Math.max(...scenarios.map(s => s.id)) + 1;

  function addScenario() {
    const newScenario = defaultScenario(nextId++);
    setScenarios(prev => [...prev, newScenario]);
    setActiveIdx(scenarios.length);
    trackUse();
  }

  function removeScenario(idx: number) {
    if (scenarios.length <= 1) return;
    setScenarios(prev => prev.filter((_, i) => i !== idx));
    setActiveIdx(prev => (prev >= idx && prev > 0 ? prev - 1 : prev));
  }

  function updateScenario(idx: number, updated: Scenario) {
    setScenarios(prev => prev.map((s, i) => (i === idx ? updated : s)));
  }

  function openEmailModal() {
    if (scenarios.length === 1) {
      setSelectedIds(new Set([scenarios[0].id]));
    } else {
      setSelectedIds(new Set(scenarios.map(s => s.id)));
    }
    setSent(false);
    setEmailModal(true);
  }

  function toggleScenarioSelection(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function sendEmail() {
    if (!email.trim() || selectedIds.size === 0) return;
    setSending(true);
    try {
      const selectedResults = results.filter(r => selectedIds.has(r.id));
      const res = await fetch("/api/calculator-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), scenarios: selectedResults }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {scenarios.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {scenarios.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    i === activeIdx
                      ? "bg-brand-deep text-white"
                      : "bg-brand-cream text-brand-ink ring-1 ring-brand-line hover:bg-brand-line"
                  }`}
                >
                  Scenario {i + 1}
                  {scenarios.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => {
                        e.stopPropagation();
                        removeScenario(i);
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          removeScenario(i);
                        }
                      }}
                      className={`ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-[10px] leading-none ${
                        i === activeIdx ? "text-white/60 hover:text-white" : "text-brand-muted hover:text-brand-ink"
                      }`}
                      aria-label={`Remove scenario ${i + 1}`}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <ScenarioForm
            scenario={scenarios[activeIdx]}
            onChange={s => updateScenario(activeIdx, s)}
            idPrefix={`s${scenarios[activeIdx].id}`}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addScenario}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-cream px-4 py-2 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-line"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
              </svg>
              Add another scenario
            </button>
            <button
              type="button"
              onClick={openEmailModal}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-deep px-4 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-forest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              Send me the numbers
            </button>
          </div>
        </div>

        <div className="no-cls rounded-3xl bg-brand-deep p-6 text-white md:p-8">
          {activeResult && <ScenarioPanel result={activeResult} />}

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

      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEmailModal(false)}>
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-brand-line md:p-8"
            onClick={e => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-accent/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-6 text-brand-forest">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-ink">Sent!</h3>
                <p className="mt-1 text-sm text-brand-muted">Check your inbox at {email}</p>
                <button
                  type="button"
                  onClick={() => setEmailModal(false)}
                  className="mt-4 rounded-full bg-brand-deep px-5 py-2 text-sm font-medium text-brand-accent hover:bg-brand-forest"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-brand-ink">Send me the numbers</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  We&apos;ll email you {scenarios.length > 1 ? "the selected scenarios" : "these numbers"} — no spam, just the breakdown.
                </p>

                {scenarios.length > 1 && (
                  <div className="mt-4">
                    <p className="label mb-2">Which scenarios?</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-brand-line text-brand-forest accent-brand-forest"
                          checked={selectedIds.size === scenarios.length}
                          onChange={() => {
                            if (selectedIds.size === scenarios.length) {
                              setSelectedIds(new Set());
                            } else {
                              setSelectedIds(new Set(scenarios.map(s => s.id)));
                            }
                          }}
                        />
                        <span className="font-medium text-brand-ink">All scenarios</span>
                      </label>
                      {scenarios.map((s, i) => {
                        const r = results[i];
                        return (
                          <label key={s.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-brand-line text-brand-forest accent-brand-forest"
                              checked={selectedIds.has(s.id)}
                              onChange={() => toggleScenarioSelection(s.id)}
                            />
                            <span className="text-brand-ink">
                              Scenario {i + 1}
                              <span className="ml-1 text-brand-muted">
                                — {fmtCADCents(r.monthly)}/mo at {s.rate}%
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label htmlFor="email-input" className="label">Email address</label>
                  <input
                    id="email-input"
                    type="email"
                    className="input mt-1 w-full"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") sendEmail();
                    }}
                    autoFocus
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEmailModal(false)}
                    className="flex-1 rounded-full border border-brand-line px-4 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={sending || !email.trim() || selectedIds.size === 0}
                    className="flex-1 rounded-full bg-brand-deep px-4 py-2.5 text-sm font-medium text-brand-accent transition-colors hover:bg-brand-forest disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
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
