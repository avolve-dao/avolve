import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscoverFeed } from "@/components/discover-feed"
import { SearchInput } from "@/components/search-input"
import { TrendingTopics } from "@/components/trending-topics"

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Discover</h1>
        <SearchInput />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="for-you" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="for-you" className="flex-1">
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">
                Trending
              </TabsTrigger>
              <TabsTrigger value="latest" className="flex-1">
                Latest
              </TabsTrigger>
            </TabsList>
            <TabsContent value="for-you">
              <DiscoverFeed type="for-you" userId={data.user.id} />
            </TabsContent>
            <TabsContent value="trending">
              <DiscoverFeed type="trending" userId={data.user.id} />
            </TabsContent>
            <TabsContent value="latest">
              <DiscoverFeed type="latest" userId={data.user.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <TrendingTopics />
        </div>
      </div>
    </div>
  )
}

