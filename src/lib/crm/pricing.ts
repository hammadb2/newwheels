// Dynamic pricing engine. Pure function — no I/O.
//
// Price updates every 6 hours from the moment the lead goes live. Buyers
// never see a countdown; they just see "current price". Lead expires at 72h
// unsold. Floor across every tier is $75 (7500 cents).
//
// The price schedule for each tier is hard-coded from the spec so that
// reporting + acquisition documentation can audit it line by line.

import { VERIFIED_PREMIUM_CENTS } from "./scoring";
import type { LeadTier } from "./types";

// All prices in cents. Order matters: index 0 is the price at 0–6h, index 1
// is 6–12h, etc. After the last value, the lead is at floor until expiry.
export const PRICE_SCHEDULE_CENTS: Record<LeadTier, readonly number[]> = {
  hot:      [20000, 17800, 15600, 13400, 11200, 10000, 8700, 7500],
  warm:     [15000, 13400, 11800, 10300, 9000, 8200, 7500],
  standard: [10000, 9200, 8400, 7800, 7500],
} as const;

export const PRICE_FLOOR_CENTS = 7500;
export const PRICE_BUCKET_HOURS = 6;
export const LEAD_LIFETIME_HOURS = 72;

export type CurrentPriceInput = {
  tier: LeadTier;
  available_at: Date | string;
  /** Verified leads carry the per-tier premium throughout their lifetime,
   *  but still decay to PRICE_FLOOR_CENTS at expiry. */
  verified?: boolean;
  now?: Date;
};

export type CurrentPriceResult = {
  price_cents: number;
  expired: boolean;
  hours_since_available: number;
  bucket_index: number;
};

/**
 * Compute the current price of a lead based on how long it has been live.
 * Returns the floor price when the lead is past its schedule but still
 * within its 72-hour lifetime. After 72h the lead is `expired`.
 */
export function currentPriceFor({ tier, available_at, verified = false, now = new Date() }: CurrentPriceInput): CurrentPriceResult {
  const start = typeof available_at === "string" ? new Date(available_at) : available_at;
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours >= LEAD_LIFETIME_HOURS) {
    return {
      price_cents: PRICE_FLOOR_CENTS,
      expired: true,
      hours_since_available: elapsedHours,
      bucket_index: Math.floor(elapsedHours / PRICE_BUCKET_HOURS),
    };
  }

  const schedule = PRICE_SCHEDULE_CENTS[tier];
  const bucketRaw = Math.max(0, Math.floor(elapsedHours / PRICE_BUCKET_HOURS));
  const bucket = Math.min(bucketRaw, schedule.length - 1);
  const baseFromCurve = Math.max(schedule[bucket], PRICE_FLOOR_CENTS);
  // For verified leads, every step of the curve carries the verified premium
  // additively. The floor (PRICE_FLOOR_CENTS) still applies — an unverified
  // lead at 42h+ is $75; a verified lead at 42h+ is $75 + premium.
  const price = verified ? baseFromCurve + VERIFIED_PREMIUM_CENTS[tier] : baseFromCurve;

  return {
    price_cents: price,
    expired: false,
    hours_since_available: elapsedHours,
    bucket_index: bucket,
  };
}

/**
 * Expiry timestamp for a lead given when it went live. The dynamic-pricing
 * cron and lead-list queries use this to short-circuit when a lead is past
 * its 72h window.
 */
export function expiryAt(available_at: Date | string): Date {
  const start = typeof available_at === "string" ? new Date(available_at) : available_at;
  return new Date(start.getTime() + LEAD_LIFETIME_HOURS * 60 * 60 * 1000);
}

export function priceCentsToDisplay(cents: number): string {
  const dollars = Math.round(cents / 100);
  return `$${dollars.toLocaleString("en-CA")}`;
}
