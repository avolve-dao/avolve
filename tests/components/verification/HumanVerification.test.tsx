import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HumanVerification } from '@/components/verification/HumanVerification'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('@/lib/supabase/client')
jest.mock('@/components/ui/use-toast')
jest.mock('@/components/verification/CommunityPuzzle', () => ({
  CommunityPuzzle: ({ onComplete }: any) => (
    <div data-testid="community-puzzle">
      <button onClick={() => onComplete(25, { type: 'puzzle' })}>
        Complete Puzzle
      </button>
    </div>
  )
}))
jest.mock('@/components/verification/PatternChallenge', () => ({
  PatternChallenge: ({ onComplete }: any) => (
    <div data-testid="pattern-challenge">
      <button onClick={() => onComplete(25, { type: 'pattern' })}>
        Complete Pattern
      </button>
    </div>
  )
}))
jest.mock('@/components/verification/ImageVerification', () => ({
  ImageVerification: ({ onComplete }: any) => (
    <div data-testid="image-verification">
      <button onClick={() => onComplete(25, { type: 'image' })}>
        Complete Image
      </button>
    </div>
  )
}))

describe('HumanVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock useToast
    ;(useToast as jest.Mock).mockReturnValue({
      toast: jest.fn()
    })
    
    // Default Supabase mock implementation
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // No data found error
          })
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ is_verified: false }],
            error: null
          })
        }),
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      }
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })
  
  it('renders the verification component in pending state', async () => {
    render(<HumanVerification />)
    
    await waitFor(() => {
      // Check for main title
      expect(screen.getByText('Human Verification')).toBeInTheDocument()
      
      // Check for progress indicator
      expect(screen.getByText('0/100')).toBeInTheDocument()
      
      // Check for challenge tabs
      expect(screen.getByRole('tab', { name: /puzzle/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /pattern/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /image/i })).toBeInTheDocument()
      
      // Default tab should be active and visible
      expect(screen.getByTestId('community-puzzle')).toBeInTheDocument()
    })
  })
  
  it('renders completed state when user is already verified', async () => {
    // Mock Supabase to return verified user
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { is_verified: true },
            error: null
          })
        })
      })
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const onVerificationCompleteMock = jest.fn()
    render(<HumanVerification onVerificationComplete={onVerificationCompleteMock} />)
    
    await waitFor(() => {
      // Check for completed state
      expect(screen.getByText('Verification Complete')).toBeInTheDocument()
      
      // Callback should be called
      expect(onVerificationCompleteMock).toHaveBeenCalledWith(true)
      
      // Challenges should not be visible
      expect(screen.queryByTestId('community-puzzle')).not.toBeInTheDocument()
    })
  })
  
  it('updates score when challenge is completed', async () => {
    render(<HumanVerification />)
    
    await waitFor(() => {
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })
    
    // Complete a challenge
    fireEvent.click(screen.getByText('Complete Puzzle'))
    
    await waitFor(() => {
      // Score should be updated
      expect(screen.getByText('25/100')).toBeInTheDocument()
      
      // Toast should be shown
      expect(useToast().toast).toHaveBeenCalled()
    })
  })
  
  it('completes verification when score reaches required level', async () => {
    const onVerificationCompleteMock = jest.fn()
    render(<HumanVerification onVerificationComplete={onVerificationCompleteMock} requiredScore={75} />)
    
    // Complete multiple challenges to reach required score
    fireEvent.click(screen.getByText('Complete Puzzle'))
    
    await waitFor(() => {
      expect(screen.getByText('25/75')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Complete Puzzle'))
    
    await waitFor(() => {
      expect(screen.getByText('50/75')).toBeInTheDocument()
    })
    
    // This should complete verification
    fireEvent.click(screen.getByText('Complete Puzzle'))
    
    await waitFor(() => {
      // Callback should be called
      expect(onVerificationCompleteMock).toHaveBeenCalledWith(true)
      
      // Should show completed state
      expect(screen.getByText('Verification Complete')).toBeInTheDocument()
    })
  })
  
  it('handles Supabase errors gracefully', async () => {
    // Mock Supabase to return an error
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      })
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    render(<HumanVerification />)
    
    await waitFor(() => {
      // Should show error message
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })
  
  it('allows switching between challenge types', async () => {
    render(<HumanVerification />)
    
    await waitFor(() => {
      expect(screen.getByTestId('community-puzzle')).toBeInTheDocument()
    })
    
    // Switch to pattern challenge
    fireEvent.click(screen.getByRole('tab', { name: /pattern/i }))
    
    expect(screen.getByTestId('pattern-challenge')).toBeInTheDocument()
    expect(screen.queryByTestId('community-puzzle')).not.toBeInTheDocument()
    
    // Switch to image verification
    fireEvent.click(screen.getByRole('tab', { name: /image/i }))
    
    expect(screen.getByTestId('image-verification')).toBeInTheDocument()
    expect(screen.queryByTestId('pattern-challenge')).not.toBeInTheDocument()
  })
})
