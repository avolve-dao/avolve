import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar';
import ClientGlobalErrorBoundary from "@/app/components/ClientGlobalErrorBoundary";
import ResumeOnboardingPrompt from "@/app/components/ResumeOnboardingPrompt";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// TODO: Import authentication context or hook from your auth system
// import { useAuth } from '@/contexts/AuthContext'; // Placeholder import

export const metadata: Metadata = {
  title: 'Avolve - Evolve Your Potential',
  description: 'Join a community of extraordinary individuals dedicated to personal growth, collective achievement, and building a supercivilization.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const themeColor = '#18181b'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Placeholder for authentication status using context or hook
  // Replace this with actual auth logic from your AuthService or Supabase client
  // const { isAuthenticated } = useAuth(); // Placeholder usage, adjust based on actual auth context
  const isAuthenticated = true; // Temporarily set to true for testing

  return (
    <html lang="en" className={cn("bg-background font-sans antialiased", fontSans.variable)}>
      <body className="min-h-screen flex flex-col">
        <Toaster richColors closeButton position="bottom-right" />
        {isAuthenticated ? (
          <SidebarProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex flex-1">
                <AppSidebar />
                <div className="flex-1 transition-all duration-300 pl-[64px] md:pl-64">
                  <header className="py-4 px-6 md:px-10 sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/30">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                      <Link href="/" className="text-2xl font-bold text-indigo-400 tracking-tight">
                        Avolve
                      </Link>
                      <nav className="hidden md:flex space-x-8 items-center">
                        <Link href="/superachiever" className="text-zinc-300 hover:text-stone-300 transition-colors text-sm font-medium">
                          Superachiever
                        </Link>
                        <Link href="/superachievers" className="text-zinc-300 hover:text-slate-300 transition-colors text-sm font-medium">
                          Superachievers
                        </Link>
                        <Link href="/supercivilization" className="text-zinc-300 hover:text-zinc-200 transition-colors text-sm font-medium">
                          Supercivilization
                        </Link>
                      </nav>
                      <div className="flex items-center space-x-4">
                        {/* Search, notifications, messages, and user profile buttons can be replaced with shadcn/ui components if available */}
                        <div className="relative hidden md:block">
                          <input
                            type="search"
                            placeholder="Search..."
                            className="w-48 bg-zinc-800/50 border border-zinc-700/30 rounded-full py-1 px-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 absolute right-2 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {/* Replace with shadcn/ui Button and Avatar components */}
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          <span className="sr-only">Notifications</span>
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none relative">
                          <span className="sr-only">Messages</span>
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-indigo-100 font-medium">
                            U
                          </div>
                          <span className="sr-only">User Profile & Settings</span>
                        </button>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto p-4 mt-16">
                    <ResumeOnboardingPrompt />
                    <ClientGlobalErrorBoundary />
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          <>
            <header className="py-4 px-6 md:px-10 fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/30">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-400 tracking-tight">
                  Avolve
                </Link>
                <nav className="hidden md:flex space-x-8 items-center">
                  <Link href="/features" className="text-zinc-300 hover:text-zinc-100 transition-colors text-sm font-medium">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-zinc-300 hover:text-zinc-100 transition-colors text-sm font-medium">
                    Pricing
                  </Link>
                  <Link href="/about" className="text-zinc-300 hover:text-zinc-100 transition-colors text-sm font-medium">
                    About
                  </Link>
                </nav>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-zinc-300 hover:text-zinc-100 transition-colors text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-full transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </header>
            <main className="mt-16">
              <ClientGlobalErrorBoundary />
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}
