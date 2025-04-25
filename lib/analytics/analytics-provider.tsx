'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Define the analytics context
type AnalyticsContextType = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (url: string, referrer?: string) => void;
  trackError: (error: Error, componentName?: string) => void;
  trackTiming: (name: string, duration: number) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

/**
 * Custom hook to use analytics
 */
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

/**
 * Analytics Provider Component
 *
 * Provides analytics tracking functionality throughout the application
 * using lightweight performance monitoring
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // Track page load performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use Performance API to track page load times
      window.addEventListener('load', () => {
        if (window.performance) {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          trackTiming('page_load', pageLoadTime);

          // Track Time to First Byte (TTFB)
          const ttfb = perfData.responseStart - perfData.navigationStart;
          trackTiming('ttfb', ttfb);

          // Track DOM Content Loaded
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          trackTiming('dom_content_loaded', domContentLoaded);
        }
      });
    }
  }, []);

  // Track custom events
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore - gtag is injected by the script
      window.gtag('event', eventName, properties);
    }

    // Log events in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, properties);
    }
  };

  // Track page views
  const trackPageView = (url: string, referrer?: string) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore - gtag is injected by the script
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
        page_referrer: referrer,
      });
    }

    // Log page views in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Page View: ${url}`, { referrer });
    }
  };

  // Track errors
  const trackError = (error: Error, componentName?: string) => {
    trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      component: componentName,
    });
  };

  // Track timing metrics
  const trackTiming = (name: string, duration: number) => {
    trackEvent('timing_complete', {
      name,
      value: duration,
      page_path: pathname,
    });

    // Log timing in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Timing (${name}): ${duration}ms`);
    }
  };

  const value = {
    trackEvent,
    trackPageView,
    trackError,
    trackTiming,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

/**
 * Higher-order component to track component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return (props: P) => {
    const { trackTiming } = useAnalytics();
    const startTime = performance.now();

    useEffect(() => {
      const renderTime = performance.now() - startTime;
      trackTiming(`${componentName}_render`, renderTime);
    }, []);

    return <Component {...props} />;
  };
}

export default AnalyticsProvider;
