import { rateLimit } from '@/lib/utils/rate-limit'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock LRUCache
vi.mock('lru-cache', () => {
  return {
    LRUCache: vi.fn().mockImplementation(() => {
      const cache = new Map()
      return {
        get: vi.fn((key) => cache.get(key)),
        set: vi.fn((key, value) => cache.set(key, value)),
      }
    }),
  }
})

describe('Rate Limit Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests within the limit', async () => {
    const limiter = rateLimit({
      interval: 60 * 1000, // 1 minute
      limit: 5,
      uniqueTokenPerInterval: 100,
    })

    // First request should be allowed
    const result1 = await limiter.check('test-ip')
    expect(result1.success).toBe(true)
    expect(result1.limit).toBe(5)
    expect(result1.remaining).toBe(4)

    // Second request should be allowed
    const result2 = await limiter.check('test-ip')
    expect(result2.success).toBe(true)
    expect(result2.remaining).toBe(3)
  })

  it('should block requests over the limit', async () => {
    const limiter = rateLimit({
      interval: 60 * 1000, // 1 minute
      limit: 2,
      uniqueTokenPerInterval: 100,
    })

    // First request
    await limiter.check('test-ip')
    // Second request
    await limiter.check('test-ip')
    // Third request (should be blocked)
    const result3 = await limiter.check('test-ip')
    
    expect(result3.success).toBe(false)
    expect(result3.remaining).toBe(0)
  })

  it('should reset after the interval', async () => {
    const limiter = rateLimit({
      interval: 60 * 1000, // 1 minute
      limit: 2,
      uniqueTokenPerInterval: 100,
    })

    // Use up the limit
    await limiter.check('test-ip')
    await limiter.check('test-ip')
    
    // Third request should be blocked
    const blockedResult = await limiter.check('test-ip')
    expect(blockedResult.success).toBe(false)

    // Advance time past the interval
    vi.advanceTimersByTime(61 * 1000)

    // Should be allowed again after interval
    const newResult = await limiter.check('test-ip')
    expect(newResult.success).toBe(true)
    expect(newResult.remaining).toBe(1)
  })

  it('should track different IPs separately', async () => {
    const limiter = rateLimit({
      interval: 60 * 1000,
      limit: 2,
      uniqueTokenPerInterval: 100,
    })

    // First IP uses its limit
    await limiter.check('ip-1')
    await limiter.check('ip-1')
    const ip1Result = await limiter.check('ip-1')
    expect(ip1Result.success).toBe(false)

    // Second IP should still have its full limit
    const ip2Result = await limiter.check('ip-2')
    expect(ip2Result.success).toBe(true)
    expect(ip2Result.remaining).toBe(1)
  })
})
