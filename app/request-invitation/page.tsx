import { InvitationRequestForm } from "@/components/invitation-request-form"

export default function RequestInvitationPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Join the Supercivilization</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        The Supercivilization is an exclusive community of value creators committed to Regen principles. Request an
        invitation to begin your journey from Degen to Regen.
      </p>
      <InvitationRequestForm />
    </div>
  )
}
