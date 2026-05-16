// Dealer master onboarding checklist UI (server component).

import Link from "next/link";
import type { OnboardingStep } from "@/lib/crm/onboarding";

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 mb-6">
      <h2 className="font-extrabold text-[#0A2818]">Getting started</h2>
      <p className="text-sm text-[#6B7280] mb-3">Finish setup to unlock the full marketplace.</p>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-4 w-4 rounded-full border"
              style={{
                background: s.done ? "#0A2818" : "transparent",
                borderColor: s.done ? "#0A2818" : "#6B7280",
              }}
            />
            <Link href={s.href} className={s.done ? "text-sm text-[#6B7280] line-through" : "text-sm text-[#0A2818] underline"}>
              {s.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
