"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, Shield, Lightbulb, Check } from "lucide-react"
import { motion } from "framer-motion"
import { submitInvitationRequest } from "@/app/actions/invitation-actions"

export function InvitationFlow() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    reason: "",
    referralCode: "",
    valueCreation: "",
    alignment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("email", formData.email)
      formDataObj.append("reason", formData.reason)
      formDataObj.append("referralCode", formData.referralCode)
      formDataObj.append("valueCreation", formData.valueCreation)
      formDataObj.append("alignment", formData.alignment)

      const result = await submitInvitationRequest(formDataObj)
      setResult(result)
      if (result.success) {
        setStep(4)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while submitting your request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Request an Invitation</CardTitle>
            <CardDescription>Join the Supercivilization and begin your journey from Degen to Regen</CardDescription>
          </div>
          <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
            Step {step} of {step === 4 ? 3 : 3}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-600 dark:text-zinc-400">About the Supercivilization</h3>
                  <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                    The Supercivilization is a community of value creators committed to regenerative thinking. We focus
                    on creating positive-sum outcomes that benefit all participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want to join the Supercivilization?</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Share your motivation for joining and what you hope to contribute..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  placeholder="Enter referral code if you have one"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  If you were invited by an existing member, please enter their referral code.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-600 dark:text-zinc-400">Value Creation Assessment</h3>
                  <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                    The Supercivilization is built on value creation. Please share your experience with creating value
                    for yourself and others.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valueCreation">
                  Please describe a specific example of how you've created value for yourself and others:
                </Label>
                <Textarea
                  id="valueCreation"
                  name="valueCreation"
                  placeholder="Share a specific example of value you've created..."
                  value={formData.valueCreation}
                  onChange={handleInputChange}
                  required
                  className="min-h-[150px]"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label>Which best describes your approach to value creation?</Label>
                <RadioGroup value={formData.alignment} onValueChange={(value) => handleRadioChange("alignment", value)}>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <RadioGroupItem value="extractive" id="extractive" />
                    <Label htmlFor="extractive" className="font-normal cursor-pointer">
                      <div className="font-medium">Extractive Approach</div>
                      <p className="text-sm text-muted-foreground">
                        I focus on extracting maximum value from existing systems for personal gain.
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <RadioGroupItem value="competitive" id="competitive" />
                    <Label htmlFor="competitive" className="font-normal cursor-pointer">
                      <div className="font-medium">Competitive Approach</div>
                      <p className="text-sm text-muted-foreground">
                        I focus on competing for limited resources in zero-sum games.
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <RadioGroupItem value="collaborative" id="collaborative" />
                    <Label htmlFor="collaborative" className="font-normal cursor-pointer">
                      <div className="font-medium">Collaborative Approach</div>
                      <p className="text-sm text-muted-foreground">
                        I focus on creating win-win scenarios through collaboration and mutual benefit.
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <RadioGroupItem value="regenerative" id="regenerative" />
                    <Label htmlFor="regenerative" className="font-normal cursor-pointer">
                      <div className="font-medium">Regenerative Approach</div>
                      <p className="text-sm text-muted-foreground">
                        I focus on creating systems that generate abundance and benefit all stakeholders.
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-zinc-600 dark:text-zinc-400">Review Your Application</h3>
                  <p className="text-sm text-zinc-600/80 dark:text-zinc-400/80">
                    Please review your application before submitting. Once submitted, our team will review your request
                    and respond via email.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Contact Information</h4>
                <p className="text-sm">{formData.email}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Motivation</h4>
                <p className="text-sm">{formData.reason}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Value Creation Example</h4>
                <p className="text-sm">{formData.valueCreation}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-sm mb-2">Value Creation Approach</h4>
                <p className="text-sm">
                  {formData.alignment === "extractive" && "Extractive Approach"}
                  {formData.alignment === "competitive" && "Competitive Approach"}
                  {formData.alignment === "collaborative" && "Collaborative Approach"}
                  {formData.alignment === "regenerative" && "Regenerative Approach"}
                </p>
              </div>

              {formData.referralCode && (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-medium text-sm mb-2">Referral Code</h4>
                  <p className="text-sm">{formData.referralCode}</p>
                </div>
              )}
            </div>

            {result && !result.success && (
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {result.message}
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
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
              <h3 className="text-xl font-medium text-center">Application Submitted Successfully!</h3>
              <p className="text-center text-muted-foreground mt-2 max-w-md">
                Thank you for your interest in joining the Supercivilization. We'll review your application and respond
                via email soon.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-sm mb-2">Next Steps</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span>Our team will review your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span>You'll receive an email with our decision</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span>If approved, you'll receive an invitation link to create your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-zinc-200 dark:bg-zinc-700 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span>You'll begin your journey in the Supercivilization</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 1 && step < 4 && (
          <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button
            onClick={handleNextStep}
            className="ml-auto"
            disabled={
              (step === 1 && (!formData.email || !formData.reason)) ||
              (step === 2 && (!formData.valueCreation || !formData.alignment))
            }
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {step === 3 && (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
        {step === 4 && (
          <Button onClick={() => (window.location.href = "/")} className="ml-auto">
            Return to Home
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
