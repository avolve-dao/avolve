import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DiscoverClientPage from "./page.client"

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <DiscoverClientPage userId={data.user.id} />
}
