import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { RouteTransitionProvider } from "@/components/route-transition-provider"
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider"
import { FeaturesProvider } from "@/components/Features/FeaturesProvider"
import { A11yProvider } from "@/components/accessibility/a11y-provider"
import { SkipToContent } from "@/components/accessibility/skip-to-content"
import AnalyticsProvider from "@/lib/analytics/analytics-provider"
import QueryProvider from '@/providers/QueryProvider';
import { GovernanceActionFeedback } from '@/components/Governance/GovernanceActionFeedback';
import { CspProvider } from '@/components/security/csp-provider';
import "@/styles/globals.css"
import "@/styles/accessibility.css"
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
  
  // Server component - headers() is synchronous here
  const headersList = headers();
  nonce = headersList.get('X-Nonce');
  
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
            <A11yProvider>
              <SkipToContent />
              <QueryProvider>
                <FeaturesProvider>
                  <OnboardingProvider>
                    <RouteTransitionProvider>
                      <AnalyticsProvider>
                        <main id="main-content" tabIndex={-1}>
                          {children}
                        </main>
                      </AnalyticsProvider>
                    </RouteTransitionProvider>
                  </OnboardingProvider>
                </FeaturesProvider>
                <GovernanceActionFeedback />
                <Toaster />
              </QueryProvider>
            </A11yProvider>
          </ThemeProvider>
        </CspProvider>
      </body>
    </html>
  )
}
