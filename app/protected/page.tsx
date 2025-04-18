import { redirect } from "next/navigation"
import { Suspense } from "react"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { OnboardingBanner } from '@/components/onboarding/OnboardingBanner'
import { OnboardingChecklistClient } from '@/components/onboarding/OnboardingChecklistClient'
import { AIInsightsServer } from '@/components/dashboard/ai-insights/server'

// Removed unused imports useState and useTransition

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  // --- Onboarding State Logic ---
  // Fetch or create onboarding state for the user
  const { data: onboardingRow, error: onboardingError } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  let completedSteps: string[] = []
  let onboardingCompleted = false
  if (!onboardingError && onboardingRow) {
    completedSteps = onboardingRow.completed_steps || []
    onboardingCompleted = Boolean(onboardingRow.completed_at)
  }

  // --- Client-side onboarding update logic ---
  // This is a hybrid server/client page. For Next.js App Router, consider moving onboarding logic to a client component for full interactivity.
  // Here, we show how to pass a handler to the checklist for updating onboarding steps via API route.

  // Placeholder: move this logic to a client component for real interactivity
  // const [steps, setSteps] = useState(completedSteps)
  // const [isPending, startTransition] = useTransition()
  // async function handleOnboardingAction(step: string) {
  //   startTransition(async () => {
  //     const res = await fetch('/api/onboarding/update-step', {
  //       method: 'PATCH',
  //       body: JSON.stringify({ step }),
  //     })
  //     if (res.ok) {
  //       const { completedSteps } = await res.json()
  //       setSteps(completedSteps)
  //     }
  //   })
  // }

  return (
    <div className="flex flex-col items-center w-full gap-6 py-8">
      <p className="text-lg">Hello <span className="font-bold">{data.user.email ?? 'User'}</span></p>
      <LogoutButton />
      {!onboardingCompleted && (
        <>
          <OnboardingBanner userName={data.user.email ?? 'User'} onStart={() => {}} />
          <OnboardingChecklistClient initialCompleted={completedSteps} />
        </>
      )}
      <div className="w-full max-w-2xl">
        <Suspense fallback={<div>Loading insights...</div>}>
          <AIInsightsServer userId={data.user.id} />
        </Suspense>
      </div>
    </div>
  )
}
