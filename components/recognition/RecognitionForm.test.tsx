import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecognitionForm } from './RecognitionForm';
import { SupabaseContext } from '@/components/supabase/provider';

// Full mock user object for Supabase
const mockSupabaseUser = {
  id: 'user123',
  email: 'test@example.com',
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
};

// Full mock session object for Supabase
const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  user: mockSupabaseUser,
};

// Mutable user variable for dynamic mocking
let supabaseUser: typeof mockSupabaseUser | null = mockSupabaseUser;

// Mock supabase client for tests
const mockSupabase: any = {
  from: () => ({
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
  auth: {
    user: jest.fn(() => supabaseUser),
    getSession: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({
          data: { session: supabaseUser ? { ...mockSession, user: supabaseUser } : null },
          error: null,
        })
      ),
    onAuthStateChange: jest.fn((_cb: any) => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};

const MockSupabaseProvider = ({ children }: { children: React.ReactNode }) => (
  <SupabaseContext.Provider
    value={{
      supabase: mockSupabase,
      session: supabaseUser ? { ...mockSession, user: supabaseUser } : null,
      isLoading: false,
    }}
  >
    {children}
  </SupabaseContext.Provider>
);

// --- Mock Analytics Provider at module level ---
jest.mock('@/lib/analytics/analytics-provider', () => ({
  useAnalytics: () => ({
    trackEvent: () => {},
    trackPageView: () => {},
    trackError: () => {},
    trackTiming: () => {},
  }),
}));

// Helper to wrap components in MockSupabaseProvider only
const customRender = (ui: React.ReactElement) => {
  return render(<MockSupabaseProvider>{ui}</MockSupabaseProvider>);
};

describe('RecognitionForm', () => {
  beforeEach(() => {
    supabaseUser = mockSupabaseUser;
  });

  it('renders and submits recognition', async () => {
    customRender(<RecognitionForm recipientId="recipient123" />);
    // Wait for user to be loaded (form enabled)
    await waitFor(() => {
      expect(screen.queryByText(/must be logged in/i)).not.toBeInTheDocument();
    });
    const textarea = screen.getByLabelText(/recognition message/i);
    fireEvent.change(textarea, { target: { value: 'Great job on the project!' } });
    const button = screen.getByRole('button', { name: /send recognition/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/recognition sent!/i)).toBeInTheDocument();
    });
  });

  it('shows error if message is empty', async () => {
    customRender(<RecognitionForm recipientId="recipient123" />);
    // Wait for user to be loaded (form enabled)
    await waitFor(() => {
      expect(screen.queryByText(/must be logged in/i)).not.toBeInTheDocument();
    });
    const button = screen.getByRole('button', { name: /send recognition/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('shows login message when user is not authenticated', async () => {
    supabaseUser = null;
    customRender(<RecognitionForm recipientId="recipient123" />);
    await waitFor(() => {
      expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
    });
  });
});
