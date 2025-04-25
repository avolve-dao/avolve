import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientGlobalErrorBoundary from '@/app/components/ClientGlobalErrorBoundary';
import ResumeOnboardingPrompt from '@/app/components/ResumeOnboardingPrompt';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import ClientRootGuard from '@/components/ClientRootGuard';
import { ClientProviders } from '@/components/providers/ClientProviders';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// TODO: Import authentication context or hook from your auth system
// import { useAuth } from '@/contexts/AuthContext'; // Placeholder import

export const metadata: Metadata = {
  title: 'Avolve - Evolve Your Potential',
  description:
    'Join a community of extraordinary individuals dedicated to personal growth, collective achievement, and building a supercivilization.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const themeColor = '#18181b';

// --- MVP LAUNCH POLISH: ROUTE/PAGE ACCESS ---
// Only allow access to MVP-ready routes/pages for regular users.
// Hide or protect all non-MVP, legacy, or unfinished routes.

// Example: Only render MVP routes for users; future routes for admins/devs
const MVP_ROUTES = [
  '/app/(supercivilization)/supercivilization',
  '/app/(superachiever)/superachiever',
  '/app/(superachievers)/superachievers',
  '/app/(authenticated)/profile',
  '/app/(authenticated)/settings',
];

const isAdmin = /* logic to determine admin role, e.g. from user context */ false;

function isMvpRoute(path: string) {
  return MVP_ROUTES.includes(path) || isAdmin;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force dark mode for MVP polish by always setting the 'dark' class on html
  return (
    <html lang="en" className={cn('bg-background font-sans antialiased dark', fontSans.variable)}>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          {/* ClientRootGuard removed from root layout. See comment below. */}
          {/* ClientRootGuard should be used in page or route components instead, per Next.js best practices. */}
          {children}
        </ClientProviders>
      </body>
      <Analytics />
    </html>
  );
}
