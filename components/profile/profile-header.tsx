"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, UserPlus, UserMinus } from "lucide-react"
import { useState } from "react"
import { clientDb } from "@/lib/db"
import { messagingDb } from "@/lib/db-messaging"
import { useRouter } from "next/navigation"
import { RecognitionForm } from "@/components/recognition"

interface ProfileHeaderProps {
  profile: {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
    bio?: string
    website?: string
    location?: string
  }
  currentUserId?: string
  isFollowing?: boolean
  followCounts: {
    followers: number
    following: number
  }
}

export function ProfileHeader({ profile, currentUserId, isFollowing = false, followCounts }: ProfileHeaderProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFollowToggle = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      const result = await clientDb.followUser(currentUserId, profile.id)
      setFollowing(result)
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!currentUserId) return

    try {
      setLoading(true)
      const chat = await messagingDb.createDirectChat(currentUserId, profile.id)
      router.push(`/messages/${chat.id}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.full_name?.[0] || profile.username[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            {profile.username && profile.full_name && <p className="text-muted-foreground">@{profile.username}</p>}

            {profile.bio && <p className="mt-2">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              {profile.location && <div className="text-sm text-muted-foreground"> {profile.location}</div>}
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <div>
                <span className="font-bold">{followCounts.followers}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div>
                <span className="font-bold">{followCounts.following}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>

            {currentUserId && currentUserId !== profile.id && (
              <div className="mt-6 flex gap-2 flex-col md:flex-row justify-center md:justify-start">
                <div className="flex gap-2">
                  <Button onClick={handleFollowToggle} disabled={loading}>
                    {following ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleMessage} disabled={loading}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
                <div className="mt-4 md:mt-0">
                  <RecognitionForm recipientId={profile.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
