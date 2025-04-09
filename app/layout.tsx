import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RouteTransitionProvider } from "@/components/route-transition-provider"
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider"
import { FeaturesProvider } from "@/components/Features/FeaturesProvider"
import AnalyticsProvider from "@/lib/analytics/analytics-provider"
import "@/styles/globals.css"
import { Inter } from "next/font/google"

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Avolve Platform',
  description: 'Your personal achievement platform',
  generator: 'Avolve',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FeaturesProvider>
            <OnboardingProvider>
              <RouteTransitionProvider>
                <AnalyticsProvider>
                  {children}
                </AnalyticsProvider>
              </RouteTransitionProvider>
            </OnboardingProvider>
          </FeaturesProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
