'use client';

import dynamic from "next/dynamic";
import { ComponentType, ReactNode } from "react";

// Default loading component
const DefaultLoading = () => {
  return (
    <div className="p-4 text-center">Loading...</div>
  );
};

// Default error component
const DefaultError = ({ error }: { error: Error }) => {
  return (
    <div className="p-4 text-center text-red-500">Error loading component: {error.message}</div>
  );
};

/**
 * Utility function to lazy load components with better error handling and loading states
 */
export function lazyLoad<T>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: () => ReactNode;
    error?: ComponentType<{ error: Error }>;
    ssr?: boolean;
    suspense?: boolean;
  } = {},
) {
  const {
    loading = () => <div>Loading...</div>,
    error = DefaultError,
    ssr = false,
    suspense = false
  } = options;

  return dynamic(() => importFunc(), {
    loading,
    ssr,
    // @ts-ignore - Next.js types don't include suspense, but it works
    suspense,
  });
}
