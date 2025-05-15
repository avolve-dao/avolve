import { Resend } from "resend"
import { render } from "@react-email/render"
import WelcomeEmail from "@/emails/welcome-email"
import PasswordResetEmail from "@/emails/password-reset-email"
import AgreementConfirmationEmail from "@/emails/agreement-confirmation"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  try {
    const emailHtml = render(
      WelcomeEmail({
        name,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Avolve <noreply@avolve.com>",
      to: email,
      subject: "Welcome to Avolve",
      html: emailHtml,
    })

    if (error) {
      throw error
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail({
  email,
  resetLink,
}: {
  email: string
  resetLink: string
}) {
  try {
    const emailHtml = render(
      PasswordResetEmail({
        resetLink,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Avolve <noreply@avolve.com>",
      to: email,
      subject: "Reset Your Password",
      html: emailHtml,
    })

    if (error) {
      throw error
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

/**
 * Sends an agreement confirmation email
 */
export async function sendAgreementConfirmationEmail({
  email,
  name,
  agreementVersion,
  agreementDate,
}: {
  email: string
  name: string
  agreementVersion: string
  agreementDate: string
}) {
  try {
    const emailHtml = render(
      AgreementConfirmationEmail({
        name,
        agreementVersion,
        agreementDate,
      }),
    )

    const { data, error } = await resend.emails.send({
      from: "Avolve <noreply@avolve.com>",
      to: email,
      subject: "Supercivilization Compact Acceptance Confirmation",
      html: emailHtml,
    })

    if (error) {
      throw error
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Error sending agreement confirmation email:", error)
    return { success: false, error }
  }
}
