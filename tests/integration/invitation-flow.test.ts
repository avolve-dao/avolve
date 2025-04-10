/**
 * Integration tests for the invitation flow
 * 
 * These tests verify the end-to-end flow of creating an invitation,
 * redeeming it, and signing up with the invitation code.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InvitationService } from '../../lib/invitation/invitation-service';
import { v4 as uuidv4 } from 'uuid';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const originalModule = vi.importActual('@supabase/supabase-js');
  
  // Mock data
  const mockUsers = new Map();
  const mockInvitations = new Map();
  const mockUserBalances = new Map();
  
  // Mock client
  const mockClient = {
    auth: {
      signUp: vi.fn(async ({ email, password, options }) => {
        const userId = options?.data?.user_id || uuidv4();
        mockUsers.set(userId, { id: userId, email, password });
        return { data: { user: { id: userId, email } }, error: null };
      }),
      signIn: vi.fn(async ({ email, password }) => {
        const user = Array.from(mockUsers.values()).find(u => u.email === email && u.password === password);
        if (user) {
          return { data: { user }, error: null };
        }
        return { data: null, error: { message: 'Invalid login credentials' } };
      }),
      getUser: vi.fn(() => {
        return { data: { user: { id: 'test-user-id', email: 'test@example.com' } } };
      }),
      getSession: vi.fn(() => {
        return { data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } } };
      })
    },
    from: vi.fn((table) => {
      return {
        select: vi.fn(() => {
          return {
            eq: vi.fn(() => {
              if (table === 'invitation_tiers') {
                return {
                  single: vi.fn(() => {
                    return { 
                      data: { 
                        id: 'test-tier-id', 
                        tier_name: 'Standard', 
                        token_cost: 10,
                        token_type: 'GEN',
                        max_invites: 5,
                        validity_days: 7,
                        reward_multiplier: 1.0
                      }, 
                      error: null 
                    };
                  })
                };
              } else if (table === 'invitations') {
                return {
                  single: vi.fn(() => {
                    return { 
                      data: Array.from(mockInvitations.values())[0] || null, 
                      error: mockInvitations.size === 0 ? { message: 'No invitation found' } : null 
                    };
                  })
                };
              } else if (table === 'user_balances') {
                return {
                  data: Array.from(mockUserBalances.values()),
                  error: null
                };
              }
              return { data: null, error: null };
            }),
            single: vi.fn(() => {
              if (table === 'tokens') {
                return { 
                  data: { 
                    id: 'test-token-id', 
                    name: 'Genesis Token', 
                    symbol: 'GEN',
                    is_active: true
                  }, 
                  error: null 
                };
              }
              return { data: null, error: null };
            })
          };
        }),
        insert: vi.fn((data) => {
          if (table === 'invitations') {
            const invitation = { 
              id: uuidv4(), 
              ...data, 
              created_at: new Date().toISOString(),
              status: 'CREATED'
            };
            mockInvitations.set(invitation.id, invitation);
            return { data: invitation, error: null };
          } else if (table === 'user_balances') {
            const balance = { id: uuidv4(), ...data };
            mockUserBalances.set(balance.id, balance);
            return { data: balance, error: null };
          }
          return { data: null, error: null };
        }),
        update: vi.fn(() => {
          return {
            eq: vi.fn(() => {
              return { data: { updated: true }, error: null };
            })
          };
        })
      };
    }),
    rpc: vi.fn((functionName, params) => {
      if (functionName === 'create_invitation') {
        const invitation = {
          id: uuidv4(),
          code: 'TEST' + Math.floor(Math.random() * 10000),
          tier_id: params.p_tier_id,
          created_by: 'test-user-id',
          created_at: new Date().toISOString(),
          status: 'CREATED'
        };
        mockInvitations.set(invitation.id, invitation);
        return { data: { success: true, invitation }, error: null };
      } else if (functionName === 'redeem_invitation') {
        const invitation = Array.from(mockInvitations.values()).find(inv => inv.code === params.p_code);
        if (invitation) {
          invitation.status = 'REDEEMED';
          invitation.redeemed_at = new Date().toISOString();
          return { data: { success: true, invitation }, error: null };
        }
        return { data: null, error: { message: 'Invalid invitation code' } };
      }
      return { data: null, error: null };
    })
  };
  
  return {
    ...originalModule,
    createClient: vi.fn(() => mockClient)
  };
});

describe('Invitation Flow', () => {
  let supabase: SupabaseClient;
  let invitationService: InvitationService;
  
  beforeAll(() => {
    // Create a mock Supabase client
    supabase = createClient('https://example.com', 'fake-key');
    
    // Initialize the invitation service
    invitationService = new InvitationService(supabase);
  });
  
  describe('Creating an invitation', () => {
    it('should successfully create a new invitation', async () => {
      // Create an invitation
      const { data, error } = await invitationService.createInvitation('test-tier-id');
      
      // Verify the result
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.code).toBeDefined();
      expect(data?.tier_id).toBe('test-tier-id');
      expect(data?.status).toBe('CREATED');
    });
    
    it('should handle errors when creating an invitation', async () => {
      // Mock a failure in the RPC call
      (supabase.rpc as any).mockImplementationOnce(() => {
        return { data: null, error: { message: 'Failed to create invitation' } };
      });
      
      // Attempt to create an invitation
      const { data, error } = await invitationService.createInvitation('test-tier-id');
      
      // Verify the result
      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Failed to create invitation');
    });
  });
  
  describe('Redeeming an invitation', () => {
    let invitationCode: string;
    
    beforeEach(async () => {
      // Create an invitation to use in tests
      const { data } = await invitationService.createInvitation('test-tier-id');
      invitationCode = data?.code || '';
    });
    
    it('should successfully redeem a valid invitation code', async () => {
      // Redeem the invitation
      const { data, error } = await invitationService.redeemInvitation(invitationCode);
      
      // Verify the result
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.success).toBe(true);
    });
    
    it('should handle invalid invitation codes', async () => {
      // Attempt to redeem an invalid code
      const { data, error } = await invitationService.redeemInvitation('INVALID-CODE');
      
      // Verify the result
      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Invalid invitation code');
    });
  });
  
  describe('Signing up with an invitation', () => {
    let invitationCode: string;
    
    beforeEach(async () => {
      // Create an invitation to use in tests
      const { data } = await invitationService.createInvitation('test-tier-id');
      invitationCode = data?.code || '';
    });
    
    it('should successfully sign up with a valid invitation code', async () => {
      // Sign up with the invitation code
      const { data, error } = await invitationService.signUpWithInvitation({
        email: 'newuser@example.com',
        password: 'password123',
        invitation_code: invitationCode
      });
      
      // Verify the result
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.user).toBeDefined();
      expect(data?.user.email).toBe('newuser@example.com');
    });
    
    it('should handle errors during sign up', async () => {
      // Mock a failure in sign up
      (supabase.auth.signUp as any).mockImplementationOnce(() => {
        return { data: null, error: { message: 'Email already in use' } };
      });
      
      // Attempt to sign up
      const { data, error } = await invitationService.signUpWithInvitation({
        email: 'existing@example.com',
        password: 'password123',
        invitation_code: invitationCode
      });
      
      // Verify the result
      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Email already in use');
    });
  });
  
  describe('Claiming invitation rewards', () => {
    let invitationCode: string;
    
    beforeEach(async () => {
      // Create an invitation and redeem it
      const { data: invitationData } = await invitationService.createInvitation('test-tier-id');
      invitationCode = invitationData?.code || '';
      
      await invitationService.redeemInvitation(invitationCode);
    });
    
    it('should successfully claim invitation rewards', async () => {
      // Claim the rewards
      const { data, error } = await invitationService.claimInvitationReward('test-user-id', {
        invitation_code: invitationCode
      });
      
      // Verify the result
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.success).toBe(true);
    });
    
    it('should handle errors when claiming rewards', async () => {
      // Mock a failure in the RPC call
      (supabase.rpc as any).mockImplementationOnce(() => {
        return { data: null, error: { message: 'Invitation already claimed' } };
      });
      
      // Attempt to claim rewards
      const { data, error } = await invitationService.claimInvitationReward('test-user-id', {
        invitation_code: invitationCode
      });
      
      // Verify the result
      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Invitation already claimed');
    });
  });
});
