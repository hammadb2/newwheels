"use client";

// Buyer signup form. Handles both dealer master + individual flows.
// Uploads documents directly to the API which streams them into Supabase
// Storage (private bucket).

import { useState } from "react";
import Link from "next/link";

type Kind = "dealer_master" | "individual";

export function SignupForm() {
  const [kind, setKind] = useState<Kind>("dealer_master");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amvic, setAmvic] = useState("");
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Please agree to the terms to continue.");
      return;
    }
    if (!licenceFile || !idFile) {
      setError("Both documents are required.");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("email", email.trim());
      fd.append("contact_name", contactName.trim());
      fd.append("phone", phone.trim());
      fd.append("amvic_licence", amvic.trim());
      if (kind === "dealer_master") {
        fd.append("business_name", businessName.trim());
        fd.append("business_address", businessAddress.trim());
      }
      fd.append("amvic_doc", licenceFile);
      fd.append("gov_id_doc", idFile);

      const res = await fetch("/api/portal/signup", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || "Signup failed. Please double-check your details.");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-extrabold text-[#0A2818]">Application received</h2>
        <p className="text-sm text-[#0A2818]">
          We&apos;ll review your documents and email you within one business day. You can sign in any time — your dashboard will show the latest status.
        </p>
        <Link href="/portal/login" className="btn-primary inline-flex mt-4">Go to sign-in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setKind("dealer_master")} className={`p-3 rounded-lg border-2 text-left ${kind === "dealer_master" ? "border-[#0A2818] bg-[#F5F7F4]" : "border-[#E5E7EB] bg-white"}`}>
          <div className="font-bold text-[#0A2818]">Dealership</div>
          <div className="text-xs text-[#6B7280]">Master account with sub-accounts</div>
        </button>
        <button type="button" onClick={() => setKind("individual")} className={`p-3 rounded-lg border-2 text-left ${kind === "individual" ? "border-[#0A2818] bg-[#F5F7F4]" : "border-[#E5E7EB] bg-white"}`}>
          <div className="font-bold text-[#0A2818]">Individual buyer</div>
          <div className="text-xs text-[#6B7280]">Single AMVIC-licenced buyer</div>
        </button>
      </div>

      {kind === "dealer_master" && (
        <>
          <Field label="Business name" required>
            <input className="portal-input" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </Field>
          <Field label="Business address" required>
            <input className="portal-input" required value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
          </Field>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={kind === "dealer_master" ? "Contact name (signing person)" : "Full name"} required>
          <input className="portal-input" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </Field>
        <Field label="Phone" required>
          <input type="tel" className="portal-input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email" required>
          <input type="email" className="portal-input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="AMVIC licence number" required>
          <input className="portal-input" required value={amvic} onChange={(e) => setAmvic(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="AMVIC licence document (PDF or image)" required>
          <input type="file" accept="application/pdf,image/*" required onChange={(e) => setLicenceFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Field label="Government-issued photo ID" required>
          <input type="file" accept="application/pdf,image/*" required onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm text-[#0A2818]">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
        <span>
          I confirm the information is accurate and agree to the <a href="https://newwheels.ca/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Use</a>. Lead purchases are final.
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#0A2818] mb-1">
        {label}{required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}
