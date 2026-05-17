"use client";

// Sidebar + topbar for the CRM. Role-gated nav items so each VA only sees
// what they can act on. The CRM Shell is rendered by /crm/layout.tsx when
// a CRM session is present.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { TeamRole } from "@/lib/crm/types";
import { ROLE_LABEL } from "@/lib/crm/types";

type NavItem = { href: string; label: string; roles: readonly TeamRole[] };

const NAV: readonly NavItem[] = [
  { href: "/crm/dashboard", label: "Dashboard",       roles: ["ceo"] },
  { href: "/crm/leads",     label: "Leads",           roles: ["ceo", "lead_qualifier", "platform_ops"] },
  { href: "/crm/pipeline",  label: "Pipeline",        roles: ["ceo", "platform_ops"] },
  { href: "/crm/buyers",    label: "Buyer pipeline",  roles: ["ceo", "bdr", "platform_ops"] },
  { href: "/crm/admin/verifications", label: "Verifications", roles: ["ceo", "platform_ops"] },
  { href: "/crm/inbox",     label: "Inbox",           roles: ["ceo", "lead_qualifier", "community_outreach", "content_seo", "bdr", "platform_ops"] },
  { href: "/crm/outreach",  label: "Outreach log",    roles: ["ceo", "community_outreach"] },
  { href: "/crm/content",   label: "Content queue",   roles: ["ceo", "content_seo"] },
  { href: "/crm/hr",        label: "Team performance",roles: ["ceo", "hr"] },
  { href: "/crm/invoices",  label: "Invoices",         roles: ["ceo", "lead_qualifier", "community_outreach", "content_seo", "bdr", "platform_ops", "hr"] },
  { href: "/crm/reports",   label: "Reports",         roles: ["ceo"] },
  { href: "/crm/admin/team",label: "Team members",    roles: ["ceo"] },
] as const;

export function CrmShell({ role, children }: { role: TeamRole; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => NAV.filter((n) => n.roles.includes(role)), [role]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className={`bg-[#0A2818] text-white w-full md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 ${open ? "block" : "hidden md:block"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link href="/crm/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight text-lg">
            <Image src="/logo-icon.png" alt="" width={24} height={24} className="h-6 w-auto" />
            <span className="text-[#D9FF4E]">NW</span>
            <span className="text-white">CRM</span>
          </Link>
          <button
            type="button"
            className="md:hidden text-[#D9FF4E] text-sm"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle nav"
          >
            Close
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          {visible.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={[
                  "block rounded-lg px-3 py-2",
                  active
                    ? "bg-[#D9FF4E] text-[#0A2818] font-bold"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t border-white/10 text-xs text-white/60">
          <p className="font-semibold text-white/90">Signed in as</p>
          <p>{ROLE_LABEL[role]}</p>
          <form action="/api/crm/auth/logout" method="post" className="mt-3">
            <button className="text-[#D9FF4E] underline-offset-2 hover:underline" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 md:pl-64">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-white md:hidden">
          <Link href="/crm/dashboard" className="font-extrabold text-[#0A2818]">NewWheels CRM</Link>
          <button
            type="button"
            className="rounded-lg border border-[#0A2818] px-3 py-1 text-sm font-semibold text-[#0A2818]"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
