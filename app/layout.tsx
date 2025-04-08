import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RouteTransitionProvider } from "@/components/route-transition-provider"
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider"
import { FeaturesProvider } from "@/components/Features/FeaturesProvider"

import './globals.css'

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
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FeaturesProvider>
            <OnboardingProvider>
              <RouteTransitionProvider>
                {children}
              </RouteTransitionProvider>
            </OnboardingProvider>
          </FeaturesProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
