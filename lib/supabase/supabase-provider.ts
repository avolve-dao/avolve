import { createContext, useContext } from 'react'
import { supabase } from './index'

const SupabaseContext = createContext(supabase)

export const useSupabase = () => {
  const supabase = useContext(SupabaseContext)
  if (!supabase) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return { supabase }
}

export default SupabaseContext
