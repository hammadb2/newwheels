"use client";

// Two-step OTP login form. Reused by both /crm/login and /portal/login —
// the only difference is which API namespace it hits.

import { useState } from "react";

type Audience = "crm" | "portal";

export function LoginForm({ audience }: { audience: Audience }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const base = audience === "crm" ? "/api/crm/auth" : "/api/portal/auth";
  const onReturn = audience === "crm" ? "/crm" : "/portal";

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${base}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), remember }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && !json?.ok) {
        setError(json?.error || "Something went wrong. Try again.");
        return;
      }
      setStep("code");
      setInfo("Check your email for the 6-digit code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${base}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(translate(json?.error) ?? "Invalid code");
        return;
      }
      window.location.href = onReturn;
    } finally {
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={requestCode} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-[#0A2818]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-[#0A2818]"
            placeholder={audience === "crm" ? "you@team.newwheels.ca" : "you@example.com"}
            autoComplete="email"
          />
        </div>
        {audience === "portal" && (
          <label className="flex items-center gap-2 text-sm text-[#0A2818]">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember this device for 30 days
          </label>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[#0A2818] text-[#D9FF4E] font-bold py-2 hover:bg-[#0E3D24] disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <p className="text-sm text-[#0A2818]">{info}</p>
      <div>
        <label className="block text-sm font-semibold mb-1 text-[#0A2818]">6-digit code</label>
        <input
          type="text"
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-center text-2xl tracking-[0.4em] font-mono text-[#0A2818] focus:outline-none focus:ring-2 focus:ring-[#0A2818]"
          autoComplete="one-time-code"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[#0A2818] text-[#D9FF4E] font-bold py-2 hover:bg-[#0E3D24] disabled:opacity-60"
      >
        {busy ? "Verifying…" : "Verify and continue"}
      </button>
      <button
        type="button"
        className="w-full text-sm text-[#0A2818] underline-offset-2 hover:underline"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
        }}
      >
        Use a different email
      </button>
    </form>
  );
}

function translate(err?: string): string | undefined {
  switch (err) {
    case "invalid_code": return "That code didn't match. Try again.";
    case "expired":      return "That code expired. Send a new one.";
    case "too_many_attempts": return "Too many attempts. Request a new code.";
    case "unknown_user": return "We couldn't find a CRM account for that email.";
    case "unknown_buyer": return "We couldn't find a buyer account for that email.";
    default: return undefined;
  }
}
