'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface RouteTransitionProviderProps {
  children: React.ReactNode;
}

function RouteTransitionContent({ children }: RouteTransitionProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState('');

  // Create a key from the pathname and search params
  const routeKey = React.useMemo(() => {
    return `${pathname}?${searchParams?.toString() || ''}`;
  }, [pathname, searchParams]);

  // Track navigation state
  React.useEffect(() => {
    if (prevPathname && prevPathname !== pathname) {
      setIsNavigating(true);
      // Reset after animation completes
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 500); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
    setPrevPathname(pathname ?? '');
  }, [pathname, prevPathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.3,
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Export a wrapper component that uses Suspense
export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen">Loading...</div>}>
      <RouteTransitionContent>{children}</RouteTransitionContent>
    </React.Suspense>
  );
}
