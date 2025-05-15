"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { unlockGeniusId } from "@/app/actions/genius-id-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ROUTES } from "@/constants"

const formSchema = z.object({
  personalGoal: z.string().min(10, "Personal goal must be at least 10 characters"),
  professionalGoal: z.string().min(10, "Professional goal must be at least 10 characters"),
  supermindGoal: z.string().min(10, "Supermind goal must be at least 10 characters"),
})

type FormValues = z.infer<typeof formSchema>

export function GeniusIdUnlockForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalGoal: "",
      professionalGoal: "",
      supermindGoal: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("personalGoal", values.personalGoal)
      formData.append("professionalGoal", values.professionalGoal)
      formData.append("supermindGoal", values.supermindGoal)

      const result = await unlockGeniusId(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to unlock Genius ID")
      }

      setSuccess("Genius ID unlocked successfully!")

      // Redirect after a short delay
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD)
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Unlock Your Genius ID</CardTitle>
        <CardDescription>
          Your Genius ID is your unique identifier in the Supercivilization. It represents your journey from Degen to
          Regen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="personalGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Goal</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is your primary personal goal for the next year?" {...field} rows={3} />
                  </FormControl>
                  <FormDescription>This helps align your Genius ID with your personal aspirations.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professionalGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is your primary professional goal for the next year?"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>This helps align your Genius ID with your professional aspirations.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supermindGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supermind Goal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How do you want to develop your thinking capabilities?"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps align your Genius ID with your cognitive development aspirations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Unlocking..." : "Unlock Genius ID"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Your Genius ID is the first step in your journey from Degen to Regen.
        </p>
      </CardFooter>
    </Card>
  )
}
