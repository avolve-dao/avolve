import { signIn, signUp, signOut, resetPassword, validateInvitationCode, getSupabaseClient } from './auth-utils';
import { createClient } from '@supabase/supabase-js';

// Mock the entire module
jest.mock('@supabase/supabase-js');

// Mock the createClient function
const mockCreateClient = createClient as jest.Mock;

describe('Authentication Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      // Setup mock response
      const mockSignInWithPassword = jest.fn().mockResolvedValueOnce({
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword
        }
      });

      const result = await signIn('test@example.com', 'password123');

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        success: true,
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { access_token: 'mock-token' }
      });
    });

    it('should return error when sign in fails', async () => {
      // Setup mock response
      const mockSignInWithPassword = jest.fn().mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword
        }
      });

      const result = await signIn('wrong@example.com', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        error: 'Invalid login credentials',
      });
    });
  });

  describe('signUp', () => {
    it('should sign up a user successfully with valid invitation code', async () => {
      // Setup mock response for validateInvitationCode
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: {
          code: 'TEST-INVITE-123',
          is_valid: true,
          max_uses: 1,
          current_uses: 0,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock response for signUp
      const mockSignUp = jest.fn().mockResolvedValueOnce({
        data: { 
          user: { id: 'new-user-id', email: 'new-user@example.com' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          signUp: mockSignUp
        },
        from: mockFrom
      });

      const result = await signUp(
        'new-user@example.com', 
        'password123', 
        { name: 'Test User' },
        'TEST-INVITE-123'
      );

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new-user@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            invitation_code: 'TEST-INVITE-123',
          },
        },
      });

      expect(result).toEqual({
        success: true,
        user: { id: 'new-user-id', email: 'new-user@example.com' },
        session: { access_token: 'mock-token' }
      });
    });

    it('should return error when invitation code is invalid', async () => {
      // Setup mock response for validateInvitationCode
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Invitation code not found' },
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        from: mockFrom
      });

      const result = await signUp(
        'new-user@example.com', 
        'password123', 
        { name: 'Test User' },
        'INVALID-CODE'
      );

      expect(result).toEqual({
        success: false,
        error: 'Invalid invitation code',
      });
    });
  });

  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      // Setup mock response
      const mockSignOut = jest.fn().mockResolvedValueOnce({
        error: null,
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          signOut: mockSignOut
        }
      });

      const result = await signOut();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return error when sign out fails', async () => {
      // Setup mock response
      const mockSignOut = jest.fn().mockResolvedValueOnce({
        error: { message: 'Error signing out' },
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          signOut: mockSignOut
        }
      });

      const result = await signOut();

      expect(result).toEqual({
        success: false,
        error: 'Error signing out',
      });
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      // Setup mock response
      const mockResetPasswordForEmail = jest.fn().mockResolvedValueOnce({
        data: {},
        error: null,
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          resetPasswordForEmail: mockResetPasswordForEmail
        }
      });

      const result = await resetPassword('test@example.com');

      expect(mockResetPasswordForEmail).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return error when reset password fails', async () => {
      // Setup mock response
      const mockResetPasswordForEmail = jest.fn().mockResolvedValueOnce({
        data: {},
        error: { message: 'Email not found' },
      });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        auth: {
          resetPasswordForEmail: mockResetPasswordForEmail
        }
      });

      const result = await resetPassword('nonexistent@example.com');

      expect(result).toEqual({
        success: false,
        error: 'Email not found',
      });
    });
  });

  describe('validateInvitationCode', () => {
    it('should validate a valid invitation code', async () => {
      // Setup mock response
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: {
          code: 'TEST-INVITE-123',
          is_valid: true,
          max_uses: 1,
          current_uses: 0,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        from: mockFrom
      });

      const result = await validateInvitationCode('TEST-INVITE-123');

      expect(result).toEqual({
        isValid: true,
        invitation: {
          code: 'TEST-INVITE-123',
          is_valid: true,
          max_uses: 1,
          current_uses: 0,
          expires_at: expect.any(String),
        },
      });
    });

    it('should return invalid for expired invitation code', async () => {
      // Setup mock response
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: {
          code: 'EXPIRED-CODE',
          is_valid: true,
          max_uses: 1,
          current_uses: 0,
          expires_at: new Date(Date.now() - 86400000).toISOString(),
        },
        error: null,
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        from: mockFrom
      });

      const result = await validateInvitationCode('EXPIRED-CODE');

      expect(result).toEqual({
        isValid: false,
      });
    });

    it('should return invalid for fully used invitation code', async () => {
      // Setup mock response
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: {
          code: 'USED-CODE',
          is_valid: true,
          max_uses: 1,
          current_uses: 1,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        error: null,
      });
      
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Setup mock client
      mockCreateClient.mockReturnValue({
        from: mockFrom
      });

      const result = await validateInvitationCode('USED-CODE');

      expect(result).toEqual({
        isValid: false,
      });
    });
  });
});
