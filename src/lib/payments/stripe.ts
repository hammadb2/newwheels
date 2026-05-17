// Thin Stripe API client (REST). We avoid the stripe SDK to keep the
// build small and avoid version drift; the surface we use is tiny.

const STRIPE_API = "https://api.stripe.com/v1";

function key(): string | null {
  return process.env.STRIPE_SECRET_KEY || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(key());
}

async function stripePost<T>(path: string, body: Record<string, string | number | undefined | null>): Promise<T> {
  const k = key();
  if (!k) throw new Error("stripe_not_configured");
  const form = new URLSearchParams();
  for (const [name, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    form.append(name, String(value));
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${k}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const err = (json as { error?: { message?: string } })?.error?.message ?? "stripe_error";
    throw new Error(err);
  }
  return json as T;
}

async function stripeGet<T>(path: string): Promise<T> {
  const k = key();
  if (!k) throw new Error("stripe_not_configured");
  const res = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${k}` },
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const err = (json as { error?: { message?: string } })?.error?.message ?? "stripe_error";
    throw new Error(err);
  }
  return json as T;
}

export type StripeCustomer = { id: string };
export async function createCustomer(opts: { email: string; name?: string; metadata?: Record<string, string> }): Promise<StripeCustomer> {
  const body: Record<string, string> = { email: opts.email };
  if (opts.name) body.name = opts.name;
  for (const [k2, v] of Object.entries(opts.metadata ?? {})) body[`metadata[${k2}]`] = v;
  return stripePost<StripeCustomer>("/customers", body);
}

export type SetupIntent = { id: string; client_secret: string; status: string };
export async function createSetupIntent(opts: { customer: string; payment_method_types?: string[] }): Promise<SetupIntent> {
  return stripePost<SetupIntent>("/setup_intents", {
    customer: opts.customer,
    "payment_method_types[0]": (opts.payment_method_types ?? ["card"])[0],
    usage: "off_session",
  });
}

export type PaymentIntent = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  client_secret: string;
};
export async function createPaymentIntent(opts: {
  amount_cents: number;
  customer: string;
  payment_method: string;
  off_session: boolean;
  confirm?: boolean;
  metadata?: Record<string, string>;
  description?: string;
}): Promise<PaymentIntent> {
  const body: Record<string, string | number> = {
    amount: opts.amount_cents,
    currency: "cad",
    customer: opts.customer,
    payment_method: opts.payment_method,
    off_session: String(opts.off_session),
    confirm: String(opts.confirm ?? true),
  };
  if (opts.description) body.description = opts.description;
  for (const [k2, v] of Object.entries(opts.metadata ?? {})) body[`metadata[${k2}]`] = v;
  return stripePost<PaymentIntent>("/payment_intents", body);
}

export async function retrievePaymentIntent(id: string): Promise<PaymentIntent> {
  return stripeGet<PaymentIntent>(`/payment_intents/${encodeURIComponent(id)}`);
}

export type PaymentMethodCard = { brand: string; last4: string };
export async function retrievePaymentMethodCard(id: string): Promise<PaymentMethodCard | null> {
  try {
    const pm = await stripeGet<{ card?: { brand?: string; last4?: string } }>(`/payment_methods/${encodeURIComponent(id)}`);
    if (pm.card?.brand && pm.card?.last4) return { brand: pm.card.brand, last4: pm.card.last4 };
    return null;
  } catch { return null; }
}

export type Refund = { id: string; status: string };
export async function createRefund(opts: { payment_intent: string; reason?: string }): Promise<Refund> {
  const body: Record<string, string> = { payment_intent: opts.payment_intent };
  if (opts.reason) body.reason = opts.reason;
  return stripePost<Refund>("/refunds", body);
}

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};
