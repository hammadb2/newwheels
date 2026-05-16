// /crm/login — passwordless OTP login for the internal team.

import { LoginForm } from "@/components/crm/LoginForm";

export const metadata = { title: "Sign in — NewWheels CRM" };

export default function CrmLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2818] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#0A2818]">New</span>
            <span className="text-[#D9FF4E] bg-[#0A2818] px-1 rounded">Wheels</span>
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-[#0A2818] text-center mb-1">CRM sign-in</h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          Enter your team email to receive a 6-digit code.
        </p>
        <LoginForm audience="crm" />
      </div>
    </div>
  );
}
