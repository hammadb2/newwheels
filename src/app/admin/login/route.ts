// Tiny auth-by-shared-token endpoint. Visit
//   /admin/login?token=<value>
// once. If <value> matches ADMIN_TOKEN, the request gets a long-lived
// (30-day) HttpOnly cookie and is redirected to /admin. Otherwise it 404s
// like everything else under /admin.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, getAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = getAdminToken();
  if (!expected) notFound();

  const url = new URL(request.url);
  const provided = url.searchParams.get("token") ?? "";
  if (provided !== expected) notFound();

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect("/admin");
}
