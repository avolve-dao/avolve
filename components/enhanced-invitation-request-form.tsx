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
import { ArrowRight, Lock, Check, Shield, Users, Sparkles } from "lucide-react"
import { submitInvitationRequest } from "@/app/actions/invitation-actions"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  reason: z.string().min(50, {
    message: "Please share at least 50 characters about why you want to join.",
  }),
  referralCode: z.string().optional(),
  valueCreation: z.string({
    required_error: "Please select your primary value creation approach.",
  }),
  compactCommitments: z.array(z.string()).min(3, {
    message: "Please commit to at least 3 principles of the Supercivilization Compact.",
  }),
  selfishGoal: z.string().min(10, {
    message: "Please share at least a brief description of your virtuously selfish goal.",
  }),
  selflessGoal: z.string().min(10, {
    message: "Please share at least a brief description of your virtuously selfless goal.",
  }),
})

export function EnhancedInvitationRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("introduction")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      reason: "",
      referralCode: "",
      valueCreation: "",
      compactCommitments: [],
      selfishGoal: "",
      selflessGoal: "",
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
    formData.append("valueCreation", values.valueCreation)
    formData.append("compactCommitments", JSON.stringify(values.compactCommitments))
    formData.append("selfishGoal", values.selfishGoal)
    formData.append("selflessGoal", values.selflessGoal)

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
          The journey from Degen to Regen begins with understanding and committing to the Supercivilization Compact.
        </CardDescription>
      </CardHeader>

      {!isSubmitted ? (
        <>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="introduction">Introduction</TabsTrigger>
                <TabsTrigger value="compact">The Compact</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-medium mb-3">Welcome to the Supercivilization</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    The Supercivilization is a community of value creators committed to regenerative thinking and
                    positive-sum outcomes. Before applying, please take a moment to understand our core principles.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">The Supercivilization Compact</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          Our governing agreement that outlines the principles of regenerative thinking and value
                          creation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full">
                        <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Graduated Trust Architecture</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          Our community operates on a system of progressive trust levels based on demonstrated value
                          creation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Dual Virtuous Behaviors</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">
                          We balance virtuously selfish behavior (improving oneself) with virtuously selfless behavior
                          (improving society).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("compact")} className="flex items-center gap-2">
                    Continue to Compact <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="compact" className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-medium mb-3">The Supercivilization Compact</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    The Compact is structured around these key elements:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h4 className="text-sm font-medium">One Focus: Supercivilization</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        Our central organizing concept is the Supercivilization - a community of value creators
                        committed to regenerative thinking.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h4 className="text-sm font-medium">Two Views: Superachiever & Superachievers</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        We balance individual achievement (Superachiever) with collective advancement (Superachievers).
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h4 className="text-sm font-medium">Three Keys: Personal Success, Business Success, Supermind</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        We focus on developing personal success, business success, and supermind capabilities.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <h4 className="text-sm font-medium">
                        Four Cores: Developments, Enhancements, Advancements, Breakthroughs
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        We work on superpuzzle developments, superhuman enhancements, supersociety advancements, and
                        supergenius breakthroughs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("introduction")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveTab("application")} className="flex items-center gap-2">
                    Continue to Application <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="application">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
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
                                className="min-h-[100px]"
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
                        name="valueCreation"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Primary Value Creation Approach</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="producer" id="producer" />
                                  <Label htmlFor="producer" className="text-sm font-normal">
                                    Value Producer (improving existing values)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="creator" id="creator" />
                                  <Label htmlFor="creator" className="text-sm font-normal">
                                    Value Creator (creating new values)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="both" id="both" />
                                  <Label htmlFor="both" className="text-sm font-normal">
                                    Both Producer and Creator
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              Select the approach that best describes how you create value.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="compactCommitments"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Compact Commitments</FormLabel>
                              <FormDescription>
                                Select the principles of the Supercivilization Compact you commit to uphold.
                              </FormDescription>
                            </div>
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name="compactCommitments"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key="positive-sum"
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes("positive-sum")}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, "positive-sum"])
                                              : field.onChange(field.value?.filter((value) => value !== "positive-sum"))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        I commit to creating positive-sum outcomes that benefit all participants.
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="compactCommitments"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key="value-creation"
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes("value-creation")}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, "value-creation"])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== "value-creation"),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        I commit to being a value producer/creator rather than a value
                                        usurper/destroyer.
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="compactCommitments"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key="dual-virtuous"
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes("dual-virtuous")}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, "dual-virtuous"])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== "dual-virtuous"),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        I commit to balancing virtuously selfish behavior (improving myself) with
                                        virtuously selfless behavior (improving society).
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="compactCommitments"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key="graduated-trust"
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes("graduated-trust")}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, "graduated-trust"])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== "graduated-trust"),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        I accept the graduated trust architecture where access to community resources
                                        increases with demonstrated value creation.
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                              <FormField
                                control={form.control}
                                name="compactCommitments"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key="regenerative"
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes("regenerative")}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, "regenerative"])
                                              : field.onChange(field.value?.filter((value) => value !== "regenerative"))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        I commit to regenerative thinking that creates sustainable value rather than
                                        extractive thinking.
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="selfishGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Virtuously Selfish Goal</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share a goal for your personal growth and development..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>A goal focused on improving yourself.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="selflessGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Virtuously Selfless Goal</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share a goal for contributing to society..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>A goal focused on improving society.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("compact")} type="button">
                        Back
                      </Button>
                      <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Request Access"}{" "}
                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </>
      ) : (
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Received</h3>
            <p className="text-muted-foreground mb-6">
              We're reviewing your application to join the Supercivilization. If approved, you'll receive an invitation
              within 48 hours.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-left mb-6">
              <h4 className="text-sm font-medium mb-2">What happens next?</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Your application will be reviewed by existing members</li>
                <li>If approved, you'll receive an invitation email</li>
                <li>You'll create your Genius ID and begin your journey</li>
                <li>You'll earn your first GEN tokens and unlock Genie AI</li>
                <li>You'll start creating value in the Supercivilization</li>
              </ol>
            </div>

            <Badge className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              Initial Trust Level: Applicant
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
