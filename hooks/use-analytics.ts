"use client"

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '@/lib/analytics/analytics-service'
import { useSupabase } from '@/components/supabase/provider'

/**
 * Hook for interacting with the Avolve platform's analytics and real-time features.
 * Provides methods for logging activities, subscribing to real-time updates,
 * and fetching analytics data.
 */
export function useAnalytics() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userPosition, setUserPosition] = useState<any>(null)
  const [journeyAnalytics, setJourneyAnalytics] = useState<any[]>([])
  const [communityInsights, setCommunityInsights] = useState<any[]>([])
  const [tesla369Streak, setTesla369Streak] = useState<any>(null)
  const [immersionInsights, setImmersionInsights] = useState<any>(null)

  // Log a user activity
  const logActivity = useCallback(
    async (
      actionType: string,
      details: Record<string, any> = {},
      immersionLevel: number = 1,
      useQueue: boolean = true
    ) => {
      return analyticsService.logActivity(actionType, details, immersionLevel, useQueue)
    },
    []
  )

  // Subscribe to real-time event updates
  const subscribeToEventUpdates = useCallback(
    (callback: (payload: any) => void) => {
      return analyticsService.subscribeToEventUpdates(callback)
    },
    []
  )

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (
      journeyType?: string,
      tokenType?: string,
      timePeriod: '7days' | '30days' | '90days' | 'alltime' = '30days',
      limit: number = 10
    ) => {
      setIsLoading(true)
      try {
        const data = await analyticsService.getLeaderboard(journeyType, tokenType, timePeriod, limit)
        if (data) {
          setLeaderboard(data)
        }
        return data
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Fetch user's leaderboard position
  const fetchUserPosition = useCallback(
    async (
      journeyType?: string,
      tokenType?: string,
      timePeriod: '7days' | '30days' | '90days' | 'alltime' = '30days'
    ) => {
      setIsLoading(true)
      try {
        const data = await analyticsService.getUserLeaderboardPosition(
          journeyType,
          tokenType,
          timePeriod
        )
        if (data) {
          setUserPosition(data)
        }
        return data
      } catch (error) {
        console.error('Error fetching user position:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Fetch journey analytics data
  const fetchJourneyAnalytics = useCallback(async (journeyType?: string, tokenType?: string) => {
    setIsLoading(true)
    try {
      const data = await analyticsService.getJourneyAnalytics(journeyType, tokenType)
      if (data) {
        setJourneyAnalytics(data)
      }
      return data
    } catch (error) {
      console.error('Error fetching journey analytics:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch community insights data
  const fetchCommunityInsights = useCallback(async (tokenType?: string) => {
    setIsLoading(true)
    try {
      const data = await analyticsService.getCommunityInsights(tokenType)
      if (data) {
        setCommunityInsights(data)
      }
      return data
    } catch (error) {
      console.error('Error fetching community insights:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch Tesla 3-6-9 streak data
  const fetchTesla369Streak = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await analyticsService.getTesla369Streak()
      if (data) {
        setTesla369Streak(data)
      }
      return data
    } catch (error) {
      console.error('Error fetching Tesla 3-6-9 streak:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch immersion insights data
  const fetchImmersionInsights = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await analyticsService.getImmersionInsights()
      if (data) {
        setImmersionInsights(data)
      }
      return data
    } catch (error) {
      console.error('Error fetching immersion insights:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    leaderboard,
    userPosition,
    journeyAnalytics,
    communityInsights,
    tesla369Streak,
    immersionInsights,
    logActivity,
    subscribeToEventUpdates,
    fetchLeaderboard,
    fetchUserPosition,
    fetchJourneyAnalytics,
    fetchCommunityInsights,
    fetchTesla369Streak,
    fetchImmersionInsights
  }
}
