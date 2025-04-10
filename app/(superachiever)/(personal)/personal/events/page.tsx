"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/page-container"
import { EventCard } from "@/components/events/event-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateEventForm } from "@/components/events/create-event-form"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { CalendarPlus, Search } from "lucide-react"
import { isAfter, isBefore } from "date-fns"

interface Event {
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [registrations, setRegistrations] = useState<Record<string, boolean>>({})
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Fetch events with organizer information
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:organizer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('start_time', { ascending: true })

      if (eventsError) throw eventsError
      
      if (eventsData) {
        setEvents(eventsData as Event[])
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Fetch user's registrations
          const { data: registrationsData, error: registrationsError } = await supabase
            .from('event_participants')
            .select('event_id')
            .eq('user_id', user.id)
            
          if (registrationsError) throw registrationsError
          
          if (registrationsData) {
            const registeredMap: Record<string, boolean> = {}
            registrationsData.forEach(reg => {
              registeredMap[reg.event_id] = true
            })
            setRegistrations(registeredMap)
          }
        }
        
        // Fetch participant counts for all events
        const eventIds = eventsData.map(event => event.id)
        if (eventIds.length > 0) {
          // Use a simpler approach to get counts
          const { data: participantsData, error: participantsError } = await supabase
            .from('event_participants')
            .select('event_id')
            .in('event_id', eventIds)
            
          if (!participantsError && participantsData) {
            // Count participants for each event manually
            const countsMap: Record<string, number> = {}
            
            // Initialize all events with 0 participants
            eventIds.forEach(id => {
              countsMap[id] = 0
            })
            
            // Count participants for each event
            participantsData.forEach((item: { event_id: string }) => {
              countsMap[item.event_id] = (countsMap[item.event_id] || 0) + 1
            })
            
            setParticipantCounts(countsMap)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error loading events",
        description: "There was a problem loading the events. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchEvents()
    toast({
      title: "Event created",
      description: "Your event has been successfully created and published."
    })
  }

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const upcomingEvents = filteredEvents.filter(event => 
    isAfter(new Date(event.start_time), new Date())
  )

  const ongoingEvents = filteredEvents.filter(event => 
    isAfter(new Date(), new Date(event.start_time)) && 
    isBefore(new Date(), new Date(event.end_time))
  )

  const pastEvents = filteredEvents.filter(event => 
    isBefore(new Date(event.end_time), new Date())
  )

  return (
    <PageContainer title="Events" subtitle="Connect with the community through in-person and virtual events">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <CreateEventForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Happening Now</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isRegistered={!!registrations[event.id]}
                  participantCount={participantCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-6">Be the first to create an event for the community!</p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ongoing" className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : ongoingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isRegistered={!!registrations[event.id]}
                  participantCount={participantCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No events happening now</h3>
              <p className="text-muted-foreground">Check back later or browse upcoming events</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          ) : pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isRegistered={!!registrations[event.id]}
                  participantCount={participantCounts[event.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No past events</h3>
              <p className="text-muted-foreground">Events will appear here after they've ended</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
