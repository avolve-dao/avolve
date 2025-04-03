import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/activity/activity-feed"

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Activity Feed</h1>

      <Tabs defaultValue="following" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="yours">Your Activity</TabsTrigger>
          <TabsTrigger value="all">All Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          <ActivityFeed userId={userData.user.id} type="following" />
        </TabsContent>

        <TabsContent value="yours">
          <ActivityFeed userId={userData.user.id} type="user" />
        </TabsContent>

        <TabsContent value="all">
          <ActivityFeed type="global" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

