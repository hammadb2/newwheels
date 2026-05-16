// Root layout for /crm/*. The CRM is a dark-sidebar + light-content app and
// runs under its own Next.js route group so it can swap in its own typography
// and chrome without touching the marketing site.
//
// Auth is enforced per-page via `requireTeam()`. We do NOT redirect here
// because the /crm/login page lives in this same tree and must be reachable
// without a session. Pages that need auth call `requireTeam(...)` themselves.

import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { CrmShell } from "@/components/crm/CrmShell";
import { readSession } from "@/lib/crm/auth/session";
import "@/app/globals.css";
import "./crm.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "NewWheels CRM",
  description: "Internal NewWheels lead operations console.",
  robots: { index: false, follow: false },
};

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession("crm");

  return (
    <html lang="en" className={bricolage.variable}>
      <body className="crm-root bg-[#F5F7F4] text-[#0A2818]">
        {session && session.subject.kind === "team" ? (
          <CrmShell role={session.subject.role}>{children}</CrmShell>
        ) : (
          <main className="min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}
