"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { ActivityItem } from "@/components/activity/activity-item"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { getActivityFeed, getUserActivity, getGlobalActivityFeed } from "@/lib/activity-logger"

interface ActivityFeedProps {
  userId?: string
  type: "user" | "following" | "global"
  initialActivities?: Activity[]
}

interface Activity {
  id: string
  // Add other activity properties here
}

function mapToActivityItem(activity: any): any {
  return {
    id: activity.id ?? '',
    user_id: activity.user_id ?? '',
    user_name: activity.user_name ?? '',
    user_avatar: activity.user_avatar ?? null,
    action_type: activity.action_type ?? 'unknown',
    entity_type: activity.entity_type ?? '',
    entity_id: activity.entity_id ?? '',
    metadata: activity.metadata ?? {},
    created_at: activity.created_at ?? '',
  };
}

export function ActivityFeed({ userId, type, initialActivities = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [loading, setLoading] = useState(!initialActivities.length)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialActivities.length ? 1 : 0)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView()

  const loadActivities = async (reset = false) => {
    if (!hasMore && !reset) return

    try {
      setLoading(true)
      setError(null)

      const pageToLoad = reset ? 0 : page
      let data: Activity[] = []

      if (type === "user" && userId) {
        data = await getUserActivity(userId, 10, pageToLoad)
      } else if (type === "following" && userId) {
        data = await getActivityFeed(userId, 10, pageToLoad)
      } else {
        data = await getGlobalActivityFeed(10, pageToLoad)
      }

      if (data.length === 0) {
        setHasMore(false)
      } else {
        setActivities((prev) => (reset ? data : [...prev, ...data]))
        setPage((prev) => (reset ? 1 : prev + 1))
        setHasMore(data.length === 10)
      }
    } catch (error) {
      console.error("Error loading activities:", error)
      setError("Failed to load activities. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load more activities when scrolling to the bottom
  useEffect(() => {
    if (inView && !loading) {
      loadActivities()
    }
  }, [inView, loading])

  // Initial load if no activities were provided
  useEffect(() => {
    if (initialActivities.length === 0) {
      loadActivities()
    }
  }, [initialActivities])

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => loadActivities(true)} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (activities.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No activities found</p>
        {type === "following" && (
          <p className="text-sm text-muted-foreground mt-2">Follow more users to see their activities in your feed</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={mapToActivityItem(activity)}
        />
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
