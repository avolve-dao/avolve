import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserProfile } from "@/components/user-profile"
import { ProfileTabs } from "@/components/profile-tabs"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // In a real app, we would fetch the profile data from Supabase
  // For now, we'll use mock data
  const isCurrentUser = params.id === userData.user.id

  return (
    <div className="container py-6">
      <UserProfile userId={params.id} isCurrentUser={isCurrentUser} />
      <ProfileTabs userId={params.id} isCurrentUser={isCurrentUser} />
    </div>
  )
}

