import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useRealtimeCelebration(table: string, onCelebrate: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        if (payload.eventType === 'INSERT') {
          onCelebrate(payload)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, onCelebrate])
}
