"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export function InviteForm() {
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
      <Button 
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
        onClick={checkInvitationCode}
        disabled={isChecking}
      >
        {isChecking ? "Checking..." : "Continue"}
      </Button>
    </div>
  )
}
