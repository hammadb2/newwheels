// Portal root layout. Buyer-facing, light, mobile-first.

import type { Metadata } from "next";
import Link from "next/link";
import { readSession } from "@/lib/crm/auth/session";
import { getServerSupabase } from "@/lib/crm/supabase/server";
import "./portal.css";

export const metadata: Metadata = {
  title: "NewWheels Buyer Portal",
  description: "Browse and purchase verified Calgary subprime auto leads.",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession("portal");
  let displayName: string | null = null;
  let status: string | null = null;
  if (session && session.subject.kind === "buyer") {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("buyer_accounts")
        .select("contact_name, business_name, status")
        .eq("id", session.subject.buyer_account_id)
        .single();
      displayName = (data?.business_name as string) || (data?.contact_name as string) || null;
      status = (data?.status as string) || null;
    }
  }

  return (
    <div className="portal-root bg-white text-[#0A2818]">
      {session ? (
        <>
          <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-30">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
              <Link href="/portal" className="flex items-center gap-2 font-extrabold text-[#0A2818]">
                <img src="https://newwheels.ca/logo-icon.png" alt="" width={28} height={28} className="h-7 w-auto" />
                <span>NewWheels</span>
                <span className="bg-[#0A2818] text-[#D9FF4E] rounded px-2 py-0.5 text-xs">Portal</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#0A2818]">
                <Link href="/portal/marketplace" className="hover:underline">Marketplace</Link>
                <Link href="/portal/purchases" className="hover:underline">My leads</Link>
                <Link href="/portal/filters" className="hover:underline">Saved filters</Link>
                <Link href="/portal/account" className="hover:underline">Account</Link>
              </nav>
              <form action="/api/portal/auth/logout" method="post">
                <button type="submit" className="text-sm text-[#0A2818] underline-offset-2 hover:underline">Sign out</button>
              </form>
            </div>
            {status && status !== "active" ? (
              <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-center text-xs text-amber-900">
                {status === "pending_verification"
                  ? "Your account is pending verification. You can browse the marketplace shell, but lead details and Buy Now stay locked until our CEO approves you."
                  : status === "rejected"
                    ? "Your verification was rejected. Reply to your rejection email to send updated documents."
                    : "Your account is suspended. Contact us to resolve."}
              </div>
            ) : null}
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-[#E5E7EB] py-6 text-center text-xs text-[#6B7280]">
            {displayName ? `Signed in as ${displayName} · ` : ""}
            © {new Date().getFullYear()} NewWheels · Calgary, AB
          </footer>
        </>
      ) : (
        <div className="min-h-screen">{children}</div>
      )}
    </div>
  );
}
