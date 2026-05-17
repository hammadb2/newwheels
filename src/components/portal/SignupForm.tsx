"use client";

// Buyer signup form. Handles both dealer master + individual flows.
// Uploads documents directly to the API which streams them into Supabase
// Storage (private bucket).

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

type Kind = "dealer_master" | "individual";

const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.ca",
  "outlook.com",
  "outlook.ca",
  "live.com",
  "live.ca",
  "yahoo.com",
  "yahoo.ca",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "gmx.ca",
  "fastmail.com",
  "tutanota.com",
  "tuta.io",
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const d = digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  const d = digits.startsWith("1") ? digits.slice(1) : digits;
  return d.length === 10;
}

function getEmailDomain(email: string): string {
  const parts = email.split("@");
  return (parts[1] || "").toLowerCase();
}

function isBlockedEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return BLOCKED_EMAIL_DOMAINS.includes(domain);
}

type NominatimResult = {
  display_name: string;
  place_id: number;
};

export function SignupForm() {
  const [kind, setKind] = useState<Kind>("dealer_master");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amvic, setAmvic] = useState("");
  const [dealershipName, setDealershipName] = useState("");
  const [dealershipAddress, setDealershipAddress] = useState("");
  const [dealershipPhone, setDealershipPhone] = useState("");
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = (await res.json()) as NominatimResult[];
      setAddressSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setAddressSuggestions([]);
    }
  }, []);

  function handleAddressInput(value: string) {
    setDealershipAddress(value);
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    addressDebounceRef.current = setTimeout(() => searchAddress(value), 350);
  }

  function selectAddress(result: NominatimResult) {
    setDealershipAddress(result.display_name);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handlePhoneChange(value: string, setter: (v: string) => void) {
    setter(formatPhone(value));
  }

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

    if (kind === "individual") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("First name and last name are required.");
        return;
      }
      if (!dealershipName.trim()) {
        setError("Please enter the dealership you work at.");
        return;
      }
      if (!dealershipAddress.trim()) {
        setError("Please enter the dealership address.");
        return;
      }
      if (!dealershipPhone.trim()) {
        setError("Please enter the dealership phone number.");
        return;
      }
      if (!isValidPhone(dealershipPhone)) {
        setError("Dealership phone number must be a valid 10-digit number, e.g. (403) 555-0123.");
        return;
      }
    }

    if (!isValidPhone(phone)) {
      setError("Phone number must be a valid 10-digit number, e.g. (403) 555-0123.");
      return;
    }

    if (isBlockedEmail(email)) {
      setError("Please use your company email address, not a personal email (e.g. Gmail, Hotmail, Outlook).");
      return;
    }

    if (kind === "individual" && dealershipName.trim()) {
      const emailDomain = getEmailDomain(email.trim());
      const dealerLower = dealershipName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const domainBase = emailDomain.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (dealerLower && domainBase && !dealerLower.includes(domainBase) && !domainBase.includes(dealerLower)) {
        setError(`Your email domain (@${emailDomain}) doesn't appear to match the dealership "${dealershipName.trim()}". Please use your dealership email.`);
        return;
      }
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      fd.append("amvic_licence", amvic.trim());
      if (kind === "dealer_master") {
        fd.append("contact_name", contactName.trim());
        fd.append("business_name", businessName.trim());
        fd.append("business_address", businessAddress.trim());
      } else {
        fd.append("first_name", firstName.trim());
        fd.append("last_name", lastName.trim());
        fd.append("contact_name", `${firstName.trim()} ${lastName.trim()}`);
        fd.append("dealership_name", dealershipName.trim());
        fd.append("dealership_address", dealershipAddress.trim());
        fd.append("dealership_phone", dealershipPhone.trim());
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

      {kind === "individual" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input className="portal-input" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Last name" required>
              <input className="portal-input" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Phone" required>
              <input type="tel" className="portal-input" required value={phone} onChange={(e) => handlePhoneChange(e.target.value, setPhone)} placeholder="(403) 555-0123" />
            </Field>
            <Field label="Dealership you work at" required>
              <input className="portal-input" required value={dealershipName} onChange={(e) => setDealershipName(e.target.value)} placeholder="e.g. Calgary Auto Group" />
            </Field>
          </div>

          <div ref={addressWrapperRef} className="relative">
            <Field label="Dealership address" required>
              <input
                className="portal-input"
                required
                value={dealershipAddress}
                onChange={(e) => handleAddressInput(e.target.value)}
                onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Start typing to search..."
                autoComplete="off"
              />
            </Field>
            {showSuggestions && addressSuggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#D1D5DB] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {addressSuggestions.map((s) => (
                  <li key={s.place_id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-[#0A2818] hover:bg-[#F5F7F4] border-b border-[#F1F2EE] last:border-b-0"
                      onClick={() => selectAddress(s)}
                    >
                      {s.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Field label="Dealership phone number" required>
            <input type="tel" className="portal-input" required value={dealershipPhone} onChange={(e) => handlePhoneChange(e.target.value, setDealershipPhone)} placeholder="(403) 555-0123" />
          </Field>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact name (signing person)" required>
            <input className="portal-input" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>
          <Field label="Phone" required>
            <input type="tel" className="portal-input" required value={phone} onChange={(e) => handlePhoneChange(e.target.value, setPhone)} placeholder="(403) 555-0123" />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email" required hint="Use your company email — personal emails (Gmail, Hotmail, etc.) are not accepted.">
          <input type="email" className="portal-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourdealership.com" />
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

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#0A2818] mb-1">
        {label}{required ? <span className="text-red-600">*</span> : null}
      </span>
      {hint && <span className="block text-xs text-[#6B7280] mb-1">{hint}</span>}
      {children}
    </label>
  );
}
