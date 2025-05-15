import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import TransformationJourneyEmail from "@/emails/transformation-journey"
import { transformationEmailSequence } from "@/lib/email/transformation-email-sequence"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTransformationEmail(
  userId: string,
  step: "welcome" | "genius-id" | "gen-tokens" | "genie-ai" | "complete",
) {
  try {
    const supabase = createClient()

    // Get user email and name
    const { data: user } = await supabase.auth.admin.getUserById(userId)

    if (!user || !user.user.email) {
      throw new Error("User not found or email not available")
    }

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single()

    const username = profile?.full_name || "Regen"

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "noreply@avolve.com",
      to: user.user.email,
      subject: getEmailSubject(step),
      react: TransformationJourneyEmail({
        username,
        step,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        actionUrl: getActionUrl(step),
      }),
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    // Log email sent
    await supabase.from("email_logs").insert({
      user_id: userId,
      email_type: `transformation_${step}`,
      sent_at: new Date().toISOString(),
      status: "sent",
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error sending transformation email:", error)
    return { success: false, error }
  }
}

function getEmailSubject(step: string) {
  const emailConfig = transformationEmailSequence.find((email) => email.id === step)
  return emailConfig?.subject || "Your Transformation Journey"
}

function getActionUrl(step: string) {
  switch (step) {
    case "welcome":
      return `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`
    case "genius-id":
      return `${process.env.NEXT_PUBLIC_APP_URL}/unlock/genius-id`
    case "gen-tokens":
      return `${process.env.NEXT_PUBLIC_APP_URL}/unlock/gen-token`
    case "genie-ai":
      return `${process.env.NEXT_PUBLIC_APP_URL}/unlock/genie-ai`
    case "complete":
      return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    default:
      return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  }
}

export async function scheduleTransformationEmails(userId: string) {
  // This function would be used to schedule the sequence of transformation emails
  // In a real implementation, you would use a job queue or scheduled tasks
  // For now, we'll just send the welcome email
  return sendTransformationEmail(userId, "welcome")
}
