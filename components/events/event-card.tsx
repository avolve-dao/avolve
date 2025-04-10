"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, MapPin, Users, Video } from "lucide-react"
import { formatDistanceToNow, format, isAfter, isBefore } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    organizer_id: string
    start_time: string
    end_time: string
    location?: string
    is_virtual: boolean
    meeting_url?: string
    cover_image_url?: string
    max_participants?: number
    is_published: boolean
    created_at: string
    organizer?: {
      full_name?: string
      avatar_url?: string
    }
  }
  isRegistered?: boolean
  participantCount?: number
  detailed?: boolean
  className?: string
}

export function EventCard({ 
  event, 
  isRegistered = false, 
  participantCount = 0, 
  detailed = false,
  className
}: EventCardProps) {
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const [participants, setParticipants] = useState(participantCount)
  const supabase = createClient()

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const isUpcoming = isAfter(startDate, new Date())
  const isPast = isBefore(endDate, new Date())
  const isOngoing = !isUpcoming && !isPast

  const handleRegister = async () => {
    setRegistering(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to register for events",
          variant: "destructive"
        })
        return
      }
      
      if (registered) {
        // Unregister from event
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          
        if (error) throw error
        
        setRegistered(false)
        setParticipants(prev => prev - 1)
        
        toast({
          title: "Unregistered",
          description: "You have been removed from this event"
        })
      } else {
        // Register for event
        if (event.max_participants && participants >= event.max_participants) {
          toast({
            title: "Event is full",
            description: "This event has reached its maximum number of participants",
            variant: "destructive"
          })
          return
        }
        
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: user.id,
            status: 'registered'
          })
          
        if (error) throw error
        
        setRegistered(true)
        setParticipants(prev => prev + 1)
        
        toast({
          title: "Registered",
          description: "You have successfully registered for this event"
        })
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      toast({
        title: "Error",
        description: "There was a problem processing your request",
        variant: "destructive"
      })
    } finally {
      setRegistering(false)
    }
  }

  const getStatusBadge = () => {
    if (isOngoing) {
      return <Badge className="bg-green-500 hover:bg-green-600">Happening Now</Badge>
    } else if (isPast) {
      return <Badge variant="outline" className="text-muted-foreground">Past Event</Badge>
    } else {
      return <Badge variant="secondary">Upcoming</Badge>
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "O"
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      {event.cover_image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={event.cover_image_url} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {format(startDate, 'MMMM d, yyyy')} • {format(startDate, 'h:mm a')}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {detailed ? (
            <p className="text-muted-foreground">{event.description}</p>
          ) : (
            <p className="text-muted-foreground line-clamp-2">{event.description}</p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>
              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              {event.is_virtual ? (
                <Video className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            <span>
              {participants} {participants === 1 ? 'participant' : 'participants'}
              {event.max_participants && ` (max ${event.max_participants})`}
            </span>
          </div>
          
          {detailed && event.organizer && (
            <div className="flex items-center mt-4 pt-4 border-t">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={event.organizer.avatar_url} />
                <AvatarFallback>{getInitials(event.organizer.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Organized by</p>
                <p className="text-sm text-muted-foreground">{event.organizer.full_name || 'Anonymous'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isPast ? (
          <Button variant="outline" className="w-full" disabled>
            Event Ended
          </Button>
        ) : (
          <Button 
            onClick={handleRegister}
            disabled={registering || (event.max_participants !== undefined && participants >= event.max_participants && !registered)}
            variant={registered ? "outline" : "default"}
            className={cn(
              "w-full",
              registered ? "" : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            )}
          >
            {registering ? (
              "Processing..."
            ) : registered ? (
              "Cancel Registration"
            ) : event.max_participants !== undefined && participants >= event.max_participants ? (
              "Event Full"
            ) : (
              "Register for Event"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
