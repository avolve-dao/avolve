import { getCsrfToken } from "@/lib/csrf-server"
import SignUpClientPage from "./page.client"

export default async function Page() {
  // Get CSRF token
  const { csrfToken } = await getCsrfToken()

  return <SignUpClientPage csrfToken={csrfToken} />
}
