import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostFeed } from "@/components/post-feed"
import { SuggestedUsers } from "@/components/suggested-users"
import { TrendingTopics } from "@/components/trending-topics"
import { StoryBar } from "@/components/story-bar"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // We'll let the client components fetch their own data
  // This avoids server-side errors that might prevent the page from rendering

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - Post feed */}
        <div className="md:col-span-2 space-y-6">
          <StoryBar />
          <PostFeed userId={userData.user.id} initialPosts={[]} />
        </div>

        {/* Sidebar */}
        <div className="hidden md:block space-y-6">
          <SuggestedUsers suggestedUsers={[]} currentUserId={userData.user.id} />
          <TrendingTopics />
        </div>
      </div>
    </div>
  )
}

