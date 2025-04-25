import { cookies } from 'next/headers';

// Define metric types
export type MetricName =
  | 'auth_attempt'
  | 'auth_success'
  | 'auth_failure'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'onboarding_drop'
  | 'api_error'
  | 'api_latency'
  | 'page_view'
  | 'user_action';

// Define metric data structure
export type Metric = {
  name: MetricName;
  value: number;
  tags: Record<string, string>;
  timestamp: string;
};

// Track user actions
export const trackUserAction = async (action: string, properties: Record<string, any> = {}) => {
  // Get A/B test variant
  const cookieStore = await cookies();
  const variant = cookieStore.get('avolve-onboarding-variant')?.value || 'unknown';

  // Prepare metric data
  const metric: Metric = {
    name: 'user_action',
    value: 1,
    tags: {
      action,
      variant,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('Track:', metric);
    return;
  }

  // In production, metrics are automatically collected by Vercel Analytics
};

// Track API errors
export const trackApiError = async (
  error: Error,
  endpoint: string,
  properties: Record<string, any> = {}
) => {
  const metric: Metric = {
    name: 'api_error',
    value: 1,
    tags: {
      error: error.message,
      endpoint,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', metric);
    return;
  }
};

// Track API latency
export const trackApiLatency = async (
  endpoint: string,
  latencyMs: number,
  properties: Record<string, any> = {}
) => {
  const metric: Metric = {
    name: 'api_latency',
    value: latencyMs,
    tags: {
      endpoint,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('API Latency:', metric);
    return;
  }
};

// Track onboarding progress
export const trackOnboarding = async (
  stage: string,
  action: 'start' | 'complete' | 'drop',
  properties: Record<string, any> = {}
) => {
  const cookieStore = await cookies();
  const variant = cookieStore.get('avolve-onboarding-variant')?.value || 'unknown';

  const metric: Metric = {
    name: `onboarding_${action}`,
    value: 1,
    tags: {
      stage,
      variant,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Onboarding:', metric);
    return;
  }
};

// Track authentication events
export const trackAuth = async (
  action: 'attempt' | 'success' | 'failure',
  provider: string,
  properties: Record<string, any> = {}
) => {
  const metric: Metric = {
    name: `auth_${action}`,
    value: 1,
    tags: {
      provider,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Auth:', metric);
    return;
  }
};

// Track page views
export const trackPageView = async (path: string, properties: Record<string, any> = {}) => {
  const metric: Metric = {
    name: 'page_view',
    value: 1,
    tags: {
      path,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Page View:', metric);
    return;
  }
};
