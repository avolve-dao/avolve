'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Create a context for the CSP nonce
const CspContext = createContext<string | null>(null);

// Provider component that will wrap the application
export function CspProvider({
  nonce,
  children,
}: {
  nonce: string | null;
  children: ReactNode;
}) {
  return <CspContext.Provider value={nonce}>{children}</CspContext.Provider>;
}

// Hook to use the CSP nonce
export function useCspNonce() {
  const nonce = useContext(CspContext);
  return nonce;
}

// Component to add nonce to inline scripts
export function Script({
  children,
  ...props
}: {
  children: string;
} & React.HTMLAttributes<HTMLScriptElement>) {
  const nonce = useCspNonce();
  
  return (
    <script
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
    />
  );
}

// Component to add nonce to inline styles
export function Style({
  children,
  ...props
}: {
  children: string;
} & React.HTMLAttributes<HTMLStyleElement>) {
  const nonce = useCspNonce();
  
  return (
    <style
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
    />
  );
}
