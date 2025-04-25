import { checkFeatureEnabled, canUnlockFeature, unlockFeature } from './feature-flags';
import { createClient } from '@supabase/supabase-js';

// Mock the entire module
jest.mock('@supabase/supabase-js');

// Mock the createClient function
const mockCreateClient = createClient as jest.Mock;

describe('Feature Flag Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: { enabled: true },
      error: null
    });
    
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
    
    const mockRpc = jest.fn().mockImplementation((functionName) => {
      if (functionName === 'can_unlock_feature') {
        return Promise.resolve({
          data: {
            meets_requirements: true,
            required_tokens: { community: 10 },
            current_tokens: { community: 15 }
          },
          error: null
        });
      } else if (functionName === 'unlock_feature') {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Feature unlocked successfully'
          },
          error: null
        });
      }
      
      return Promise.resolve({
        data: null,
        error: null
      });
    });
    
    // Setup mock client
    mockCreateClient.mockReturnValue({
      from: mockFrom,
      rpc: mockRpc,
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null
        })
      }
    });
  });

  describe('checkFeatureEnabled', () => {
    it('should return true when feature is enabled for user', async () => {
      const result = await checkFeatureEnabled('test_feature', 'test-user-id');
      expect(result).toBe(true);
    });

    it('should return false when there is an error', async () => {
      // Setup mock response
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock client
      mockCreateClient.mockReturnValueOnce({
        from: mockFrom
      });
      
      const result = await checkFeatureEnabled('test_feature', 'test-user-id');
      expect(result).toBe(false);
    });
  });

  describe('canUnlockFeature', () => {
    it('should return true when user meets requirements', async () => {
      const result = await canUnlockFeature('test_feature', 'test-user-id');
      expect(result.meets_requirements).toBe(true);
      expect(result.required_tokens).toEqual({ community: 10 });
      expect(result.current_tokens).toEqual({ community: 15 });
    });

    it('should return false when there is an error', async () => {
      // Setup mock response
      const mockRpc = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValueOnce({
        rpc: mockRpc
      });
      
      const result = await canUnlockFeature('test_feature', 'test-user-id');
      expect(result.meets_requirements).toBe(false);
    });
  });

  describe('unlockFeature', () => {
    it('should return success when feature is unlocked', async () => {
      const result = await unlockFeature('test_feature', 'test-user-id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Feature unlocked successfully');
    });

    it('should return failure when there is an error', async () => {
      // Setup mock response
      const mockRpc = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Test error' }
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValueOnce({
        rpc: mockRpc
      });
      
      const result = await unlockFeature('test_feature', 'test-user-id');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Test error');
    });
  });
});
