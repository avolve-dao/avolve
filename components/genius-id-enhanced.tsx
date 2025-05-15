"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Lightbulb, Briefcase, Brain, ArrowRight, Check, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }),
  personalGoals: z.string().min(10, {
    message: "Please share at least a brief description of your personal goals.",
  }),
  businessGoals: z.string().min(10, {
    message: "Please share at least a brief description of your business goals.",
  }),
  supermindGoals: z.string().min(10, {
    message: "Please share at least a brief description of your supermind goals.",
  }),
})

export function GeniusIdEnhanced() {
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [genTokens, setGenTokens] = useState(0)
  const [activeTab, setActiveTab] = useState("personal")
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      personalGoals: "",
      businessGoals: "",
      supermindGoals: "",
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
          personal_goals: values.personalGoals,
          business_goals: values.businessGoals,
          supermind_goals: values.supermindGoals,
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Create Your Genius ID</CardTitle>
                <CardDescription>
                  Set up your profile to begin your journey from Degen to Regen and earn your first GEN tokens.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                Step 2 of 4
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>This is how you'll be known in the Supercivilization.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description about yourself..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Share a brief introduction about yourself (max 160 characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-medium mb-4">Your Success Puzzle</h3>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="personal" className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>Personal</span>
                      </TabsTrigger>
                      <TabsTrigger value="business" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Business</span>
                      </TabsTrigger>
                      <TabsTrigger value="supermind" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span>Supermind</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 p-3 rounded-lg">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" />
                          Personal Success Puzzle (PSP)
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enjoy greater personal successes faster via boosting your overall health, wealth, and peace in
                          life.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="personalGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Goals</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What are your personal goals for health, wealth, and peace?"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Share your goals for personal growth and development.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="business" className="space-y-4">
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 p-3 rounded-lg">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" />
                          Business Success Puzzle (BSP)
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enjoy greater business successes faster by enhancing your network and advancing your net
                          worth.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="businessGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Goals</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What are your business goals for users, admin, and profit?"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Share your goals for business growth and development.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="supermind" className="space-y-4">
                      <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-900/30 dark:via-fuchsia-900/30 dark:to-pink-900/30 p-3 rounded-lg">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400" />
                          Supermind Superpowers (SMS)
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Improve your ability to solve a conflict, create a plan for the future & implement your action
                          plan.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="supermindGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supermind Goals</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What are your goals for developing your supermind powers?"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Share your goals for developing your mental capabilities.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? "Creating..." : "Create Genius ID"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Genius ID Created!</CardTitle>
                <CardDescription>
                  You've successfully created your Genius ID and earned your first GEN tokens.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
                Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-center">Genius ID Created Successfully!</h3>
                <p className="text-center text-muted-foreground mt-2 max-w-md">
                  You've taken the first step in your journey from Degen to Regen thinking.
                </p>
              </div>

              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Coins className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    GEN Tokens Earned
                  </h4>
                  <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                    +{genTokens} GEN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You've earned your first GEN tokens for creating your Genius ID. These tokens represent your
                  contribution to the Supercivilization and can be used for governance and access to advanced features.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Next Steps</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Create your Genius ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <ArrowRight className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Unlock GEN Tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <ArrowRight className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Access Genie AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                      <ArrowRight className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span>Begin your journey in the Supercivilization</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/unlock/gen-token")} className="flex items-center gap-2">
              Continue to GEN Tokens <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
