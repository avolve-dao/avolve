/**
 * Mock implementation of Supabase client for testing
 * This mock simulates the behavior of the Supabase client in tests
 */

// Mock implementation of the Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'mock-user-id', email: 'test@example.com' } } },
      error: null
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'mock-user-id', email: 'test@example.com' } },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { 
        user: { id: 'mock-user-id', email: 'test@example.com' },
        session: { access_token: 'mock-token' }
      },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { 
        user: { id: 'mock-user-id', email: 'test@example.com' },
        session: { access_token: 'mock-token' }
      },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null
    }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Simulate an auth state change event
      callback('SIGNED_IN', {
        user: { id: 'mock-user-id', email: 'test@example.com' }
      });
      
      // Return an unsubscribe function
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    })
  },
  from: jest.fn().mockImplementation((table) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      // Mock responses for specific tables
      if (table === 'invitations') {
        return Promise.resolve({
          data: {
            code: 'TEST-INVITE-123',
            is_valid: true,
            max_uses: 1,
            current_uses: 0,
            expires_at: new Date(Date.now() + 86400000).toISOString() // 1 day in the future
          },
          error: null
        });
      }
      
      if (table === 'user_tokens') {
        return Promise.resolve({
          data: {
            user_id: 'test-user-id',
            token_type: 'community',
            amount: 15
          },
          error: null
        });
      }
      
      if (table === 'feature_flags') {
        return Promise.resolve({
          data: {
            feature_name: 'test_feature',
            required_tokens: { community: 10 },
            is_active: true
          },
          error: null
        });
      }
      
      // Default response
      return Promise.resolve({
        data: { id: 'mock-id' },
        error: null
      });
    }),
    then: jest.fn().mockImplementation((callback) => {
      return Promise.resolve(callback({
        data: [{ id: 'mock-id' }],
        error: null
      }));
    })
  })),
  storage: {
    from: jest.fn().mockImplementation((bucket) => ({
      upload: jest.fn().mockResolvedValue({
        data: { path: `${bucket}/mock-file.jpg` },
        error: null
      }),
      download: jest.fn().mockResolvedValue({
        data: new Blob(['mock file content']),
        error: null
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: `https://mock-storage.com/${bucket}/mock-file.jpg` }
      }),
      remove: jest.fn().mockResolvedValue({
        data: { path: `${bucket}/mock-file.jpg` },
        error: null
      }),
      list: jest.fn().mockResolvedValue({
        data: [{ name: 'mock-file.jpg' }],
        error: null
      })
    }))
  },
  rpc: jest.fn().mockImplementation((functionName, params) => {
    if (functionName === 'can_unlock_feature') {
      return Promise.resolve({
        data: {
          meets_requirements: true,
          required_tokens: { community: 10 },
          current_tokens: { community: 15 }
        },
        error: null
      });
    }
    
    if (functionName === 'unlock_feature') {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Feature unlocked successfully'
        },
        error: null
      });
    }
    
    return Promise.resolve({
      data: { result: 'mock-rpc-result' },
      error: null
    });
  })
};

// Export the createClient function that returns the mock client
export const createClient = jest.fn().mockImplementation(() => mockSupabaseClient);
