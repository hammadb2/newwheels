import { NextResponse, type NextRequest } from "next/server";

// Two redirect rules at edge:
//   1) yourapproved.ca (any subdomain) → newwheels.ca preserving path
//   2) www.newwheels.ca → newwheels.ca preserving path
// HTTPS enforcement is handled by Vercel automatically on the assigned domains.
export function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() || "";
  const url = req.nextUrl.clone();

  if (host.endsWith("yourapproved.ca")) {
    url.host = "newwheels.ca";
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }
  if (host === "www.newwheels.ca") {
    url.host = "newwheels.ca";
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon|api/health).*)"],
};
