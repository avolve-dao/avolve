"use server"

import { createClient } from "@/lib/supabase/server"
import { serverAction } from "@/lib/server-action"
import { z } from "zod"

// Define validation schema
const invitationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().min(10, "Please provide a more detailed reason"),
  referralCode: z.string().optional().nullable(),
})

// Define the raw action function
async function submitInvitationRequestRaw(data: z.infer<typeof invitationSchema>) {
  const supabase = await createClient()

  // Check if email already has a pending request
  const { data: existingRequest } = await supabase
    .from("invitation_requests")
    .select("id, status")
    .eq("email", data.email)
    .single()

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      throw new Error("You already have a pending invitation request.")
    } else if (existingRequest.status === "approved") {
      throw new Error("You have already been approved. Please check your email.")
    } else if (existingRequest.status === "rejected") {
      // Update the existing rejected request with new information
      const { error } = await supabase
        .from("invitation_requests")
        .update({
          reason: data.reason,
          referral_code: data.referralCode,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .eq("id", existingRequest.id)

      if (error) throw error

      return { message: "Your invitation request has been resubmitted." }
    }
  }

  // Create new invitation request
  const { error } = await supabase.from("invitation_requests").insert([
    {
      email: data.email,
      reason: data.reason,
      referral_code: data.referralCode,
    },
  ])

  if (error) throw error

  return { message: "Your invitation request has been submitted successfully." }
}

// Create the wrapped server action
export const submitInvitationRequest = serverAction(submitInvitationRequestRaw, invitationSchema)
