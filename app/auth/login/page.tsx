"use client"

import { Suspense, useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { useSearchParams } from "next/navigation"

// Separate component that uses useSearchParams
function LoginContent() {
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

  return <LoginForm message={message} csrfToken={csrfToken} />
}

// Main page component with Suspense boundary
export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  )
}
