"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Mints initial SAP and PSP tokens for a user who has completed onboarding
 * This is called after a user creates their first PSP goal
 */
export async function mintOnboardingTokens() {
  const supabase = await createClient()
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error("User not authenticated")
    }
    
    // Get token IDs for SAP and PSP
    const { data: sapToken, error: sapError } = await supabase
      .from('tokens')
      .select('id')
      .eq('symbol', 'SAP')
      .single()
      
    if (sapError || !sapToken) {
      throw new Error("SAP token not found")
    }
    
    const { data: pspToken, error: pspError } = await supabase
      .from('tokens')
      .select('id')
      .eq('symbol', 'PSP')
      .single()
      
    if (pspError || !pspToken) {
      throw new Error("PSP token not found")
    }
    
    // Call RPC function to mint SAP tokens (25 tokens)
    const { error: sapMintError } = await supabase.rpc(
      'process_token_transaction',
      {
        p_from_user_id: null,
        p_to_user_id: user.id,
        p_token_id: sapToken.id,
        p_amount: 25,
        p_transaction_type: 'MINT'
      }
    )
    
    if (sapMintError) {
      throw new Error(`Error minting SAP tokens: ${sapMintError.message}`)
    }
    
    // Call RPC function to mint PSP tokens (10 tokens)
    const { error: pspMintError } = await supabase.rpc(
      'process_token_transaction',
      {
        p_from_user_id: null,
        p_to_user_id: user.id,
        p_token_id: pspToken.id,
        p_amount: 10,
        p_transaction_type: 'MINT'
      }
    )
    
    if (pspMintError) {
      throw new Error(`Error minting PSP tokens: ${pspMintError.message}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error minting onboarding tokens:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
