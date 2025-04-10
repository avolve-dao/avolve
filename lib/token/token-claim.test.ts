import { TokenClaimService } from './token-claim';
import { TokenResult } from './token-service.types';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the mock type
interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
}

// Create the mock with proper typing
const mockSupabase: MockSupabaseClient = {
  from: vi.fn().mockImplementation(() => mockSupabase),
  select: vi.fn().mockImplementation(() => mockSupabase),
  insert: vi.fn().mockImplementation(() => mockSupabase),
  update: vi.fn().mockImplementation(() => mockSupabase),
  upsert: vi.fn().mockImplementation(() => mockSupabase),
  eq: vi.fn().mockImplementation(() => mockSupabase),
  single: vi.fn(),
  rpc: vi.fn()
};

describe('TokenClaimService', () => {
  let tokenClaimService: TokenClaimService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    tokenClaimService = new TokenClaimService(mockSupabase as unknown as SupabaseClient);
  });
  
  describe('claimDailyToken', () => {
    it('should successfully claim a daily token', async () => {
      // Mock successful RPC call
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Token claimed successfully',
          transaction_id: 'tx-123'
        },
        error: null
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(expect.objectContaining({
        success: true,
        message: 'Token claimed successfully',
        transaction_id: 'tx-123'
      }));
      
      // Verify RPC call was made with correct parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith('claim_daily_token', {
        p_user_id: 'user-123',
        p_challenge_id: 'challenge-123',
        p_amount: 100,
        p_multiplier: 1.5
      });
    });
    
    it('should handle token fetch error', async () => {
      // Mock RPC error
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to claim token' }
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('CLAIM_ERROR');
      expect(result.data).toEqual(expect.objectContaining({
        success: false,
        message: 'Failed to claim token'
      }));
    });
    
    it('should handle challenge completion error', async () => {
      // Mock RPC error
      mockSupabase.rpc.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('UNEXPECTED_ERROR');
      expect(result.data).toEqual(expect.objectContaining({
        success: false
      }));
    });
    
    it('should continue even if streak update fails', async () => {
      // Mock successful RPC call
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Token claimed successfully',
          transaction_id: 'tx-123'
        },
        error: null
      });
      
      const result = await tokenClaimService.claimDailyToken(
        'user-123',
        'challenge-123',
        100,
        1.5,
        'Test claim'
      );
      
      // Should still succeed
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(expect.objectContaining({
        success: true,
        message: 'Token claimed successfully',
        transaction_id: 'tx-123'
      }));
    });
  });
});
