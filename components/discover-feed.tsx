"use client"

import { useState, useEffect } from "react"
import { Post } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "react-intersection-observer"

interface DiscoverFeedProps {
  type: "for-you" | "trending" | "latest"
  userId?: string
}

// Mock posts - in a real app, these would come from Supabase
const mockPosts = [
  {
    id: "d1",
    content: "Just discovered this amazing AI tool that helps with creative writing. Game changer! #AI #writing",
    media: ["/placeholder.svg?height=400&width=600"],
    createdAt: new Date().toISOString(),
    user: {
      id: "user5",
      name: "Tech Enthusiast",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    likeCount: 128,
    commentCount: 32,
    liked: false,
  },
  {
    id: "d2",
    content:
      "The future of sustainable energy is here. Check out this breakthrough in solar technology! #sustainability #tech",
    media: ["/placeholder.svg?height=400&width=600"],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: "user6",
      name: "Green Future",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    likeCount: 256,
    commentCount: 48,
    liked: true,
  },
  {
    id: "d3",
    content: "Just hiked to the top of Mount Rainier! The view was absolutely breathtaking. #adventure #hiking #nature",
    media: ["/placeholder.svg?height=400&width=600"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: "user7",
      name: "Adventure Seeker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    likeCount: 89,
    commentCount: 15,
    liked: false,
  },
]

// Different mock posts for each feed type
const mockTrendingPosts = mockPosts.map((post) => ({
  ...post,
  id: `trending-${post.id}`,
  likeCount: post.likeCount * 2,
  commentCount: post.commentCount * 2,
}))

const mockLatestPosts = mockPosts.map((post) => ({
  ...post,
  id: `latest-${post.id}`,
  createdAt: new Date().toISOString(),
  content: `[NEW] ${post.content}`,
}))

export function DiscoverFeed({ type, userId }: DiscoverFeedProps) {
  const [posts, setPosts] = useState<typeof mockPosts>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView()

  // Load different posts based on feed type
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      if (type === "trending") {
        setPosts(mockTrendingPosts)
      } else if (type === "latest") {
        setPosts(mockLatestPosts)
      } else {
        setPosts(mockPosts)
      }
      setLoading(false)
    }, 1000)
  }, [type])

  // Simulate loading more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore) {
      setTimeout(() => {
        let newPosts
        if (type === "trending") {
          newPosts = mockTrendingPosts
        } else if (type === "latest") {
          newPosts = mockLatestPosts
        } else {
          newPosts = mockPosts
        }

        setPosts((prevPosts) => [
          ...prevPosts,
          ...newPosts.map((post) => ({
            ...post,
            id: `${post.id}-${page}`,
            content: `${post.content} (Page ${page})`,
          })),
        ])
        setPage((prevPage) => prevPage + 1)

        // Stop infinite loading after 3 pages for this demo
        if (page >= 3) {
          setHasMore(false)
        }
      }, 1500)
    }
  }, [inView, page, hasMore, type])

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post,
      ),
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} currentUserId={userId} onLike={handleLike} />
      ))}

      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  )
}

