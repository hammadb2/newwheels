// /portal/signup — buyer signup form. Handles both dealer master + individual.

import { SignupForm } from "@/components/portal/SignupForm";

export const metadata = { title: "Apply — NewWheels Buyer Portal" };

export default function PortalSignupPage() {
  return (
    <div className="min-h-screen bg-[#F5F7F4] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2818]">Apply to buy NewWheels leads</h1>
          <p className="text-[#6B7280] mt-2">
            Verified Calgary subprime auto leads. We&apos;ll review documents within one business day.
          </p>
        </header>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
