import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Check if user is already authenticated
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="font-bold text-xl">
            Avolve
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© {new Date().getFullYear()} Avolve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
