// Google Business Profile (GBP) wrapper.
//
// GBP review and Q&A endpoints are still on the legacy "mybusiness" v4
// surface, which isn't covered by the googleapis SDK. We call the REST
// endpoints directly using a short-lived access token from our service
// account.
//
// Required env:
//   GOOGLE_SERVICE_ACCOUNT_JSON  (shared with GSC/GA4)
//   GBP_ACCOUNT_ID               e.g. accounts/106123456789012345678
//   GBP_LOCATION_ID              e.g. locations/12345678901234567890
//
// The service account must be added as a manager on the GBP listing.
//
// Reviews and Q&A pulled here are persisted in `data/gbp-cache.json` so the
// site can render them in JSON-LD without hitting Google on every page
// render. The admin UI provides a "refresh" action that updates the cache.

import { googleAuthStatus, googleJwt } from "./auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import { gbpCachePath, safeMkdir, safeWriteFile } from "@/lib/admin-paths";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];
const GBP_BASE = "https://mybusiness.googleapis.com/v4";

export type GbpReview = {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: { comment: string; updateTime: string };
};

export type GbpQuestion = {
  name: string; // path-style id from Google
  author: { displayName: string; type: string };
  text: string;
  createTime: string;
  upvoteCount?: number;
  topAnswers?: { author: { displayName: string }; text: string; createTime: string }[];
  totalAnswerCount?: number;
};

export type GbpCache = {
  fetchedAt: string;
  reviews: GbpReview[];
  questions: GbpQuestion[];
  averageRating: number;
  reviewCount: number;
};

/**
 * Path to the GBP cache for the current runtime. Defaults to
 * `data/gbp-cache.json` locally and `/tmp/newwheels-data/gbp-cache.json` on
 * Vercel — see `src/lib/admin-paths.ts`.
 */
export function gbpCacheFile(): string {
  return gbpCachePath();
}

export function gbpConfigStatus(): {
  configured: boolean;
  reason?: "missing-credentials" | "missing-ids";
} {
  const auth = googleAuthStatus();
  if (!auth.configured) return { configured: false, reason: "missing-credentials" };
  const accountId = process.env.GBP_ACCOUNT_ID?.trim();
  const locationId = process.env.GBP_LOCATION_ID?.trim();
  if (!accountId || !locationId) return { configured: false, reason: "missing-ids" };
  return { configured: true };
}

function starRatingToNumber(r: GbpReview["starRating"]): number {
  return { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r];
}

async function authedFetch(url: string): Promise<unknown> {
  const jwt = googleJwt(SCOPES);
  if (!jwt) throw new Error("No Google JWT available");
  const { token } = await jwt.getAccessToken();
  if (!token) throw new Error("Failed to obtain access token");
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GBP ${resp.status}: ${text.slice(0, 400)}`);
  }
  return resp.json();
}

/** Fetch the live reviews list from GBP. */
export async function gbpFetchReviews(): Promise<GbpReview[]> {
  const status = gbpConfigStatus();
  if (!status.configured) throw new Error(status.reason ?? "not-configured");
  const accountId = process.env.GBP_ACCOUNT_ID!.trim().replace(/^accounts\//, "");
  const locationId = process.env.GBP_LOCATION_ID!.trim().replace(/^locations\//, "");
  const url = `${GBP_BASE}/accounts/${accountId}/locations/${locationId}/reviews?pageSize=50`;
  const data = (await authedFetch(url)) as { reviews?: GbpReview[] };
  return data.reviews ?? [];
}

/** Fetch the live Q&A list from GBP. */
export async function gbpFetchQuestions(): Promise<GbpQuestion[]> {
  const status = gbpConfigStatus();
  if (!status.configured) throw new Error(status.reason ?? "not-configured");
  const locationId = process.env.GBP_LOCATION_ID!.trim().replace(/^locations\//, "");
  const url = `https://mybusinessqanda.googleapis.com/v1/locations/${locationId}/questions?pageSize=20&answersPerQuestion=1&orderBy=upvoteCount+desc`;
  const data = (await authedFetch(url)) as { questions?: GbpQuestion[] };
  return data.questions ?? [];
}

export async function refreshGbpCache(): Promise<GbpCache> {
  const [reviews, questions] = await Promise.all([
    gbpFetchReviews().catch(() => []),
    gbpFetchQuestions().catch(() => []),
  ]);
  const rated = reviews.filter(r => r.starRating);
  const avg = rated.length
    ? rated.reduce((s, r) => s + starRatingToNumber(r.starRating), 0) / rated.length
    : 0;
  const cache: GbpCache = {
    fetchedAt: new Date().toISOString(),
    reviews,
    questions,
    averageRating: Number(avg.toFixed(2)),
    reviewCount: reviews.length,
  };
  const file = gbpCacheFile();
  await safeMkdir(path.dirname(file));
  await safeWriteFile(file, JSON.stringify(cache, null, 2));
  return cache;
}

export async function readGbpCache(): Promise<GbpCache | null> {
  try {
    const raw = await fs.readFile(gbpCacheFile(), "utf8");
    return JSON.parse(raw) as GbpCache;
  } catch {
    return null;
  }
}

/** Convert a cached GBP review into the schema-friendly seed shape. */
export function gbpReviewToSeed(r: GbpReview): {
  author: string;
  body: string;
  rating: number;
  datePublished: string;
} {
  return {
    author: r.reviewer.displayName,
    body: r.comment ?? "",
    rating: starRatingToNumber(r.starRating),
    datePublished: (r.updateTime ?? r.createTime).slice(0, 10),
  };
}
