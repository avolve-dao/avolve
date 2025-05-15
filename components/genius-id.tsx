"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }),
  goals: z.string().min(10, {
    message: "Please share at least a brief description of your goals.",
  }),
})

export function GeniusId() {
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [genTokens, setGenTokens] = useState(0)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      goals: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update user profile
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: values.name,
          bio: values.bio,
          goals: values.goals,
          has_genius_id: true,
          gen_tokens: 25, // Initial token award
          updated_at: new Date().toISOString(),
        })

        // Record token transaction
        await supabase.from("token_transactions").insert({
          user_id: user.id,
          amount: 25,
          description: "Completed Genius ID setup",
          token_type: "GEN",
        })

        setGenTokens(25)
        setIsComplete(true)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {!isComplete ? (
        <>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Genius ID</CardTitle>
            <CardDescription>
              Establish your unique identity as a value creator in the Supercivilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-medium mb-2">Why This Matters:</h3>
              <p className="text-sm text-muted-foreground">
                Your Genius ID is your unique identity in the Supercivilization. It defines who you are as a value
                creator and sets the foundation for your transformation from Degen to Regen.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="How you want to be known in the Supercivilization" {...field} />
                      </FormControl>
                      <FormDescription>This is how you'll be identified in the Supercivilization.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Value Creator Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What makes you unique as a value creator?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share what makes you unique as a value creator (max 160 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Supercivilization Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How do you want to contribute to the Supercivilization?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe how you want to create value for yourself and others in the Supercivilization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Genius ID..." : "Create My Genius ID"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto bg-gradient-to-r from-zinc-400 to-zinc-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4"
            >
              <Lightbulb className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl">Genius ID Created!</CardTitle>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center mt-2"
            >
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 text-foreground px-3 py-1"
              >
                <span className="mr-1">+</span>
                <span className="font-bold">{genTokens}</span>
                <span className="ml-1">GEN</span>
              </Badge>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-lg text-center mb-6">
                You've taken your first step on the journey from Degen to Regen. Your Genius ID is now active in the
                Supercivilization!
              </p>

              <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h3 className="font-medium text-lg mb-2">What This Means For You:</h3>
                <p>
                  You now have a unique identity in the Supercivilization. This identity will help you track your
                  progress, earn GEN tokens, and collaborate with other value creators.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <h3 className="font-medium text-lg mb-2">Your Next Step:</h3>
              <p>
                Now it's time to unlock GEN tokens, the currency of value creation in the Supercivilization. These
                tokens will fuel your transformation from Degen to Regen.
              </p>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full py-6" onClick={() => (window.location.href = "/dashboard")}>
              Continue Your Transformation <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
