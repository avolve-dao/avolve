import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/types/supabase-schema';

// Define event types based on the Avolve platform's key metrics
export type EventType =
  // User lifecycle events
  | 'signup'
  | 'login'
  | 'logout'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'profile_updated'

  // Engagement events
  | 'page_view'
  | 'feature_view'
  | 'feature_unlock'
  | 'token_earned'
  | 'token_spent'
  | 'post_created'
  | 'post_liked'
  | 'post_commented'
  | 'post_shared'

  // Invitation events
  | 'invitation_created'
  | 'invitation_sent'
  | 'invitation_claimed'

  // Achievement events
  | 'achievement_unlocked'
  | 'milestone_reached'

  // Supercivilization events
  | 'supercivilization_contribution'
  | 'community_milestone_progress'

  // Error events
  | 'error_occurred';

// Define the analytics event interface
interface AnalyticsEvent {
  eventType: EventType;
  properties?: Record<string, any>;
  timestamp?: string;
}

// Define the analytics context interface
interface AnalyticsContextType {
  trackEvent: (event: EventType, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (url: string, referrer?: string) => Promise<void>;
  trackError: (error: Error, context?: Record<string, any>) => Promise<void>;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// Create the context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * AnalyticsProvider component for tracking user events across the Avolve platform
 *
 * This provider handles analytics tracking for key user actions and metrics,
 * sending data to both our internal database and external analytics services.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);

  // Initialize analytics on mount
  useEffect(() => {
    // Check if analytics is disabled in localStorage
    const analyticsDisabled = localStorage.getItem('avolve-analytics-disabled');
    if (analyticsDisabled === 'true') {
      setIsEnabled(false);
    }

    // Initialize external analytics services if enabled
    if (isEnabled) {
      // Initialize PostHog if available
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          capture_pageview: false, // We'll handle this manually
          persistence: 'localStorage',
          autocapture: false,
        });
      }
    }
  }, []);

  // Update user identity in analytics services when user changes
  useEffect(() => {
    if (!isEnabled || !user) return;

    // Identify user in PostHog if available
    if (typeof window !== 'undefined' && window.posthog && user) {
      window.posthog.identify(user.id, {
        email: user.email,
        id: user.id,
      });
    }
  }, [user, isEnabled]);

  // Track page views
  useEffect(() => {
    if (!isEnabled) return;

    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    // Track initial page view
    trackPageView(router.asPath);

    // Track page views on route change
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isEnabled]);

  // Set analytics enabled/disabled in localStorage
  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('avolve-analytics-disabled', enabled ? 'false' : 'true');

    // Opt out of PostHog if disabled
    if (typeof window !== 'undefined' && window.posthog) {
      if (enabled) {
        window.posthog.opt_in_capturing();
      } else {
        window.posthog.opt_out_capturing();
      }
    }
  };

  // Track a page view
  const trackPageView = async (url: string, referrer?: string) => {
    if (!isEnabled) return;

    try {
      // Track in PostHog if available
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('$pageview', {
          $current_url: url,
          $referrer: referrer || document.referrer,
        });
      }

      // Track in internal database
      if (user) {
        await trackEvent('page_view', {
          url,
          referrer: referrer || document.referrer,
          path: url.split('?')[0], // Remove query params
          title: document.title,
        });
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  // Track an error
  const trackError = async (error: Error, context?: Record<string, any>) => {
    if (!isEnabled) return;

    try {
      // Track in PostHog if available
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('error', {
          error_message: error.message,
          error_stack: error.stack,
          ...context,
        });
      }

      // Track in internal database
      await trackEvent('error_occurred', {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack,
        ...context,
      });
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  };

  // Track an event
  const trackEvent = async (eventType: EventType, properties?: Record<string, any>) => {
    if (!isEnabled) return;

    try {
      const timestamp = new Date().toISOString();
      const event: AnalyticsEvent = {
        eventType,
        properties,
        timestamp,
      };

      // Track in PostHog if available
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture(eventType, {
          ...properties,
          timestamp,
        });
      }

      // Track in internal database
      if (user) {
        await supabase.from('metrics').insert({
          user_id: user.id,
          event: eventType,
          metric_type: 'custom', // Using the enum value that exists in the database
          metric_value: 1,
          metadata: properties ? JSON.stringify(properties) : null,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Failed to track event ${eventType}:`, error);
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{ trackEvent, trackPageView, trackError, isEnabled, setEnabled }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook for using the analytics context
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Add TypeScript declaration for PostHog
declare global {
  interface Window {
    posthog?: any;
  }
}
