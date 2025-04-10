"use client"

import { LockKeyhole, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTracking } from "@/utils/tracking"

interface MentorshipTeaserProps {
  userId: string
}

export function MentorshipTeaser({ userId }: MentorshipTeaserProps) {
  const tracking = useTracking(userId)
  
  const handleTeaserClick = () => {
    // Track the interaction with the locked feature
    tracking.trackFeature('mentorship_teaser', 'page_view')
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/50 opacity-50 transition-all duration-300 hover:opacity-60">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Mentorship Program
          </CardTitle>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
            <LockKeyhole className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect with experienced mentors in the Avolve ecosystem to accelerate your journey and unlock new opportunities.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/50 p-3 rounded-md">
              <h4 className="text-sm font-medium">Personalized Guidance</h4>
              <p className="text-xs text-muted-foreground mt-1">1:1 sessions with experts</p>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-md">
              <h4 className="text-sm font-medium">Skill Development</h4>
              <p className="text-xs text-muted-foreground mt-1">Tailored learning paths</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Unlock Requirements:</span>
            <span className="font-medium">Regen Score 75+</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleTeaserClick}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-sm">
        <div className="bg-black/60 px-4 py-2 rounded-full flex items-center">
          <LockKeyhole className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Unlock Soon</span>
        </div>
      </div>
    </Card>
  )
}
