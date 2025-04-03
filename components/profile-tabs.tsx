"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostFeed } from "@/components/post-feed"
import { MediaGrid } from "@/components/media-grid"
import { LikedPosts } from "@/components/liked-posts"

interface ProfileTabsProps {
  userId: string
  isCurrentUser: boolean
}

export function ProfileTabs({ userId, isCurrentUser }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-6">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        {isCurrentUser ? (
          <TabsTrigger value="liked">Liked</TabsTrigger>
        ) : (
          <TabsTrigger value="about">About</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="posts">
        <PostFeed userId={userId} />
      </TabsContent>
      <TabsContent value="media">
        <MediaGrid userId={userId} />
      </TabsContent>
      {isCurrentUser ? (
        <TabsContent value="liked">
          <LikedPosts userId={userId} />
        </TabsContent>
      ) : (
        <TabsContent value="about">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">About this user</h3>
            <p className="text-muted-foreground mt-2">This section will contain more information about the user.</p>
          </div>
        </TabsContent>
      )}
    </Tabs>
  )
}

