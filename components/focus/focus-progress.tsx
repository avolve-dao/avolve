"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"

interface FocusProgressProps {
  userId: string
  focusArea: string
}

export function FocusProgress({ userId, focusArea }: FocusProgressProps) {
  const supabase = createClient()

  const { data: progress } = useQuery({
    queryKey: ["focus-progress", userId, focusArea],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("zinc_gradient")
        .eq("id", userId)
        .single()

      if (error) throw error
      return data?.zinc_gradient || 0
    },
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Focus Progress</span>
        <span className="text-sm text-zinc-500">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
