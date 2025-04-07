'use client';

import { ForgotPasswordForm } from "@/components/forgot-password-form"

interface ForgotPasswordClientPageProps {
  csrfToken?: string;
}

export default function ForgotPasswordClientPage({ csrfToken }: ForgotPasswordClientPageProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm csrfToken={csrfToken} />
      </div>
    </div>
  )
}
