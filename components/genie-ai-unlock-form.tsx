"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight } from "lucide-react"
import { unlockGenieAI } from "@/app/actions/genie-ai-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export function GenieAiUnlockForm() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commitment, setCommitment] = useState("")
  const [tokenCost, setTokenCost] = useState(50)
  const [currentTokens, setCurrentTokens] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch current token balance
  useEffect(() => {
    const fetchTokenBalance = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("profiles").select("gen_tokens").eq("id", user.id).single()

        if (data) {
          setCurrentTokens(data.gen_tokens || 0)
        }
      }
    }

    fetchTokenBalance()
  }, [])

  const handleUnlock = async () => {
    if (commitment.length < 20) return

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("commitment", commitment)
    formData.append("tokenCost", tokenCost.toString())

    const result = await unlockGenieAI(formData)

    setIsSubmitting(false)

    if (result.success) {
      setIsUnlocked(true)
      toast({
        title: "Genie AI Unlocked",
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

  const hasEnoughTokens = currentTokens >= tokenCost

  return (
    <Card className="w-full max-w-2xl mx-auto border-zinc-300 dark:border-zinc-700">
      <CardHeader className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-zinc-500" />
            <CardTitle className="text-2xl">Unlock Genie AI</CardTitle>
          </div>
          <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800">
            Step 3/3
          </Badge>
        </div>
        <CardDescription>
          Genie AI is your guide on the journey from Degen to Regen, powered by advanced AI to help you transform.
        </CardDescription>
      </CardHeader>

      {!isUnlocked ? (
        <>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Make Your Commitment</h3>
              <p className="text-muted-foreground mb-4">
                To unlock Genie AI, you'll need to spend {tokenCost} GEN Tokens and make a commitment to Regen
                principles.
              </p>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Your Regen Commitment</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Write a commitment to how you'll apply Regen principles in your life and work.
                  </p>

                  <Textarea
                    placeholder="I commit to applying Regen principles by..."
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    className="min-h-[120px]"
                  />

                  {commitment.length < 20 && (
                    <p className="text-xs text-muted-foreground mt-2">Please write at least 20 characters.</p>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cost to Unlock</h4>
                    <p className="text-sm text-muted-foreground">Deducted from your GEN Token balance</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-lg py-1 px-3">
                      {tokenCost} GEN
                    </Badge>
                    <p className={`text-xs ${hasEnoughTokens ? "text-green-600" : "text-red-600"}`}>
                      Your balance: {currentTokens} GEN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleUnlock}
              disabled={isSubmitting || commitment.length < 20 || !hasEnoughTokens}
            >
              {isSubmitting ? "Unlocking..." : `Unlock Genie AI (${tokenCost} GEN)`}
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-600 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-2">Genie AI Unlocked!</h3>
                <div className="flex items-center justify-center mb-6">
                  <Badge variant="outline" className="text-red-600 dark:text-red-400">
                    -{tokenCost} GEN
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  You've unlocked Genie AI, your guide on the journey from Degen to Regen. Ask questions, get insights,
                  and accelerate your transformation.
                </p>
              </div>

              <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-6">
                <h4 className="font-medium mb-2">Your Commitment:</h4>
                <p className="text-sm italic">"{commitment}"</p>
              </div>

              <div className="bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-medium mb-2">What's Next:</h4>
                <p className="text-sm text-muted-foreground">
                  You've completed the initial unlocking journey! You now have access to the Supercivilization. Continue
                  your journey by exploring the Superachiever components.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Enter the Supercivilization <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
