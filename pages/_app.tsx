import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { ThemeProvider } from 'next-themes';
import { SupabaseProvider } from '@/lib/supabase/use-supabase';
import MainLayout from '@/components/layout/main-layout';
import '@/styles/globals.css';

// Pages that should not use the main layout
const noLayoutPages = [
  '/login',
  '/signup',
  '/reset-password',
  '/404',
  '/500',
];

export default function App({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();
  
  // Determine if the current page should use the main layout
  const useMainLayout = !noLayoutPages.includes(router.pathname);
  
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <SupabaseProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          {useMainLayout ? (
            <MainLayout showPhaseGuide={router.pathname === '/dashboard'}>
              <Component {...pageProps} />
            </MainLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </ThemeProvider>
      </SupabaseProvider>
    </SessionContextProvider>
  );
}
