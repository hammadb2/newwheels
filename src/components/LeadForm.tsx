"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "submitting" | "success" | "error";

type Props = {
  variant?: "hero" | "inline" | "compact";
  sourcePage: string;
  heading?: string;
  subheading?: string;
};

const CREDIT_OPTIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "No Canadian credit",
  "Bankruptcy / proposal",
];
const EMPLOYMENT_OPTIONS = [
  "Employed full-time",
  "Employed part-time",
  "Self-employed",
  "Contract / gig",
  "On a work permit",
  "Student",
  "Newcomer to Canada",
];
const TIMEFRAME_OPTIONS = ["This week", "This month", "Within 60 days", "Just exploring"];

export default function LeadForm({
  variant = "inline",
  sourcePage,
  heading = "Apply free. A specialist calls you in 1 hour",
  subheading = "100% free, no obligation, no hard credit check. We work with every major Canadian lender.",
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setErrorMsg(
        "Please tick the consent checkbox so we can submit your application.",
      );
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePage }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }
      setStatus("success");
      form.reset();
      setConsent(false);
      type LeadWindow = Window & {
        dataLayer?: unknown[];
        fbq?: (action: string, name: string, params?: Record<string, unknown>) => void;
        gtag?: (action: string, name: string, params?: Record<string, unknown>) => void;
      };
      const w = window as LeadWindow;
      try {
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "form_submit", source_page: sourcePage });
        w.fbq?.("track", "Lead", { source_page: sourcePage });
        w.gtag?.("event", "form_submit", { source_page: sourcePage });
      } catch {
        // Best-effort. Never block the success state.
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please call us.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-4xl bg-brand-deep p-7 text-white shadow-card ${
          variant === "compact" ? "" : "md:p-9"
        }`}
        role="status"
      >
        <span className="chip-accent">You&rsquo;re in</span>
        <h2 className="mt-3 text-3xl font-extrabold leading-tight text-brand-accent">
          Application received.
        </h2>
        <p className="mt-2 text-white/85">
          A specialist will call you within 1 hour during business hours. Watch for a Calgary number,
          a confirmation email, and a text from us.
        </p>
        <p className="mt-4 text-sm text-white/70">
          Can&apos;t wait? Call us directly at{" "}
          <a href="tel:+15879006051" className="font-semibold text-brand-accent underline-offset-4 underline">
            (587) 900-6051
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      id="apply"
      data-source={sourcePage}
      className={`rounded-4xl bg-white p-6 shadow-card ring-1 ring-brand-line md:p-8 ${
        variant === "hero" ? "md:p-9" : ""
      }`}
      noValidate
    >
      <div className="mb-5">
        <span className="chip-accent">2 minute application</span>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight text-brand-ink md:text-3xl">
          {heading}
        </h2>
        <p className="mt-2 text-sm text-brand-muted">{subheading}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">First name</label>
          <input id="firstName" name="firstName" autoComplete="given-name" required className="input" />
        </div>
        <div>
          <label htmlFor="lastName" className="label">Last name</label>
          <input id="lastName" name="lastName" autoComplete="family-name" required className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="label">Mobile phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="403-555-0123"
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="credit" className="label">Credit situation</label>
          <select id="credit" name="credit" required className="input">
            <option value="">Choose...</option>
            {CREDIT_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="employment" className="label">Employment status</label>
          <select id="employment" name="employment" required className="input">
            <option value="">Choose...</option>
            {EMPLOYMENT_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="visa" className="label">
            Status in Canada <span className="text-brand-muted/70">(optional)</span>
          </label>
          <input
            id="visa"
            name="visa"
            placeholder="Citizen, PR, work permit, study permit..."
            className="input"
          />
        </div>
        <div>
          <label htmlFor="timeframe" className="label">When do you need a vehicle?</label>
          <select id="timeframe" name="timeframe" required className="input">
            <option value="">Choose...</option>
            {TIMEFRAME_OPTIONS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="notes" className="label">
          Anything we should know? <span className="text-brand-muted/70">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Down payment, target vehicle, trade-in, hours you prefer to be reached..."
          className="input"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="consent"
          className="flex items-start gap-3 rounded-2xl bg-brand-cream/60 p-4 text-sm text-brand-ink ring-1 ring-brand-line"
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 flex-shrink-0 cursor-pointer accent-brand-forest"
            aria-describedby="consent-description"
          />
          <span id="consent-description" className="leading-relaxed">
            By submitting this form I consent to NewWheels collecting, using, and sharing my
            personal information with dealer and lender partners to facilitate my vehicle
            financing application, in accordance with the NewWheels{" "}
            <Link
              href="/privacy"
              className="font-semibold underline underline-offset-2 hover:text-brand-forest"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="btn-primary mt-5 min-h-[60px] w-full text-base font-extrabold"
        disabled={status === "submitting" || !consent}
        aria-disabled={status === "submitting" || !consent}
      >
        {status === "submitting" ? "Submitting..." : "Get my approval \u2014 free"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          {errorMsg || "We couldn't send that. Please try again, or call (587) 900-6051."}
        </p>
      )}
    </form>
  );
}
