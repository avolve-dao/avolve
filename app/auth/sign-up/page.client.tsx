'use client';

import { SignUpForm } from "@/components/sign-up-form"
import { FreeMembershipBanner } from "@/components/free-membership-banner"

interface SignUpClientPageProps {
  csrfToken?: string;
}

export default function SignUpClientPage({ csrfToken }: SignUpClientPageProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FreeMembershipBanner />
        <SignUpForm csrfToken={csrfToken} />
      </div>
    </div>
  )
}
