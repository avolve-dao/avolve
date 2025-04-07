import { getCsrfToken } from "@/lib/csrf-server"
import ForgotPasswordClientPage from "./page.client"

export default async function Page() {
  // Get CSRF token
  const { csrfToken } = await getCsrfToken()

  return <ForgotPasswordClientPage csrfToken={csrfToken} />
}
