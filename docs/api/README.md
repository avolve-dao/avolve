# Avolve API Documentation

Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.

This document and its contents are proprietary and confidential.

## Overview

The Avolve API provides a comprehensive set of endpoints for interacting with the platform. This documentation covers authentication, available endpoints, and best practices for integration.

## Available APIs

The Avolve platform provides the following core APIs:

| API | Description | Documentation |
|-----|-------------|--------------|
| Consent API | Manage user consent and privacy preferences | [Documentation](./consent.md) |
| Token API | Token management and transactions | [Documentation](./token.md) |
| Experience API | User progress and achievements | [Documentation](./experience.md) |
| Profile API | User profile management | [Documentation](./profile.md) |

## Security

### Authentication

All API requests must be authenticated using Supabase Auth. Include a valid JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

For detailed authentication information, see our [Authentication Documentation](/docs/security/authentication.md).

### Authorization

Access to API endpoints is controlled through:
1. Role-Based Access Control (RBAC)
2. Token-Based Access Control
3. Row Level Security (RLS)

For more information, see:
- [RBAC Documentation](/docs/security/rbac.md)
- [Token Access Documentation](/docs/security/token-access.md)

## Rate Limiting

To ensure fair usage and system stability:

| User Type | Rate Limit | Window |
|-----------|------------|--------|
| Anonymous | 20 requests | per minute |
| Authenticated | 100 requests | per minute |
| Token Holder | 200 requests | per minute |

Rate limits are applied per IP address and user ID. The following headers are returned with each response:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1628789789
```

## Error Handling

All errors follow this standardized format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INVALID_INPUT` | Invalid request parameters | 400 |
| `NOT_FOUND` | Resource not found | 404 |

## Best Practices

### 1. Error Handling

```typescript
try {
  const response = await api.post('/endpoint', data)
  // Handle success
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    await delay(calculateBackoff(retryCount))
    return retry(operation)
  }
  logger.error('API Error', { error, endpoint: '/endpoint' })
  throw error
}
```

### 2. Rate Limiting

```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  perMinute: 1,
  strategy: 'token_bucket'
})

async function makeRequest() {
  await rateLimiter.waitForToken()
  return api.get('/endpoint')
}
```

### 3. Caching

```typescript
const cache = new Cache({
  max: 100,
  maxAge: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true
})

async function getCachedData(key) {
  const cached = cache.get(key)
  if (cached) {
    metrics.increment('cache.hit')
    return cached
  }

  metrics.increment('cache.miss')
  const data = await api.get(`/data/${key}`)
  cache.set(key, data)
  return data
}
```

## Endpoints

### Experience System

#### Get User Progress

```http
GET /api/progress
```

Response:
```json
{
  "data": {
    "pillars": [
      {
        "name": "personal",
        "phase": "scaffolding",
        "progress": 75
      }
    ]
  }
}
```

#### Update Progress

```http
POST /api/progress
Content-Type: application/json

{
  "pillar": "personal",
  "action": "complete_milestone",
  "milestoneId": "123"
}
```

### Token System

#### Get Balance

```http
GET /api/tokens/balance
```

Response:
```json
{
  "data": {
    "tokens": [
      {
        "type": "GEN",
        "balance": "100.00"
      }
    ]
  }
}
```

#### Transfer Tokens

```http
POST /api/tokens/transfer
Content-Type: application/json

{
  "to": "user_id",
  "amount": "10.00",
  "tokenType": "GEN"
}
```

### User Management

#### Get Profile

```http
GET /api/profile
```

Response:
```json
{
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "avatarUrl": "https://..."
  }
}
```

#### Update Profile

```http
PATCH /api/profile
Content-Type: application/json

{
  "username": "newusername",
  "avatarUrl": "https://..."
}
```

## Testing

For detailed testing information, see our [Testing Documentation](/docs/testing/README.md).

### Integration Tests

```typescript
describe('API Integration', () => {
  it('should handle rate limiting', async () => {
    const requests = Array(101).fill().map(() => api.get('/endpoint'))
    await expect(Promise.all(requests))
      .rejects.toThrow('Rate limit exceeded')
  })
})
```

## Monitoring

### Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Request Latency | Time to process request | p95 > 500ms |
| Error Rate | Percentage of failed requests | > 1% |
| Rate Limit Hits | Number of rate limit violations | > 100/min |
| Cache Hit Rate | Percentage of cache hits | < 80% |

### Logging

```typescript
logger.info('API Request', {
  method: req.method,
  path: req.path,
  duration: endTime - startTime,
  status: res.statusCode,
  user: req.user?.id,
  correlationId: req.headers['x-correlation-id']
})
```

## Additional Resources

- [OpenAPI Specification](./openapi.yaml)
- [Postman Collection](./postman.json)
- [Code Examples](./examples.md)
- [Changelog](./CHANGELOG.md)

## Support

For API support:
- Email: api-support@avolve.io
- Discord: [Avolve API Channel](https://discord.gg/avolve-api)
- GitHub Issues: [API Issues](https://github.com/avolve/api/issues)

## License

Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.

This document and its contents are proprietary and confidential.
