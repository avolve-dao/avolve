import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsProvider, useAnalytics } from './AnalyticsProvider';
import posthog from 'posthog-js';

// Mock PostHog
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  register: jest.fn(),
  get_property: jest.fn(),
  isFeatureEnabled: jest.fn().mockReturnValue(true),
  getFeatureFlag: jest.fn(),
  reloadFeatureFlags: jest.fn(),
  onFeatureFlags: jest.fn(),
}));

// Test component that uses the analytics hook
const TestComponent = ({ userId }: { userId?: string }) => {
  const { trackEvent, trackPageView, identifyUser } = useAnalytics();

  React.useEffect(() => {
    if (userId) {
      identifyUser(userId, { email: 'test@example.com', name: 'Test User' });
    }
  }, [userId, identifyUser]);

  return (
    <div>
      <h1>Test Component</h1>
      <button
        onClick={() => trackEvent('button_clicked', { button_name: 'test_button' })}
        data-testid="track-event-button"
      >
        Track Event
      </button>
      <button onClick={() => trackPageView('/test-page')} data-testid="track-page-button">
        Track Page View
      </button>
    </div>
  );
};

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes PostHog with the correct API key', () => {
    render(
      <AnalyticsProvider apiKey="test-api-key" apiHost="https://app.posthog.com">
        <div>Test</div>
      </AnalyticsProvider>
    );

    expect(posthog.init).toHaveBeenCalledWith('test-api-key', {
      api_host: 'https://app.posthog.com',
      capture_pageview: false, // We handle this manually
      autocapture: false,
      loaded: expect.any(Function),
    });
  });

  it('provides analytics functions through the context', async () => {
    render(
      <AnalyticsProvider apiKey="test-api-key" apiHost="https://app.posthog.com">
        <TestComponent />
      </AnalyticsProvider>
    );

    // Track an event
    fireEvent.click(screen.getByTestId('track-event-button'));

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('button_clicked', {
        button_name: 'test_button',
      });
    });

    // Track a page view
    fireEvent.click(screen.getByTestId('track-page-button'));

    await waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
        path: '/test-page',
      });
    });
  });

  it('identifies users when provided with a user ID', async () => {
    render(
      <AnalyticsProvider apiKey="test-api-key" apiHost="https://app.posthog.com">
        <TestComponent userId="test-user-123" />
      </AnalyticsProvider>
    );

    await waitFor(() => {
      expect(posthog.identify).toHaveBeenCalledWith('test-user-123', {
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });

  it('resets user identity when component unmounts', async () => {
    const { unmount } = render(
      <AnalyticsProvider apiKey="test-api-key" apiHost="https://app.posthog.com">
        <TestComponent userId="test-user-123" />
      </AnalyticsProvider>
    );

    unmount();

    expect(posthog.reset).toHaveBeenCalled();
  });

  it('registers super properties for user segments', async () => {
    render(
      <AnalyticsProvider
        apiKey="test-api-key"
        apiHost="https://app.posthog.com"
        initialProperties={{
          user_type: 'early_adopter',
          onboarding_complete: true,
        }}
      >
        <TestComponent />
      </AnalyticsProvider>
    );

    await waitFor(() => {
      expect(posthog.register).toHaveBeenCalledWith({
        user_type: 'early_adopter',
        onboarding_complete: true,
      });
    });
  });

  it('tracks feature flag usage', async () => {
    render(
      <AnalyticsProvider
        apiKey="test-api-key"
        apiHost="https://app.posthog.com"
        enableFeatureFlags={true}
      >
        <TestComponent userId="test-user-123" />
      </AnalyticsProvider>
    );

    await waitFor(() => {
      expect(posthog.reloadFeatureFlags).toHaveBeenCalled();
    });

    // Check if a feature is enabled
    expect(posthog.isFeatureEnabled('test-feature')).toBe(true);
  });

  it('disables tracking in development mode if specified', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <AnalyticsProvider
        apiKey="test-api-key"
        apiHost="https://app.posthog.com"
        disableInDevelopment={true}
      >
        <TestComponent />
      </AnalyticsProvider>
    );

    // Click the track event button
    fireEvent.click(screen.getByTestId('track-event-button'));

    // PostHog should not be initialized or used
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();

    // Restore the original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('respects user opt-out preferences', async () => {
    // Mock localStorage to simulate user opt-out
    const localStorageMock = (() => {
      let store: Record<string, string> = { posthog_opt_out: 'true' };
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(
      <AnalyticsProvider
        apiKey="test-api-key"
        apiHost="https://app.posthog.com"
        respectDoNotTrack={true}
      >
        <TestComponent />
      </AnalyticsProvider>
    );

    // Click the track event button
    fireEvent.click(screen.getByTestId('track-event-button'));

    // PostHog should be initialized but not capture events
    expect(posthog.init).toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });
});
