import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RouteTransitionProvider } from "@/components/route-transition-provider"
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider"
import { FeaturesProvider } from "@/components/Features/FeaturesProvider"
import AnalyticsProvider from "@/lib/analytics/analytics-provider"
import QueryProvider from '@/providers/QueryProvider';
import { GovernanceActionFeedback } from '@/components/Governance/GovernanceActionFeedback';
import { CspProvider } from '@/components/security/csp-provider';
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
  // Extract CSP nonce from headers
  let nonce: string | null = null;
  try {
    const headersList = headers();
    nonce = headersList.get('X-Nonce');
  } catch (error) {
    console.error('Failed to get CSP nonce from headers:', error);
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <CspProvider nonce={nonce}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <FeaturesProvider>
                <OnboardingProvider>
                  <RouteTransitionProvider>
                    <AnalyticsProvider>
                      {children}
                    </AnalyticsProvider>
                  </RouteTransitionProvider>
                </OnboardingProvider>
              </FeaturesProvider>
              <GovernanceActionFeedback />
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </CspProvider>
      </body>
    </html>
  )
}
