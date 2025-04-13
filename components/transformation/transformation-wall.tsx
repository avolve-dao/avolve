"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageSquare, Share2, Award, Sparkles, Brain, Users, Home, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { TokenType } from "@/types/journey"
import { toast } from "sonner"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { journeyThemes, type JourneyTheme } from "@/lib/styles/journey-themes"
import type { JourneyPost, JourneyFocus, PostWithInteractions } from "@/types/journey"
import type { ReactElement } from "react"

interface TransformationWallProps {
  journeyType: JourneyTheme
  className?: string
}

const FOCUS_ICONS: Record<JourneyFocus, ReactElement> = {
  personal: <Home className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  supermind: <Brain className="h-4 w-4" />
}

export function TransformationWall({ journeyType, className }: TransformationWallProps) {
  const { supabase } = useSupabase()
  const [posts, setPosts] = useState<PostWithInteractions[]>([])
  const [newPost, setNewPost] = useState("")
  const [tokenFee, setTokenFee] = useState(1)
  const [journeyFocus, setJourneyFocus] = useState<JourneyFocus>("personal")
  const [isPosting, setIsPosting] = useState(false)
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})

  const theme = journeyThemes[journeyType]

  useEffect(() => {
    fetchPosts()
    const channel = supabase
      .channel("transformation_posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journey_posts",
          filter: `journey_type=eq.${journeyType}`,
        },
        async (payload: RealtimePostgresChangesPayload<JourneyPost>) => {
          if (payload.eventType === "INSERT") {
            const { data: postWithInteractions } = await supabase.rpc(
              'get_post_with_interactions',
              { post_id: payload.new.id }
            )
            setPosts((current) => [postWithInteractions, ...current])
          } else if (payload.eventType === "UPDATE") {
            const { data: postWithInteractions } = await supabase.rpc(
              'get_post_with_interactions',
              { post_id: payload.new.id }
            )
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? postWithInteractions : post
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, journeyType])

  const fetchPosts = async () => {
    const { data: posts, error } = await supabase
      .from("journey_posts")
      .select(
        `
        *,
        user:user_id (
          name,
          avatar_url,
          regen_level
        )
      `
      )
      .eq("journey_type", journeyType)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      toast.error("Failed to load posts")
      return
    }

    // Get interactions for each post
    const postsWithInteractions = await Promise.all(
      (posts as JourneyPost[]).map(async (post) => {
        const { data: postWithInteractions } = await supabase.rpc(
          'get_post_with_interactions',
          { post_id: post.id }
        )
        return postWithInteractions
      })
    )

    setPosts(postsWithInteractions)
  }

  const handlePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    try {
      const { data, error } = await supabase.rpc("create_post_with_token_fee", {
        content: newPost,
        journey_type: journeyType,
        token_fee: tokenFee,
        journey_focus: journeyFocus
      })

      if (error) throw error

      setNewPost("")
      toast.success("Post created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create post. Please try again.")
    } finally {
      setIsPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    try {
      if (post.interactions.user_has_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', post.user_id)
        toast.success("Post unliked")
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: post.user_id })
        toast.success("Post liked")
      }
    } catch (error) {
      toast.error("Failed to update like status")
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments(current => ({
      ...current,
      [postId]: !current[postId]
    }))
  }

  const handleShare = async (postId: string) => {
    try {
      await supabase
        .from('post_shares')
        .insert({ 
          post_id: postId,
          user_id: posts.find(p => p.id === postId)?.user_id,
          share_type: 'social'
        })
      toast.success("Post shared")
    } catch (error) {
      toast.error("Failed to share post")
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Create Post */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Share Your Journey</h3>
          <p className="text-sm text-muted-foreground">
            Share your transformation story and inspire others.
            Cost: {tokenFee} {theme.token}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {Object.entries(FOCUS_ICONS).map(([focus, icon]) => (
              <Button
                key={focus}
                variant={journeyFocus === focus ? "default" : "outline"}
                size="sm"
                onClick={() => setJourneyFocus(focus as JourneyFocus)}
                className={cn(
                  journeyFocus === focus && "bg-gradient-to-r",
                  journeyFocus === focus && theme.gradient
                )}
              >
                {icon}
                <span className="ml-1 capitalize">{focus}</span>
              </Button>
            ))}
          </div>
          <Textarea
            placeholder="What's on your transformation journey?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Token Fee:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={tokenFee}
              onChange={(e) => setTokenFee(parseInt(e.target.value))}
              className="w-24"
            />
            <span>{tokenFee}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={handlePost} 
            disabled={isPosting || !newPost.trim()}
            className={cn("bg-gradient-to-r", theme.gradient)}
          >
            Post ({tokenFee} {theme.token})
          </Button>
        </CardFooter>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className={cn(
              "transform transition-all hover:scale-[1.02]",
              `bg-gradient-to-r ${theme.gradient}/5`
            )}
          >
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar>
                <AvatarImage src={post.user.avatar_url} />
                <AvatarFallback>
                  {post.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Regen Level {post.user.regen_level}
                    </Badge>
                    {FOCUS_ICONS[post.journey_focus]}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-pretty">{post.content}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Engagement:</span>
                  <Progress value={post.engagement_score} max={100} className="h-2" />
                  <span>{post.engagement_score}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Regen Score:</span>
                  <Progress 
                    value={post.regen_score} 
                    max={100} 
                    className={cn("h-2", `bg-gradient-to-r ${theme.gradient}`)} 
                  />
                  <span>{post.regen_score}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <Button 
                  variant={post.interactions.user_has_liked ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    post.interactions.user_has_liked && "bg-gradient-to-r",
                    post.interactions.user_has_liked && theme.gradient
                  )}
                >
                  <Heart className="mr-1 h-4 w-4" />
                  {post.interactions.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {post.interactions.comments}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleShare(post.id)}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  {post.interactions.shares}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {Object.entries(post.token_rewards)
                  .filter(([_, amount]) => amount > 0)
                  .map(([token, amount]) => (
                    <Badge 
                      key={token}
                      className={cn(
                        "bg-gradient-to-r",
                        journeyThemes[token.toLowerCase() as JourneyTheme]?.gradient
                      )}
                    >
                      <Award className="mr-1 h-4 w-4" />
                      {amount} {token}
                    </Badge>
                  ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
