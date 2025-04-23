import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecognitionForm } from './RecognitionForm';
import { vi } from 'vitest';

// Mutable user variable for dynamic mocking
let supabaseUser: { id: string; email: string } | null = { id: 'user123', email: 'test@example.com' };

vi.mock('@/lib/supabase/use-supabase', () => ({
  useSupabase: () => ({
    supabase: { from: vi.fn().mockReturnThis(), insert: vi.fn().mockResolvedValue({ error: null }) },
    user: supabaseUser,
  }),
}));

vi.mock('@/lib/notifications/use-notifications', () => ({
  useNotifications: () => ({
    notify: vi.fn(),
    createNotification: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock('@/lib/analytics/use-recognition-analytics', () => ({
  useRecognitionAnalytics: () => ({
    trackRecognitionSent: vi.fn(),
  }),
}));

describe('RecognitionForm', () => {
  beforeEach(() => {
    supabaseUser = { id: 'user123', email: 'test@example.com' };
  });

  it('renders and submits recognition', async () => {
    render(<RecognitionForm recipientId="recipient123" />);
    const textarea = screen.getByLabelText(/recognition message/i);
    fireEvent.change(textarea, { target: { value: 'Great job on the project!' } });
    const button = screen.getByRole('button', { name: /send recognition/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/recognition sent!/i)).toBeInTheDocument();
    });
  });

  it('shows error if message is empty', async () => {
    render(<RecognitionForm recipientId="recipient123" />);
    const textarea = screen.getByLabelText(/recognition message/i);
    fireEvent.change(textarea, { target: { value: '   ' } }); // whitespace triggers .trim() validation
    const button = screen.getByRole('button', { name: /send recognition/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/recognition message cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('shows error if user is not logged in', async () => {
    supabaseUser = null;
    render(<RecognitionForm recipientId="recipient123" />);
    const textarea = screen.getByLabelText(/recognition message/i);
    fireEvent.change(textarea, { target: { value: 'Thanks!' } });
    const button = screen.getByRole('button', { name: /send recognition/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
    });
  });
});
