import { redirect } from "next/navigation"

export default function Page() {
  // Redirect to the login page or dashboard
  redirect("/auth/login")
}

