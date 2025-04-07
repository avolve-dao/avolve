"use client"

import { PageContainer } from "@/components/page-container"
import { PostFeed } from "@/components/social/post-feed"

export default function PersonalFeedPage() {
  return (
    <PageContainer title="Personal Success Feed" subtitle="Share your journey and connect with others">
      <PostFeed />
    </PageContainer>
  )
}
