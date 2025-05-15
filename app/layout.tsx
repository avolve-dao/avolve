import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/user-context"
import { TourProvider } from "@/contexts/tour-context"
import { TourOverlay } from "@/components/tour/tour-overlay"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Avolve - Transform from Degen to Regen",
  description: "Join the Supercivilization and become a value creator",
  applicationName: "Avolve",
  authors: [{ name: "Avolve Team" }],
  keywords: ["supercivilization", "transformation", "value creation", "regen"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Avolve",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <TourProvider>
              {children}
              <TourOverlay />
              <Toaster />
            </TourProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
