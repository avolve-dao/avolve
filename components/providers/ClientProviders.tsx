'use client';

import React, { ReactNode } from 'react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { Toaster } from '@/components/ui/sonner';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper
 * This component wraps all client-side providers in a single component
 * that can be used in the server-side layout
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <FeatureFlagProvider>
      {children}
      <Toaster />
    </FeatureFlagProvider>
  );
}
