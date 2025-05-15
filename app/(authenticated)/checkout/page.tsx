"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()

  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    name: "",
    email: user?.email || "",
  })

  useEffect(() => {
    const tier = searchParams.get("tier")
    if (tier) {
      setSelectedTier(tier)
    }
  }, [searchParams])

  const getTierDetails = () => {
    switch (selectedTier) {
      case "regen-creator":
        return {
          name: "Regen Creator",
          price: 97,
          tokenBonus: 500,
        }
      case "regen-builder":
        return {
          name: "Regen Builder",
          price: 47,
          tokenBonus: 200,
        }
      case "degen-explorer":
        return {
          name: "Degen Explorer",
          price: 19,
          tokenBonus: 50,
        }
      default:
        return {
          name: "Unknown Tier",
          price: 0,
          tokenBonus: 0,
        }
    }
  }

  const tierDetails = getTierDetails()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)

      toast({
        title: "Subscription activated!",
        description: `You've successfully subscribed to the ${tierDetails.name} plan.`,
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard?subscription=success")
      }, 2000)
    }, 2000)
  }

  if (!selectedTier) {
    return (
      <div className="container max-w-lg py-12">
        <Card>
          <CardHeader>
            <CardTitle>No Plan Selected</CardTitle>
            <CardDescription>Please select a subscription plan first.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/pricing")} className="w-full">
              View Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="container max-w-lg py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Subscription Activated!</CardTitle>
            <CardDescription>You've successfully subscribed to the {tierDetails.name} plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your account has been credited with {tierDetails.tokenBonus} GEN tokens.</p>
            <p className="text-sm text-muted-foreground">You'll be redirected to your dashboard in a moment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            You're subscribing to the {tierDetails.name} plan at ${tierDetails.price}/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Subscription Summary</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>{tierDetails.name} Plan</span>
                    <span>${tierDetails.price}/month</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GEN Token Bonus</span>
                    <span>+{tierDetails.tokenBonus} tokens</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-medium">
                    <span>Total today</span>
                    <span>${tierDetails.price}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card">Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="crypto" id="crypto" disabled />
                    <Label htmlFor="crypto" className="text-muted-foreground">
                      Crypto (Coming Soon)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        placeholder="123"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
                <p className="text-sm text-green-800 dark:text-green-400">
                  <strong>Value Creation Guarantee:</strong> If you don't create at least 10x the value of your
                  subscription within 90 days, we'll refund your investment and give you 100 GEN tokens as an apology.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe for $${tierDetails.price}/month`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
