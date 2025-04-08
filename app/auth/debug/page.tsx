"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(data.session)

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(userData.user)
      } catch (error) {
        console.error("Error loading session:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>View your current authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Session Status</h3>
            <pre className="mt-2 rounded bg-muted p-4 overflow-auto max-h-[300px]">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium">User Data</h3>
            <pre className="mt-2 rounded bg-muted p-4 overflow-auto max-h-[300px]">{JSON.stringify(user, null, 2)}</pre>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
            {session && (
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
