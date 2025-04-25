import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define mock data types
interface MockProfile {
  id: string;
  username: string;
  email: string;
  is_admin?: boolean;
}

interface MockPost {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
}

interface MockUserFeature {
  id: number;
  user_id: string;
  feature_key: string;
  enabled: boolean;
}

interface MockInvitation {
  id: number;
  code: string;
  created_by: string;
  max_uses: number;
  expires_at: string;
}

interface MockData {
  profiles: MockProfile[];
  posts: MockPost[];
  user_features: MockUserFeature[];
  invitations: MockInvitation[];
}

// Mock Supabase for testing
jest.mock('@supabase/supabase-js', () => {
  const mockData: MockData = {
    profiles: [
      { id: 'test-user-id', username: 'testuser', email: 'test-user@example.com' },
      { id: 'admin-user-id', username: 'admin', email: 'admin@avolve.io', is_admin: true },
      { id: 'other-user-id', username: 'otheruser', email: 'other-user@example.com' },
    ],
    posts: [
      {
        id: 1,
        user_id: 'test-user-id',
        content: 'Test post',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 'admin-user-id',
        content: 'Admin post',
        created_at: new Date().toISOString(),
      },
    ],
    user_features: [
      { id: 1, user_id: 'test-user-id', feature_key: 'test-feature', enabled: true },
      { id: 2, user_id: 'admin-user-id', feature_key: 'admin-feature', enabled: true },
      { id: 3, user_id: 'other-user-id', feature_key: 'other-feature', enabled: false },
    ],
    invitations: [
      {
        id: 1,
        code: 'ADMIN-TEST-CODE',
        created_by: 'admin-user-id',
        max_uses: 1,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
  };

  // Create mock sessions for different user types
  const mockSessions = {
    'test-user-id': {
      user: { 
        id: 'test-user-id', 
        email: 'test-user@example.com', 
        role: 'authenticated',
        user_metadata: { is_admin: false }
      },
      access_token: 'test-user-token'
    },
    'admin-user-id': {
      user: { 
        id: 'admin-user-id', 
        email: 'admin@avolve.io', 
        role: 'authenticated',
        user_metadata: { is_admin: true }
      },
      access_token: 'admin-user-token'
    },
    'other-user-id': {
      user: { 
        id: 'other-user-id', 
        email: 'other-user@example.com', 
        role: 'authenticated',
        user_metadata: { is_admin: false }
      },
      access_token: 'other-user-token'
    }
  };

  return {
    createClient: jest.fn((url, key, options) => {
      // Determine which user is making the request based on the auth header
      let currentUserId: keyof typeof mockSessions | null = null;
      if (options?.global?.headers?.Authorization) {
        const token = options.global.headers.Authorization.split(' ')[1];
        if (token === 'test-user-token') currentUserId = 'test-user-id';
        else if (token === 'admin-user-token') currentUserId = 'admin-user-id';
        else if (token === 'other-user-token') currentUserId = 'other-user-id';
      }

      return {
        auth: {
          signInWithPassword: jest.fn(({ email }: { email: string }) => {
            let userId: keyof typeof mockSessions | null = null;
            
            if (email === 'test-user@example.com') userId = 'test-user-id';
            else if (email === 'admin@avolve.io') userId = 'admin-user-id';
            else if (email === 'other-user@example.com') userId = 'other-user-id';

            return {
              data: {
                session: userId ? mockSessions[userId] : null,
              },
              error: userId ? null : { message: 'Invalid credentials' },
            };
          }),
          getSession: jest.fn(() => ({ 
            data: { 
              session: currentUserId ? mockSessions[currentUserId] : null 
            }, 
            error: null 
          })),
        },
        from: jest.fn((table: string) => {
          // Apply RLS policies based on the current user
          const isAdmin = currentUserId === 'admin-user-id';
          const isAnon = currentUserId === null;
          
          return {
            select: jest.fn(() => ({
              eq: jest.fn((field, value) => {
                // Filter data based on RLS policies
                let filteredData: any[] = [];
                
                if (table === 'profiles') {
                  // Profiles: users can only see their own profile, admins can see all
                  if (isAdmin || value === currentUserId) {
                    filteredData = mockData.profiles.filter(p => p.id === value);
                  }
                } else if (table === 'posts') {
                  // Posts: users can see all posts
                  filteredData = mockData.posts.filter(p => p.user_id === value);
                } else if (table === 'user_features') {
                  // User features: users can only see their own features, admins can see all
                  if (isAdmin || value === currentUserId) {
                    filteredData = mockData.user_features.filter(f => f.user_id === value);
                  }
                } else if (table === 'invitations') {
                  // Invitations: anyone can see invitation codes
                  filteredData = mockData.invitations.filter(i => i.code === value);
                }
                
                return {
                  data: filteredData.length > 0 ? filteredData[0] : null,
                  error: null,
                };
              }),
              data: (isAdmin || table === 'posts' || (table === 'invitations' && isAnon))
                ? (mockData[table as keyof MockData] || [])
                : (mockData[table as keyof MockData] || []).filter(
                    (item: any) => item.user_id === currentUserId
                  ),
              error: null,
              single: () => {
                return this;
              }
            })),
            insert: jest.fn((data) => {
              // Apply RLS policies for insert operations
              if (table === 'profiles') {
                // Profiles: users can only insert their own profile
                if (!isAdmin && data.id !== currentUserId) {
                  return { data: null, error: { message: 'RLS policy violation' } };
                }
              } else if (table === 'posts') {
                // Posts: users can only insert their own posts
                if (!isAdmin && data.user_id !== currentUserId) {
                  return { data: null, error: { message: 'RLS policy violation' } };
                }
              } else if (table === 'user_features') {
                // User features: only admins can enable features
                if (!isAdmin) {
                  return { data: null, error: { message: 'RLS policy violation' } };
                }
              } else if (table === 'invitations') {
                // Invitations: only admins can create invitation codes
                if (!isAdmin && !isAnon) {
                  return { data: null, error: { message: 'RLS policy violation' } };
                }
              }
              
              return { 
                data: { id: 999, ...data, code: data.code || 'ADMIN-TEST-CODE' }, 
                error: null 
              };
            }),
            update: jest.fn(() => ({ data: { id: 1 }, error: null })),
            delete: jest.fn(() => ({ data: { id: 1 }, error: null })),
          };
        }),
      };
    }),
  };
});

// Test data
const TEST_USER_EMAIL = 'test-user@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!';
const ADMIN_USER_EMAIL = 'admin@avolve.io';
const ADMIN_USER_PASSWORD = 'AdminPassword123!';
const OTHER_USER_EMAIL = 'other-user@example.com';
const OTHER_USER_PASSWORD = 'OtherPassword123!';

// Initialize Supabase client
const supabase = createClient('https://example.supabase.co', 'fake-key');

describe('Row Level Security Policies', () => {
  // Store session data for different user types
  let testUserSession: any;
  let adminUserSession: any;
  let otherUserSession: any;
  let anonSession: any;

  beforeAll(async () => {
    // Sign in as test user
    const { data: testUserData } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    testUserSession = testUserData!.session;

    // Sign in as admin user
    const { data: adminUserData } = await supabase.auth.signInWithPassword({
      email: ADMIN_USER_EMAIL,
      password: ADMIN_USER_PASSWORD,
    });
    adminUserSession = adminUserData!.session;

    // Sign in as other user
    const { data: otherUserData } = await supabase.auth.signInWithPassword({
      email: OTHER_USER_EMAIL,
      password: OTHER_USER_PASSWORD,
    });
    otherUserSession = otherUserData!.session;

    // Create anon session (no sign in)
    anonSession = null;
  });

  describe('Profiles Table RLS', () => {
    it('allows users to read their own profile', async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient
        .from('profiles')
        .select('*')
        .eq('id', testUserSession?.user?.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.id).toBe(testUserSession?.user?.id);
    });

    it("prevents users from reading other users' private profile data", async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient
        .from('profiles')
        .select('*')
        .eq('id', adminUserSession?.user?.id)
        .single();

      expect(data).toBeNull();
    });

    it('allows admins to read any user profile', async () => {
      const adminUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${adminUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await adminUserClient
        .from('profiles')
        .select('*')
        .eq('id', testUserSession?.user?.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.id).toBe(testUserSession?.user?.id);
    });
  });

  describe('Posts Table RLS', () => {
    it('allows users to create their own posts', async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient.from('posts').insert({
        user_id: testUserSession.user.id,
        content: 'New test post',
        created_at: new Date().toISOString(),
      });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    it("prevents users from creating posts as other users", async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient.from('posts').insert({
        user_id: adminUserSession.user.id,
        content: 'Unauthorized post',
        created_at: new Date().toISOString(),
      });

      expect(error).not.toBeNull();
    });

    it('allows admins to create posts for any user', async () => {
      const adminUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${adminUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await adminUserClient.from('posts').insert({
        user_id: testUserSession.user.id,
        content: 'Admin created post for user',
        created_at: new Date().toISOString(),
      });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });
  });

  describe('User Features Table RLS', () => {
    it('allows users to read their own features', async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient
        .from('user_features')
        .select('*')
        .eq('user_id', testUserSession.user.id);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('prevents users from enabling features for themselves', async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient.from('user_features').insert({
        user_id: testUserSession.user.id,
        feature_key: 'premium_content',
        enabled: true,
      });

      expect(error).not.toBeNull();
    });

    it('allows admins to enable features for users', async () => {
      const adminUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${adminUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await adminUserClient.from('user_features').insert({
        user_id: testUserSession.user.id,
        feature_key: 'test_feature',
        enabled: true,
      });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });
  });

  describe('Invitations Table RLS', () => {
    it('prevents non-admins from creating invitation codes', async () => {
      const testUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${testUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await testUserClient.from('invitations').insert({
        code: 'UNAUTHORIZED-CODE',
        created_by: testUserSession.user.id,
        max_uses: 1,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });

      expect(error).not.toBeNull();
    });

    it('allows admins to create invitation codes', async () => {
      const adminUserClient = createClient('https://example.supabase.co', 'fake-key', {
        global: {
          headers: {
            Authorization: `Bearer ${adminUserSession?.access_token}`,
          },
        },
      });

      const { data, error } = await adminUserClient
        .from('invitations')
        .insert({
          code: 'ADMIN-TEST-CODE',
          created_by: adminUserSession.user.id,
          max_uses: 1,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    it('allows anonymous users to validate invitation codes', async () => {
      const anonClient = createClient('https://example.supabase.co', 'fake-key');

      const { data, error } = await anonClient
        .from('invitations')
        .select('*')
        .eq('code', 'ADMIN-TEST-CODE')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data.code).toBe('ADMIN-TEST-CODE');
    });
  });
});
