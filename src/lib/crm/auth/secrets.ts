// Shared signing secrets for OTPs and session tokens.
//
// CRM_SESSION_SECRET is required in production. In development we fall back
// to a fixed dev string so the app boots — never rely on this in prod.

const DEV_FALLBACK = "dev-crm-session-secret-replace-in-prod-do-not-use";

export function getSessionSecret(): string {
  const raw = process.env.CRM_SESSION_SECRET?.trim();
  if (raw && raw.length >= 24) return raw;
  if (process.env.NODE_ENV === "production") {
    // Refuse to silently sign with a known-weak secret in prod.
    throw new Error(
      "CRM_SESSION_SECRET must be set to a long random string in production.",
    );
  }
  return DEV_FALLBACK;
}

export function getOtpSecret(): string {
  const raw = process.env.CRM_OTP_SECRET?.trim();
  if (raw && raw.length >= 16) return raw;
  // Re-use the session secret as a fallback so dev only needs one variable.
  return getSessionSecret();
}
