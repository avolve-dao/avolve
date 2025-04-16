import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GET, POST, PATCH } from '../route';

// Create mock query builder with proper typing
const mockSupabaseQuery = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn(),
  update: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis()
};

// Mock Supabase client with proper typing
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn().mockReturnValue(mockSupabaseQuery)
};

// Mock dependencies
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data: Record<string, unknown>, options?: { status?: number }) => ({ ...data, ...(options || {}) }))
  }
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => mockSupabase)
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn()
}));

describe('Consent API', () => {
  let mockRequest: any;

  beforeEach(() => {
    // Reset all mocks before each test
    mockSupabase.from.mockClear();
    mockSupabaseQuery.select.mockClear();
    mockSupabaseQuery.eq.mockClear();
    mockSupabaseQuery.gte.mockClear();
    mockSupabaseQuery.lte.mockClear();
    mockSupabaseQuery.order.mockClear();
    mockSupabaseQuery.insert.mockClear();
    mockSupabaseQuery.update.mockClear();
    mockSupabaseQuery.single.mockClear();
    
    // Setup default mock implementations
    mockSupabase.from.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.select.mockReturnThis();
    mockSupabaseQuery.eq.mockReturnThis();
    mockSupabaseQuery.gte.mockReturnThis();
    mockSupabaseQuery.lte.mockReturnThis();
    mockSupabaseQuery.order.mockReturnThis();
    mockSupabaseQuery.insert.mockReturnThis();
    mockSupabaseQuery.update.mockReturnThis();
    mockSupabaseQuery.single.mockReturnThis();
    
    // Reset NextResponse.json mock
    (NextResponse.json as any).mockImplementation((data: Record<string, unknown>, options?: { status?: number }) => ({ ...data, ...(options || {}) }));
    
    vi.clearAllMocks();
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
    
    // Setup request mock with headers
    mockRequest = {
      json: vi.fn(),
      headers: {
        get: vi.fn().mockImplementation(header => {
          if (header === 'user-agent') return 'test-user-agent';
          if (header === 'x-forwarded-for') return '127.0.0.1';
          if (header === 'x-real-ip') return '127.0.0.2';
          return null;
        })
      },
      nextUrl: {
        searchParams: new URLSearchParams({
          interaction_type: 'governance_proposal',
          status: 'approved',
          from_date: '2025-01-01',
          to_date: '2025-12-31'
        })
      }
    };
  });
  
  describe('POST /api/consent', () => {
    it('should create a new consent record', async () => {
      // Mock request
      mockRequest.json = vi.fn().mockResolvedValue({
        interaction_type: 'governance_proposal',
        terms: { action: 'create', title: 'Test Proposal' },
        status: 'pending'
      });
      
      // Mock successful insert
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          consent_id: 'test-consent-id',
          user_id: 'test-user-id',
          interaction_type: 'governance_proposal',
          terms: { action: 'create', title: 'Test Proposal' },
          status: 'pending',
          metadata: {
            ip_address: '127.0.0.1',
            user_agent: 'test-user-agent'
          }
        },
        error: null
      });
      
      // Call the POST function
      const response = await POST(mockRequest as unknown as NextRequest);
      
      // Verify user authentication check
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      
      // Verify request body parsing
      expect(mockRequest.json).toHaveBeenCalled();
      
      // Verify insert
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        interaction_type: 'governance_proposal',
        terms: { action: 'create', title: 'Test Proposal' },
        status: 'pending',
        metadata: expect.objectContaining({
          ip_address: expect.any(String),
          user_agent: expect.any(String)
        })
      });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Consent recorded successfully',
        record: expect.objectContaining({
          consent_id: 'test-consent-id',
          user_id: 'test-user-id',
          interaction_type: 'governance_proposal'
        })
      }, { status: 200 });
      
      // Verify response structure matches what NextResponse.json returns
      expect(response).toEqual({
        success: true,
        message: 'Consent recorded successfully',
        record: expect.objectContaining({
          consent_id: 'test-consent-id',
          user_id: 'test-user-id',
          interaction_type: 'governance_proposal'
        }),
        status: 200
      });
    });
    
    it('should handle unauthenticated requests', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });
    
    it('should handle missing required fields', async () => {
      // Mock request with missing fields
      mockRequest.json = vi.fn().mockResolvedValue({
        // Missing interaction_type
        terms: { action: 'create' }
      });
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    });
    
    it('should handle database errors', async () => {
      // Mock request
      mockRequest.json = vi.fn().mockResolvedValue({
        interaction_type: 'governance_proposal',
        terms: { action: 'create' },
        status: 'approved'
      });
      
      // Mock database error
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      await POST(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to record consent' },
        { status: 500 }
      );
    });
  });
  
  describe('GET /api/consent', () => {
    it('should retrieve consent records with filters', async () => {
      // Setup request mock with query parameters
      mockRequest.nextUrl = {
        searchParams: new URLSearchParams({
          interaction_type: 'governance_proposal',
          status: 'approved',
          from_date: '2025-01-01',
          to_date: '2025-12-31'
        })
      };
      
      // Mock successful query result with proper data structure
      const mockData = [
        {
          id: 1,
          consent_id: 'test-consent-id-1',
          interaction_type: 'governance_proposal',
          user_id: 'test-user-id',
          created_at: '2025-01-01T00:00:00.000Z',
          status: 'approved'
        },
        {
          id: 2,
          consent_id: 'test-consent-id-2',
          interaction_type: 'governance_proposal',
          user_id: 'test-user-id',
          created_at: '2025-01-02T00:00:00.000Z',
          status: 'approved'
        }
      ];
      
      // Setup the mock to return the data
      const mockQueryResponse = { data: mockData, error: null };
      mockSupabaseQuery.select.mockReturnThis();
      mockSupabaseQuery.eq.mockReturnThis();
      mockSupabaseQuery.gte.mockReturnThis();
      mockSupabaseQuery.lte.mockReturnThis();
      mockSupabaseQuery.order.mockReturnValue(mockQueryResponse);
      
      // Call the GET function
      const response = await GET(mockRequest as unknown as NextRequest);
      
      // Verify query building with filters
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('interaction_type', 'governance_proposal');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'approved');
      expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('created_at', '2025-01-01T00:00:00.000Z');
      expect(mockSupabaseQuery.lte).toHaveBeenCalledWith('created_at', '2025-12-31T23:59:59.999Z');
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        records: mockData
      }, { status: 200 });
      
      // Verify response structure matches what NextResponse.json returns
      expect(response).toEqual({
        success: true,
        records: mockData,
        status: 200
      });
    });
  });
  
  describe('PATCH /api/consent/:id', () => {
    it('should update a consent record', async () => {
      // Mock request
      mockRequest.json = vi.fn().mockResolvedValue({
        consent_id: 'test-consent-id',
        status: 'revoked',
        metadata: { reason: 'Changed my mind' }
      });
      
      // Mock params
      const mockParams = { id: 'test-consent-id' };
      
      // Mock existing consent check
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { user_id: 'test-user-id' },
        error: null
      });
      
      // Mock successful update
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          user_id: 'test-user-id',
          consent_id: 'test-consent-id',
          status: 'revoked',
          metadata: { reason: 'Changed my mind' }
        },
        error: null
      });
      
      // Call the PATCH function
      const response = await PATCH(mockRequest as unknown as NextRequest);
      
      // Verify consent ownership check
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('user_id');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('consent_id', 'test-consent-id');
      
      // Verify update
      expect(mockSupabase.from).toHaveBeenCalledWith('user_consent');
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({ status: 'revoked' });
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('consent_id', 'test-consent-id');
      
      // Verify response
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Consent record updated successfully'
      }, { status: 200 });
      
      // Verify response structure matches what NextResponse.json returns
      expect(response).toEqual({
        success: true,
        message: 'Consent record updated successfully',
        status: 200
      });
    });
    
    it('should prevent updating another user\'s consent', async () => {
      // Mock request
      mockRequest.json = vi.fn().mockResolvedValue({
        consent_id: 'test-consent-id',
        status: 'revoked'
      });
      
      // Mock params
      const mockParams = { id: 'test-consent-id' };
      
      // Mock successful query for ownership check
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          user_id: 'another-user-id',
          consent_id: 'test-consent-id',
          status: 'approved'
        },
        error: null
      });
      
      // Call the PATCH function
      const response = await PATCH(mockRequest as unknown as NextRequest);
      
      // Verify error response
      expect(NextResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only update your own consent records'
      }, { status: 403 });
      
      // Verify response structure matches what NextResponse.json returns
      expect(response).toEqual({
        error: 'Forbidden',
        message: 'You can only update your own consent records',
        status: 403
      });
    });
  });
});
