import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserSearch } from "@/components/user-search"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Find Someone to Chat With
            </CardTitle>
            <CardDescription>Search for users to start a conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch currentUserId={data.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
