"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export default function Page() {
  const [invitationCode, setInvitationCode] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkInvitationCode = async () => {
    if (!invitationCode.trim()) {
      toast({
        title: "Invitation code required",
        description: "Please enter an invitation code to continue.",
        variant: "destructive"
      })
      return
    }

    setIsChecking(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('check_invitation_code', {
        p_code: invitationCode.trim().toUpperCase()
      })

      if (error) throw error

      if (data.valid) {
        // Store the invitation code in session storage for the sign-up process
        sessionStorage.setItem('invitation_code', invitationCode.trim().toUpperCase())
        
        // Redirect to sign-up page with invitation code
        router.push(`/auth/sign-up?code=${invitationCode.trim().toUpperCase()}`)
      } else {
        toast({
          title: "Invalid invitation code",
          description: data.message || "This invitation code is not valid.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error checking invitation code:", error)
      toast({
        title: "Something went wrong",
        description: "We couldn't verify your invitation code. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkInvitationCode()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Avolve</CardTitle>
            <CardDescription className="text-zinc-400">
              A private community for extraordinary individuals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-sm text-zinc-400">
                <p>Membership is by invitation only</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="invitation-code" className="text-sm font-medium text-zinc-300">
                  Invitation Code
                </label>
                <Input
                  id="invitation-code"
                  placeholder="Enter your invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
              onClick={checkInvitationCode}
              disabled={isChecking}
            >
              {isChecking ? "Checking..." : "Continue"}
            </Button>
          </CardFooter>
          <div className="px-6 pb-6 text-center text-xs text-zinc-500">
            <p>Already a member? <a href="/auth/login" className="text-indigo-400 hover:text-indigo-300">Sign in</a></p>
          </div>
        </Card>
      </div>
    </div>
  )
}
