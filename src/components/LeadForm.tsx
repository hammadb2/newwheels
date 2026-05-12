"use client";

import { useState } from "react";

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
  heading = "Apply free. Hammad calls you in 1 hour",
  subheading = "100% free, no obligation, no hard credit check. We work with every major Canadian lender.",
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    // Honeypot: bots fill hidden fields. Pretend success without sending anywhere.
    if ((data.company as string) && (data.company as string).length > 0) {
      setStatus("success");
      return;
    }
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
        className={`rounded-xl bg-[#F9F9F9] p-6 ${variant === "compact" ? "" : "md:p-8"}`}
        role="status"
      >
        <h2 className="text-2xl font-bold text-[#111111]">Application received.</h2>
        <p className="mt-2 text-[#6B7280]">
          Hammad will call you within 1 hour during business hours. Watch for a Calgary number
          and an email from <strong>hello@newwheels.ca</strong> confirming your application.
        </p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Can&apos;t wait? Call us directly at{" "}
          <a href="tel:+15879006051" className="font-semibold text-[#111111] underline">
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
      className={`rounded-xl bg-[#F9F9F9] p-5 md:p-6 ${variant === "hero" ? "md:p-7" : ""}`}
      noValidate
    >
      <div className="mb-3">
        <h2 className="text-xl font-bold text-[#111111] md:text-2xl">{heading}</h2>
        <p className="mt-1 text-sm text-[#6B7280]">{subheading}</p>
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
            Status in Canada <span className="text-[#9CA3AF]">(optional)</span>
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

      <div className="mt-3">
        <label htmlFor="notes" className="label">
          Anything we should know? <span className="text-[#9CA3AF]">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Down payment, target vehicle, trade-in, hours you prefer to be reached..."
          className="input"
        />
      </div>

      {/* Honeypot */}
      <label className="sr-only" aria-hidden="true">
        Company<input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <p className="mt-4 text-xs text-[#9CA3AF]">
        By submitting you consent to be contacted by NewWheels. We never sell your information.
        Read our <a href="/privacy" className="underline">privacy policy</a>.
      </p>

      <button
        type="submit"
        className="btn-primary mt-4 min-h-[56px] w-full text-base"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Get My Approval \u2014 Free"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {errorMsg || "We couldn't send that. Please try again, or call (587) 900-6051."}
        </p>
      )}
    </form>
  );
}
