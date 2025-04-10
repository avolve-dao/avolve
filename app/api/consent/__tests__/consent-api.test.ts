import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { POST, GET, PATCH } from '../route';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define types for mocks
type MockSupabaseQuery = {
  insert: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  mockResolvedValueOnce: (value: any) => any;
};

type MockSupabase = {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
};

// Mock dependencies
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options }))
  }
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => mockSupabase)
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn()
}));

// Create mock query builder with proper typing
const mockSupabaseQuery: MockSupabaseQuery = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  mockResolvedValueOnce: vi.fn()
};

// Add the mockResolvedValueOnce method to the mockSupabaseQuery
mockSupabaseQuery.mockResolvedValueOnce = vi.fn();

// Mock Supabase client with proper typing
const mockSupabase: MockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn().mockReturnValue(mockSupabaseQuery)
};

describe('Consent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });
  
  describe('POST /api/consent', () => {
    it('should create a new consent record', async () => {
      // Mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          interaction_type: 'governance_proposal',
          terms: { action: 'create', title: 'Test Proposal' },
          status: 'approved'
        }),
        ip: '127.0.0.1',
        headers: {
          get: vi.fn().mockImplementation(header => {
            if (header === 'user-agent') return 'test-user-agent';
            if (header === 'x-forwarded-for') return '127.0.0.1';
            return null;
          })
        }
      };
      
      // Mock successful insert
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { consent_id: 'test-consent-id' },
        error: null
      });
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify user authentication check
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      
      // Verify request body parsing
      expect(mockRequest.json).toHaveBeenCalled();
      
      // Verify consent record insertion
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'test-user-id',
        interaction_type: 'governance_proposal',
        terms: { action: 'create', title: 'Test Proposal' },
        status: 'approved',
        metadata: expect.objectContaining({
          ip_address: '127.0.0.1',
          user_agent: 'test-user-agent'
        })
      }));
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Consent recorded successfully',
        consent_id: 'test-consent-id'
      });
    });
    
    it('should handle unauthenticated requests', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });
      
      await POST({} as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized', message: 'You must be logged in to record consent' },
        { status: 401 }
      );
    });
    
    it('should handle missing required fields', async () => {
      // Mock request with missing fields
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          // Missing interaction_type
          terms: { action: 'create' }
        }),
        ip: '127.0.0.1',
        headers: {
          get: vi.fn().mockReturnValue('test-user-agent')
        }
      };
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Bad Request', message: 'Missing required fields: interaction_type, terms' },
        { status: 400 }
      );
    });
    
    it('should handle database errors', async () => {
      // Mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          interaction_type: 'governance_proposal',
          terms: { action: 'create' },
          status: 'approved'
        }),
        ip: '127.0.0.1',
        headers: {
          get: vi.fn().mockReturnValue('test-user-agent')
        }
      };
      
      // Mock database error
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database Error', message: 'Failed to record consent' },
        { status: 500 }
      );
    });
  });
  
  describe('GET /api/consent', () => {
    it('should retrieve consent records with filters', async () => {
      // Mock request with query parameters
      const mockRequest = {
        nextUrl: {
          searchParams: {
            get: vi.fn().mockImplementation(param => {
              if (param === 'interaction_type') return 'governance_proposal';
              if (param === 'status') return 'approved';
              if (param === 'from') return '2025-01-01';
              if (param === 'to') return '2025-12-31';
              return null;
            })
          }
        }
      };
      
      // Mock successful query result
      const mockData = [
        { consent_id: 'test-consent-id-1', interaction_type: 'governance_proposal' },
        { consent_id: 'test-consent-id-2', interaction_type: 'governance_proposal' }
      ];
      
      // Setup the mock to return the data
      mockSupabaseQuery.mockResolvedValueOnce({
        data: mockData,
        error: null
      });
      
      // Call the GET function
      await GET(mockRequest as unknown as NextRequest);
      
      // Verify query building with filters
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('interaction_type', 'governance_proposal');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'approved');
      expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('created_at', '2025-01-01');
      expect(mockSupabaseQuery.lte).toHaveBeenCalledWith('created_at', '2025-12-31');
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      
      // Mock the NextResponse.json implementation to actually use the data
      (NextResponse.json as any).mockImplementation((data) => data);
      
      // Call the GET function again to get the actual response
      const response = await GET(mockRequest as unknown as NextRequest);
      
      // Verify response structure
      expect(response).toEqual({
        success: true,
        records: mockData
      });
    });
  });
  
  describe('PATCH /api/consent/:id', () => {
    it('should update a consent record', async () => {
      // Mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          status: 'revoked',
          metadata: { reason: 'Changed my mind' }
        })
      };
      
      // Mock params
      const mockParams = { id: 'test-consent-id' };
      
      // Mock existing consent check
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { user_id: 'test-user-id' },
        error: null
      });
      
      // Mock successful update
      mockSupabaseQuery.mockResolvedValueOnce({
        error: null
      });
      
      await PATCH(mockRequest as unknown as NextRequest, { params: mockParams });
      
      // Verify consent ownership check
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('user_id');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('consent_id', 'test-consent-id');
      
      // Verify update
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'revoked',
        metadata: { reason: 'Changed my mind' }
      }));
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Consent record updated successfully'
      });
    });
    
    it('should prevent updating another user\'s consent', async () => {
      // Mock request
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          status: 'revoked'
        })
      };
      
      // Mock params
      const mockParams = { id: 'test-consent-id' };
      
      // Mock existing consent check - different user
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { user_id: 'different-user-id' },
        error: null
      });
      
      await PATCH(mockRequest as unknown as NextRequest, { params: mockParams });
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Forbidden', message: 'You can only update your own consent records' },
        { status: 403 }
      );
    });
  });
});
