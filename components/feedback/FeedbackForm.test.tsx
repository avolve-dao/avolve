import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackForm } from './FeedbackForm';
import { createClient } from '@supabase/supabase-js';
import userEvent from '@testing-library/user-event';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({
            data: { id: 'feedback-id', created_at: new Date().toISOString() },
            error: null,
          })
        ),
      })),
    })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null,
        })
      ),
    },
  })),
}));

// Mock analytics tracking
jest.mock('@/lib/analytics/analytics-provider', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
    trackError: jest.fn(),
  }),
}));

describe('FeedbackForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the feedback form', () => {
    render(<FeedbackForm />);
    expect(screen.getByText(/share your feedback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/feedback type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your feedback/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
  });

  it('submits feedback successfully', async () => {
    render(<FeedbackForm />);
    
    // Fill out the form
    const typeSelect = screen.getByLabelText(/feedback type/i);
    fireEvent.change(typeSelect, { target: { value: 'suggestion' } });
    
    const feedbackInput = screen.getByLabelText(/your feedback/i);
    fireEvent.change(feedbackInput, { target: { value: 'This is a test suggestion' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty feedback', async () => {
    render(<FeedbackForm />);
    
    // Submit without filling out the form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/feedback is required/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<FeedbackForm />);

    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/feedback type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/feedback content is required/i)).toBeInTheDocument();
    });
  });

  it('submits feedback successfully', async () => {
    const user = userEvent.setup();
    render(<FeedbackForm />);

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/feedback type/i), 'feature_request');
    await user.type(
      screen.getByLabelText(/your feedback/i),
      'I would like to see more customization options'
    );

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));

    // Check that the form submission was successful
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });

    // Verify Supabase was called correctly
    expect(createClient().from).toHaveBeenCalledWith('feedback');
    expect(createClient().from().insert).toHaveBeenCalledWith({
      user_id: 'test-user-id',
      feedback_type: 'feature_request',
      content: 'I would like to see more customization options',
      source: 'web',
    });

    // Verify analytics was tracked
    const posthog = require('posthog-js');
    expect(posthog.capture).toHaveBeenCalledWith('feedback_submitted', {
      feedback_type: 'feature_request',
      source: 'web',
    });
  });

  it('handles submission errors gracefully', async () => {
    // Mock an error response
    (createClient().from().insert().select as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to submit feedback' },
    });

    const user = userEvent.setup();
    render(<FeedbackForm />);

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/feedback type/i), 'bug_report');
    await user.type(
      screen.getByLabelText(/your feedback/i),
      'The app crashes when I try to upload an image'
    );

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));

    // Check that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to submit feedback/i)).toBeInTheDocument();
    });
  });

  it('allows anonymous feedback submission when not logged in', async () => {
    // Mock user not logged in
    (createClient().auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const user = userEvent.setup();
    render(<FeedbackForm allowAnonymous={true} />);

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/feedback type/i), 'general');
    await user.type(screen.getByLabelText(/your feedback/i), 'Great platform overall!');

    // Check that email field is shown for anonymous users
    expect(screen.getByLabelText(/email \(optional\)/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/email \(optional\)/i), 'anonymous@example.com');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));

    // Check that the form submission was successful
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });

    // Verify Supabase was called with anonymous data
    expect(createClient().from().insert).toHaveBeenCalledWith({
      user_id: null,
      email: 'anonymous@example.com',
      feedback_type: 'general',
      content: 'Great platform overall!',
      source: 'web',
    });
  });
});
