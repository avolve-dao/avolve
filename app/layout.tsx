import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'; 
import { SupabaseClientProvider } from '@/components/supabase-client-provider'; 

// TODO: Import authentication context or hook from your auth system
// import { useAuth } from '@/contexts/AuthContext'; // Placeholder import

export const metadata: Metadata = {
  title: 'Avolve - Evolve Your Potential',
  description: 'Join a community of extraordinary individuals dedicated to personal growth, collective achievement, and building a supercivilization.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#18181b',
  icons: {
    icon: '/favicon.ico',
  },
}

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
    <>
      {/* 
        Supabase client is now initialized in a client component (SupabaseClientProvider)
        to avoid serialization issues in server components
      */}
      <Toaster richColors closeButton position="bottom-right" />
      {isAuthenticated ? (
        // Authenticated layout with navbar and sidebar
        <SupabaseClientProvider>
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
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          // TODO: Add interactivity for Social Feed in a Client Component
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m5.66 0a2 2 0 01-1.414 3.414l-1.25-.313A2 2 0 0113 8.172V7h4a2 2 0 012 2v2a2 2 0 01-.073.83l1.491.373a2 2 0 011.416 1.92v.785a1.97 1.97 0 01-.459 1.244l1.493.373a2 2 0 011.626 1.968V17a2 2 0 01-2 2z" />
                            <circle cx="9" cy="12" r="2" />
                            <circle cx="15" cy="12" r="2" />
                            <circle cx="12" cy="16" r="2" />
                          </svg>
                          <span className="sr-only">Social Feed</span>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          // TODO: Add interactivity for Events in a Client Component
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M9 21h6M7.5 13l-.354.354a.5.5 0 000 .707l.354.354M12 13v1m4.646-.647l.354-.354a.5.5 0 000-.707l-.354-.354M3 9a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
                          </svg>
                          <span className="sr-only">Events</span>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          // TODO: Add interactivity for Courses in a Client Component
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="sr-only">Courses</span>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none relative">
                          // TODO: Add interactivity for Notifications in a Client Component
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.4 2.757a.5.5 0 01.2.485v.553a.5.5 0 01-.2.485L15 17M5 17l4-4m6 4H9m-1.343-5.086A8 8 0 1115.343 8.657a8 8 0 01-7.686 5.257z" />
                          </svg>
                          <span className="sr-only">Notifications</span>
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none relative">
                          // TODO: Add interactivity for Messages in a Client Component
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="sr-only">Messages</span>
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                        </button>
                        <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 focus:outline-none">
                          // TODO: Add interactivity for User Profile & Settings in a Client Component
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-indigo-100 font-medium">
                            U
                          </div>
                          <span className="sr-only">User Profile & Settings</span>
                        </button>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto p-4 mt-16">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </SupabaseClientProvider>
      ) : (
        // Unauthenticated layout with marketing-focused navbar
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
            {children}
          </main>
        </>
      )}
    </>
  );
}
