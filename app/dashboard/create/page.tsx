import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateClientPage from "./page.client"

export default async function CreatePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <CreateClientPage user={data.user} />
}
