import { SignUpForm } from "@/components/sign-up-form"
import { getCurrentUserWithCsrf } from "@/lib/csrf"
import { FreeMembershipBanner } from "@/components/free-membership-banner"

export default async function Page() {
  // Get CSRF token
  const { csrfToken } = await getCurrentUserWithCsrf()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FreeMembershipBanner />
        <SignUpForm csrfToken={csrfToken} />
      </div>
    </div>
  )
}
