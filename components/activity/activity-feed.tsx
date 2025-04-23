"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { ActivityItem } from "@/components/activity/activity-item"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { getActivityFeed, getUserActivity, getGlobalActivityFeed } from "@/lib/activity-logger"
import type { Database } from '@/lib/database.types';
import type { ActivityAction } from '@/lib/activity-logger';

interface ActivityFeedProps {
  userId?: string
  type: "user" | "following" | "global"
  initialActivities?: Database['public']['Tables']['user_activity_log']['Row'][]
}

function isActivity(obj: Record<string, unknown>): obj is Database['public']['Tables']['user_activity_log']['Row'] {
  return (
    obj && typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.activity_type === 'string' &&
    typeof obj.entity_type === 'string' &&
    typeof obj.created_at === 'string'
  );
}

function mapToActivityItem(activity: unknown): Database['public']['Tables']['user_activity_log']['Row'] {
  const record = activity as Record<string, unknown>;
  if (!isActivity(record)) {
    throw new Error('Invalid activity object');
  }
  return record as Database['public']['Tables']['user_activity_log']['Row'];
}

// Map raw user_activity_log row to the richer ActivityItem shape
function mapUserActivityLogToActivityItem(
  activity: Database['public']['Tables']['user_activity_log']['Row']
): {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  action_type: ActivityAction;
  entity_type: string;
  entity_id: string;
  metadata: { [key: string]: string | number | boolean | null | undefined };
  created_at: string;
} {
  // You may want to enhance this with real user lookups, avatars, etc.
  // For now, use placeholders or data from the `activity_data` field if present
  const meta = (activity.activity_data && typeof activity.activity_data === 'object' && !Array.isArray(activity.activity_data))
    ? activity.activity_data as Record<string, any>
    : {};
  return {
    id: activity.id,
    user_id: activity.user_id,
    user_name: meta.user_name ?? '',
    user_avatar: meta.user_avatar ?? null,
    action_type: (activity.activity_type as ActivityAction) ?? 'user_join',
    entity_type: meta.entity_type ?? '',
    entity_id: meta.entity_id ?? '',
    metadata: meta.metadata ?? {},
    created_at: activity.created_at,
  };
}

export function ActivityFeed({ userId, type, initialActivities = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Database['public']['Tables']['user_activity_log']['Row'][]>(initialActivities)
  const [loading, setLoading] = useState(!initialActivities.length)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialActivities.length ? 1 : 0)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView()

  const loadActivities = useCallback(async (reset: boolean = false) => {
    if (!hasMore && !reset) return

    try {
      setLoading(true)
      setError(null)

      const pageToLoad = reset ? 0 : page
      let data: Database['public']['Tables']['user_activity_log']['Row'][] = []

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
  }, [hasMore, page, type, userId])

  // Load more activities when scrolling to the bottom
  useEffect(() => {
    if (inView && !loading) {
      loadActivities()
    }
  }, [inView, loading, loadActivities])

  // Initial load if no activities were provided
  useEffect(() => {
    if (initialActivities.length === 0) {
      loadActivities()
    }
  }, [initialActivities, loadActivities])

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
      {activities.map((activity) => {
        // Map the raw log row to the rich ActivityItem shape
        const mapped = mapUserActivityLogToActivityItem(activity);
        return (
          <ActivityItem
            key={mapped.id}
            activity={mapped}
          />
        );
      })}

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
