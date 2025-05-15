"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { agreementSchema, type AgreementData } from "@/lib/validations/agreement"
import { sendAgreementConfirmationEmail } from "@/lib/email"
import { serverAction } from "@/lib/server-action"
import { ROUTES, CURRENT_AGREEMENT_VERSION } from "@/constants"

// Define the raw action functions
async function submitAgreementRaw(data: AgreementData) {
  // Validate the agreement data
  const validationResult = agreementSchema.safeParse(data)

  if (!validationResult.success) {
    throw new Error(validationResult.error.message)
  }

  const validatedData = validationResult.data
  const supabase = createClient()

  // Get user email for confirmation
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(validatedData.userId)

  if (userError) {
    console.error("Error getting user data:", userError)
    throw new Error("Failed to verify user identity")
  }

  // Update user profile with agreement information
  const { error } = await supabase.from("profiles").upsert({
    id: validatedData.userId,
    has_agreed_to_terms: true,
    agreement_date: validatedData.agreementDate,
    agreement_version: validatedData.agreementVersion,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error saving agreement to profile:", error)
    throw new Error("Failed to save agreement information")
  }

  // Store detailed agreement data in a separate table
  const { error: detailError } = await supabase.from("user_agreements").insert({
    user_id: validatedData.userId,
    agreement_version: validatedData.agreementVersion,
    agreement_date: validatedData.agreementDate,
    agreement_data: validatedData.agreements,
  })

  if (detailError) {
    console.error("Error saving detailed agreement data:", detailError)
    // We don't fail the whole operation if this fails, as the profile update is the critical part
  }

  // Send confirmation email
  if (userData?.user?.email) {
    try {
      await sendAgreementConfirmationEmail({
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name || userData.user.email,
        agreementVersion: validatedData.agreementVersion,
        agreementDate: validatedData.agreementDate,
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't fail the operation if email sending fails
    }
  }

  // Log the agreement acceptance for analytics
  console.log(`User ${validatedData.userId} accepted agreement version ${validatedData.agreementVersion}`)

  // Revalidate relevant paths
  revalidatePath("/agreement")
  revalidatePath(ROUTES.UNLOCK.GENIUS_ID)
  revalidatePath("/profile")
  revalidatePath(ROUTES.DASHBOARD)

  return { message: "Agreement submitted successfully" }
}

async function hasAgreedToTermsRaw(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("has_agreed_to_terms, agreement_version, agreement_date")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error checking agreement status:", error)
    throw new Error("Failed to check agreement status")
  }

  return {
    hasAgreed: data?.has_agreed_to_terms || false,
    version: data?.agreement_version,
    date: data?.agreement_date,
  }
}

async function checkAgreementVersionRaw(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("agreement_version").eq("id", userId).single()

  if (error) {
    console.error("Error checking agreement version:", error)
    throw new Error("Failed to check agreement version")
  }

  // If the user has no agreement version or it's different from the current version,
  // they need to accept the new agreement
  const needsUpdate = !data?.agreement_version || data.agreement_version !== CURRENT_AGREEMENT_VERSION

  return {
    needsUpdate,
    currentVersion: data?.agreement_version,
  }
}

// Create the wrapped server actions
export const submitAgreement = serverAction(submitAgreementRaw)
export const hasAgreedToTerms = serverAction(hasAgreedToTermsRaw)
export const checkAgreementVersion = serverAction(checkAgreementVersionRaw)
