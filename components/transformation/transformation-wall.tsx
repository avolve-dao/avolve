"use client"

import { useState, useEffect } from "react"
import type { Database } from '@/lib/types/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
import type { JourneyPost, JourneyFocus } from "@/types/journey"
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
  // Use a typed Supabase client for type safety
  const supabase: SupabaseClient<Database> = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [posts, setPosts] = useState<JourneyPost[]>([])
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
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === "INSERT") {
            setPosts((current) => [payload.new, ...current])
          } else if (payload.eventType === "UPDATE") {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? payload.new : post
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
    const { data, error } = await supabase
      .from('journey_posts')
      .select('*')
      .eq('journey_type', journeyType)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast.error('Failed to load posts');
      return;
    }
    // Type guard: ensure only objects with required JourneyPost fields are included
    setPosts(
      (data ?? []).filter((p): p is JourneyPost =>
        p && typeof p === 'object' && 'id' in p && 'user_id' in p && 'content' in p && 'journey_type' in p && 'journey_focus' in p
      )
    );
  }

  const handlePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('You must be logged in to post.');
        setIsPosting(false);
        return;
      }
      const { error } = await supabase.from('journey_posts').insert([
        {
          user_id: user.id,
          content: newPost,
          journey_type: journeyType,
          journey_focus: journeyFocus,
        },
      ]);
      if (error) {
        toast.error('Failed to post');
        setIsPosting(false);
        return;
      }
      setNewPost("");
      setIsPosting(false);
    } catch (error) {
      toast.error('Unexpected error posting');
      setIsPosting(false);
    }
  }

  const handleLike = async (postId: string) => {
    // Removed implementation
  }

  const toggleComments = (postId: string) => {
    setShowComments(current => ({
      ...current,
      [postId]: !current[postId]
    }))
  }

  const handleShare = async (postId: string) => {
    // Removed implementation
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
                  <Progress value={100} max={100} className="h-2" />
                  <span>100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Regen Score:</span>
                  <Progress 
                    value={100} 
                    max={100} 
                    className={cn("h-2", `bg-gradient-to-r ${theme.gradient}`)} 
                  />
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <span className="text-muted-foreground text-xs">Interactions coming soon...</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
