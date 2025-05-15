"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowRight, Lock } from "lucide-react"
import { submitInvitationRequest } from "@/app/actions/invitation-actions"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  reason: z.string().min(50, {
    message: "Please share at least 50 characters about why you want to join.",
  }),
  referralCode: z.string().optional(),
})

export function InvitationRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      reason: "",
      referralCode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("reason", values.reason)
    if (values.referralCode) {
      formData.append("referralCode", values.referralCode)
    }

    const result = await submitInvitationRequest(formData)

    setIsSubmitting(false)

    if (result.success) {
      setIsSubmitted(true)
      toast({
        title: "Request Submitted",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-zinc-500" />
          <CardTitle className="text-2xl">Request Access to the Supercivilization</CardTitle>
        </div>
        <CardDescription>
          The journey from Degen to Regen begins with an invitation. Tell us why you're ready to evolve.
        </CardDescription>
      </CardHeader>

      {!isSubmitted ? (
        <>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormDescription>We'll send your invitation to this address if approved.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to join the Supercivilization?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your journey, values, and why you're ready to evolve from Degen to Regen thinking..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We're looking for value creators committed to regenerative thinking.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter code if you have one" {...field} />
                      </FormControl>
                      <FormDescription>
                        Referrals from existing members increase your chances of approval.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Request Access"}{" "}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      ) : (
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Received</h3>
            <p className="text-muted-foreground mb-6">
              We're reviewing your application to join the Supercivilization. If approved, you'll receive an invitation
              within 48 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              Only those ready to evolve from Degen to Regen will be selected.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
