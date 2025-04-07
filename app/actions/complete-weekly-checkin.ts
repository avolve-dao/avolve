"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/lib/database.types"

/**
 * Completes the weekly check-in quest for a user, minting PSP tokens if eligible
 * This calls the database function complete_psp_weekly_checkin
 */
export async function completeWeeklyCheckin() {
  const supabase = await createClient()
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error("User not authenticated")
    }
    
    // Call the RPC function to complete the weekly check-in
    const { data, error } = await supabase.rpc(
      'complete_psp_weekly_checkin',
      { p_user_id: user.id }
    )
    
    if (error) {
      throw new Error(`Error completing weekly check-in: ${error.message}`)
    }
    
    return { 
      success: data, // The function returns true if successful, false if in cooldown
      cooldown: !data // If not successful, it's because of cooldown
    }
  } catch (error) {
    console.error("Error completing weekly check-in:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
