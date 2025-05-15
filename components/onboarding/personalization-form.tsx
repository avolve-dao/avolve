"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useUserPreferences, type UserGoal } from "@/hooks/use-user-preferences"

const formSchema = z.object({
  primaryGoal: z.enum(["personal-growth", "professional-advancement", "community-building", "value-creation"], {
    required_error: "Please select a primary goal.",
  }),
})

interface PersonalizationFormProps {
  onComplete: () => void
}

export function PersonalizationForm({ onComplete }: PersonalizationFormProps) {
  const { updatePreferences } = useUserPreferences()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryGoal: "value-creation",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result = await updatePreferences({
        primaryGoal: values.primaryGoal as UserGoal,
      })

      if (!result.success) {
        throw new Error(result.error as string)
      }

      toast({
        title: "Preferences updated",
        description: "Your journey has been personalized based on your goals.",
      })

      onComplete()
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your preferences could not be saved. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalize Your Journey</CardTitle>
        <CardDescription>
          Tell us about your primary goal so we can tailor your transformation experience.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="primaryGoal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your primary goal for joining the Supercivilization?</FormLabel>
                  <FormDescription>
                    This helps us personalize your transformation journey from Degen to Regen.
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="personal-growth" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Personal Growth - Develop myself as a value creator
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="professional-advancement" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Professional Advancement - Apply value creation to my career
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="community-building" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Community Building - Connect with other value creators
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="value-creation" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Value Creation - Maximize my positive impact on the world
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
