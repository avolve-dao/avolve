"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface TodayEventCardProps {
  event: {
    event_id: string
    event_name: string
    event_description: string
    token_type: string
    reward_amount: number
    event_date: string
    participation_count: number
    avg_rating: number
  }
  userId: string
}

export function TodayEventCard({ event, userId }: TodayEventCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const completeSSA = async () => {
    setIsCompleting(true)
    try {
      const supabase = createClient()
      
      // Record the event completion
      const { error } = await supabase
        .from('event_completions')
        .insert({
          user_id: userId,
          event_id: event.event_id,
          reward_amount: event.reward_amount
        })
        
      if (error) throw error
      
      // Show success toast
      toast({
        title: "Event completed!",
        description: `You earned ${event.reward_amount} ${event.token_type} tokens.`,
        variant: "default",
      })
      
      // Refresh the page to update the UI
      router.refresh()
    } catch (error) {
      console.error("Error completing event:", error)
      toast({
        title: "Completion failed",
        description: "There was an error completing this event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }
  
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image 
          src="/images/ssa-event.jpg" 
          alt={event.event_name}
          fill
          priority
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl text-white">{event.event_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-zinc-300">{event.event_description}</p>
        <div className="flex justify-between text-sm text-zinc-400">
          <span>Reward: {event.reward_amount} {event.token_type}</span>
          <span>Participants: {event.participation_count}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={completeSSA}
          disabled={isCompleting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          {isCompleting ? "Completing..." : `Earn ${event.reward_amount} ${event.token_type} Now`}
        </Button>
      </CardFooter>
    </Card>
  )
}
