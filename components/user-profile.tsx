"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { clientDb } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MapPin, Link2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { logActivity } from "@/lib/activity-logger"

interface UserProfileProps {
  userId: string
  isCurrentUser: boolean
}

export function UserProfile({ userId, isCurrentUser }: UserProfileProps) {
  const [userData, setUserData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [postCount, setPostCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) throw profileError

        // Get follow status if not current user
        if (!isCurrentUser) {
          const { data: currentUser } = await supabase.auth.getUser()
          if (currentUser?.user) {
            const isFollowing = await clientDb.isFollowing(currentUser.user.id, userId)
            setIsFollowing(Boolean(isFollowing))
          }
        }

        // Get follow counts
        const counts = await clientDb.getFollowCounts(userId)
        setFollowCounts({
          followers: (counts as any)?.followers ?? 0,
          following: (counts as any)?.following ?? 0,
        })

        // Get post count
        const { count: postCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        setPostCount(postCount || 0)

        setUserData(profile)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userId, isCurrentUser])

  const handleFollow = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser?.user) return

      const newFollowStatus = await clientDb.followUser(currentUser.user.id, userId)
      setIsFollowing(newFollowStatus)

      // Update follower count
      setFollowCounts((prev) => ({
        ...prev,
        followers: newFollowStatus ? prev.followers + 1 : prev.followers - 1,
      }))

      // Log the activity if user is following (not unfollowing)
      if (newFollowStatus) {
        await logActivity({
          userId: currentUser.user.id,
          action: "user_follow",
          entityType: "user",
          entityId: userId,
          metadata: {
            target_name: userData?.full_name || userData?.username || "User",
          },
        })
      }
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  if (loading) {
    return (
      <Card className="mb-6 overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="pt-0">
          <div className="flex flex-col items-center -mt-12 relative">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="mt-4 text-center space-y-2">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-16 w-full mx-auto" />
              <div className="flex justify-center gap-4 mt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userData) return null

  const joinedDate = userData.created_at ? format(new Date(userData.created_at), "MMMM yyyy") : "Unknown"

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="h-48 w-full relative bg-gradient-to-r from-primary/20 to-primary/10">
        {userData.cover_image && (
          <Image src={userData.cover_image || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
        )}
      </div>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 relative">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
              <AvatarFallback>{userData.full_name?.charAt(0) || userData.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="mt-4 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userData.full_name}</h1>
              <p className="text-muted-foreground">@{userData.username}</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            {isCurrentUser ? (
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button variant={isFollowing ? "outline" : "default"} onClick={handleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {userData.bio && <p>{userData.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {userData.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{userData.location}</span>
              </div>
            )}
            {userData.website && (
              <div className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                <a
                  href={userData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {userData.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-bold">{followCounts.following}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold">{followCounts.followers}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold">{postCount}</span>
              <span className="text-muted-foreground ml-1">Posts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
