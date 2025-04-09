import { TokenClaimService } from './token-claim';
import { TokenResult } from '@/lib/supabase/types';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  rpc: jest.fn()
};

describe('TokenClaimService', () => {
  let tokenClaimService: TokenClaimService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    tokenClaimService = new TokenClaimService(mockSupabase as any);
  });
  
  describe('claimDailyToken', () => {
    it('should successfully claim a daily token', async () => {
      // Mock successful token fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'token-123' },
        error: null
      });
      
      // Mock successful challenge completion
      mockSupabase.insert.mockResolvedValueOnce({
        data: { id: 'completion-123' },
        error: null
      });
      
      // Mock successful streak update
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { success: true },
        error: null
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        success: true,
        message: 'Token claimed successfully',
        transaction_id: 'completion-123'
      });
      
      // Verify token fetch was called
      expect(mockSupabase.from).toHaveBeenCalledWith('tokens');
      expect(mockSupabase.select).toHaveBeenCalled();
      
      // Verify challenge completion was recorded
      expect(mockSupabase.from).toHaveBeenCalledWith('challenge_completions');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        challenge_id: 'challenge-123',
        amount: 100,
        streak_multiplier: 1.5,
        completed_at: expect.any(String)
      });
      
      // Verify streak was updated
      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_challenge_streak', {
        p_user_id: 'user-123',
        p_challenge_id: 'challenge-123'
      });
    });
    
    it('should handle token fetch error', async () => {
      // Mock token fetch error
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Token not found' }
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('Failed to find token');
      expect(result.data).toBeNull();
    });
    
    it('should handle challenge completion error', async () => {
      // Mock successful token fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'token-123' },
        error: null
      });
      
      // Mock challenge completion error
      mockSupabase.insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to record completion' }
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('Failed to record challenge completion');
      expect(result.data).toBeNull();
    });
    
    it('should continue even if streak update fails', async () => {
      // Mock successful token fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'token-123' },
        error: null
      });
      
      // Mock successful challenge completion
      mockSupabase.insert.mockResolvedValueOnce({
        data: { id: 'completion-123' },
        error: null
      });
      
      // Mock streak update error
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to update streak' }
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      // Should still succeed even if streak update fails
      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        success: true,
        message: 'Token claimed successfully',
        transaction_id: 'completion-123'
      });
    });
  });
});
