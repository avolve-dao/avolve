import { NextRequest } from 'next/server'
import { POST } from '@/app/api/invitations/check/route'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/utils/rate-limit')

describe('Invitation Check API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock rate limit to always succeed
    const mockRateLimit = {
      check: jest.fn().mockResolvedValue({ success: true, remaining: 10, limit: 10 })
    }
    ;(rateLimit as jest.Mock).mockReturnValue(mockRateLimit)
  })
  
  it('should return 400 for invalid request format', async () => {
    // Create a mock request with invalid body
    const request = new NextRequest('http://localhost:3000/api/invitations/check', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Invalid request format')
  })
  
  it('should return 429 when rate limit is exceeded', async () => {
    // Mock rate limit to fail
    const mockRateLimit = {
      check: jest.fn().mockResolvedValue({ success: false, remaining: 0, limit: 10 })
    }
    ;(rateLimit as jest.Mock).mockReturnValue(mockRateLimit)
    
    const request = new NextRequest('http://localhost:3000/api/invitations/check', {
      method: 'POST',
      body: JSON.stringify({ code: 'VALID-CODE' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(429)
    
    const responseData = await response.json()
    expect(responseData.error).toContain('Rate limit exceeded')
  })
  
  it('should return 404 for invalid invitation code', async () => {
    // Mock Supabase to return an error
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            })
          })
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const request = new NextRequest('http://localhost:3000/api/invitations/check', {
      method: 'POST',
      body: JSON.stringify({ code: 'INVALID-CODE' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(404)
    
    const responseData = await response.json()
    expect(responseData.valid).toBe(false)
  })
  
  it('should return 200 for valid invitation code', async () => {
    // Mock valid invitation data
    const mockInvitationData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'VALID-CODE',
      expires_at: new Date(Date.now() + 86400000).toISOString() // 1 day in the future
    }
    
    // Mock Supabase to return success
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockInvitationData,
                error: null
              })
            })
          })
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const request = new NextRequest('http://localhost:3000/api/invitations/check', {
      method: 'POST',
      body: JSON.stringify({ code: 'VALID-CODE' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
    
    const responseData = await response.json()
    expect(responseData.valid).toBe(true)
    expect(responseData.invitation.id).toBe(mockInvitationData.id)
    expect(responseData.invitation.code).toBe(mockInvitationData.code)
  })
  
  it('should handle unexpected errors gracefully', async () => {
    // Mock Supabase to throw an error
    (createClient as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error')
    })
    
    const request = new NextRequest('http://localhost:3000/api/invitations/check', {
      method: 'POST',
      body: JSON.stringify({ code: 'VALID-CODE' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      }
    })
    
    const response = await POST(request)
    expect(response.status).toBe(500)
    
    const responseData = await response.json()
    expect(responseData.error).toBe('Internal server error')
  })
})
