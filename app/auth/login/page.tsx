"use client"

import { Suspense, useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "next/navigation"

export default function Page() {
  const searchParams = useSearchParams()
  const message = searchParams?.get("message")
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Fetch CSRF token on client side
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf/token")
        const data = await response.json()
        if (data.token) {
          setCsrfToken(data.token)
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error)
      }
    }

    fetchCsrfToken()
  }, [])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm message={message} csrfToken={csrfToken} />
        </Suspense>
      </div>
    </div>
  )
}

