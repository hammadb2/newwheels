import { NextResponse, type NextRequest } from "next/server";

// 1) Force HTTPS if the request arrived over plain HTTP.
// 2) Redirect www.newwheels.ca → newwheels.ca preserving path.
export function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() || "";
  const proto = req.headers.get("x-forwarded-proto");
  const url = req.nextUrl.clone();

  if (proto === "http") {
    url.host = host === "www.newwheels.ca" ? "newwheels.ca" : host;
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
