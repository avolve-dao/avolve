import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/server-auth"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer } from "@/components/layout/responsive-container"
import { PageHeader } from "@/components/page-header"
import { GeniusId } from "@/components/genius-id"

// This ensures the page is not statically generated
export const dynamic = "force-dynamic"

async function ProfileContent() {
  // Check authentication
  const session = await requireAuth()
  const supabase = createClient()

  // Fetch profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile not found</CardTitle>
          <CardDescription>We couldn't find your profile. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <ProfileForm profile={profile} />
}

export default function ProfilePage() {
  return (
    <ResponsiveContainer className="py-6">
      <PageHeader title="Profile" description="Manage your personal information and Genius ID" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<ProfileSkeleton />}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileContent />
              </CardContent>
            </Card>
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <Card>
              <CardHeader>
                <CardTitle>Genius ID</CardTitle>
                <CardDescription>Your unique identifier in the Supercivilization</CardDescription>
              </CardHeader>
              <CardContent>
                <GeniusId />
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/2 mx-auto mt-4" />
      </CardContent>
    </Card>
  )
}
