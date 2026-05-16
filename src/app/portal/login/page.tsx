// /portal/login — buyer-side passwordless login.

import Link from "next/link";
import { LoginForm } from "@/components/crm/LoginForm";

export const metadata = { title: "Sign in — NewWheels Buyer Portal" };

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7F4] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-[#E5E7EB]">
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#0A2818]">New</span>
            <span className="text-[#D9FF4E] bg-[#0A2818] px-1 rounded">Wheels</span>
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-[#0A2818] text-center mb-1">Buyer sign-in</h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          Enter your account email to receive a 6-digit code.
        </p>
        <LoginForm audience="portal" />
        <p className="text-center text-sm text-[#0A2818] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/portal/signup" className="font-bold underline">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
