// Helpers for setting/clearing the session cookie. Server-only.

import { cookies } from "next/headers";
import { SESSION_COOKIE, type Audience } from "./session";

const ROOT_DOMAIN = process.env.NW_COOKIE_DOMAIN || undefined; // e.g. ".newwheels.ca"

export async function setSessionCookie(audience: Audience, token: string, expiresAt: Date): Promise<void> {
  const jar = await cookies();
  jar.set({
    name: SESSION_COOKIE[audience],
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    domain: ROOT_DOMAIN,
  });
}

export async function clearSessionCookie(audience: Audience): Promise<void> {
  const jar = await cookies();
  jar.set({
    name: SESSION_COOKIE[audience],
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    domain: ROOT_DOMAIN,
  });
}
