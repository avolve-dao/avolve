# Avolve Platform API Documentation

This document provides comprehensive documentation for the Avolve Platform API, enabling developers to integrate with our platform and build extensions that enhance the Supercivilization ecosystem.

## API Overview

The Avolve Platform API is a RESTful API that allows developers to interact with the Avolve platform programmatically. The API is built on top of Supabase and provides access to various features of the platform, including user management, feature flags, invitations, tokens, and more.

### Base URL

```
https://api.avolve.io/v1
```

### Authentication

All API requests must be authenticated using a JWT token. To obtain a token, you must first authenticate with the Avolve platform using the authentication endpoints.

#### Authentication Headers

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Sign Up

```
POST /auth/signup
```

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "invitation_code": "INV-123456" // Optional, required if invitation-only mode is enabled
}
```

**Response:**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2025-04-23T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Sign In

```
POST /auth/signin
```

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "created_at": "2025-04-23T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Sign Out

```
POST /auth/signout
```

Sign out the current user.

**Response:**

```json
{
  "success": true
}
```

### User Profile

#### Get Current User

```
GET /user
```

Get the profile of the currently authenticated user.

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "superachiever",
  "display_name": "Super Achiever",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Building the Supercivilization!",
  "created_at": "2025-04-23T12:00:00Z",
  "updated_at": "2025-04-23T12:00:00Z",
  "onboarding_completed": true,
  "is_admin": false
}
```

#### Update User Profile

```
PATCH /user
```

Update the profile of the currently authenticated user.

**Request Body:**

```json
{
  "username": "superachiever",
  "display_name": "Super Achiever",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Building the Supercivilization!"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "superachiever",
  "display_name": "Super Achiever",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Building the Supercivilization!",
  "created_at": "2025-04-23T12:00:00Z",
  "updated_at": "2025-04-23T12:00:00Z",
  "onboarding_completed": true,
  "is_admin": false
}
```

### Feature Flags

#### Get Feature Flags

```
GET /features
```

Get all feature flags available to the current user.

**Response:**

```json
{
  "features": [
    {
      "key": "supercivilization_feed",
      "name": "Supercivilization Feed",
      "description": "Access to the Supercivilization feed",
      "enabled": true,
      "unlocked_at": "2025-04-23T12:00:00Z"
    },
    {
      "key": "personal_success_puzzle",
      "name": "Personal Success Puzzle",
      "description": "Create your personal success puzzle",
      "enabled": true,
      "unlocked_at": "2025-04-23T12:00:00Z"
    },
    {
      "key": "business_success_puzzle",
      "name": "Business Success Puzzle",
      "description": "Create your business success puzzle",
      "enabled": false,
      "requirements": {
        "PSP": 100,
        "GEN": 50
      }
    }
  ]
}
```

#### Check Feature Flag

```
GET /features/:key
```

Check if a specific feature flag is enabled for the current user.

**Response:**

```json
{
  "key": "supercivilization_feed",
  "name": "Supercivilization Feed",
  "description": "Access to the Supercivilization feed",
  "enabled": true,
  "unlocked_at": "2025-04-23T12:00:00Z"
}
```

#### Unlock Feature

```
POST /features/:key/unlock
```

Unlock a feature for the current user if they meet the requirements.

**Response:**

```json
{
  "success": true,
  "key": "business_success_puzzle",
  "name": "Business Success Puzzle",
  "description": "Create your business success puzzle",
  "enabled": true,
  "unlocked_at": "2025-04-23T12:00:00Z"
}
```

### Tokens

#### Get Token Balances

```
GET /tokens
```

Get the token balances for the current user.

**Response:**

```json
{
  "balances": [
    {
      "token_type": "GEN",
      "balance": 150,
      "description": "Supercivilization Tokens"
    },
    {
      "token_type": "PSP",
      "balance": 250,
      "description": "Personal Success Puzzle Tokens"
    },
    {
      "token_type": "BSP",
      "balance": 100,
      "description": "Business Success Puzzle Tokens"
    }
  ]
}
```

#### Get Token History

```
GET /tokens/history
```

Get the token transaction history for the current user.

**Query Parameters:**

- `token_type` (optional): Filter by token type
- `limit` (optional): Limit the number of results (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**

```json
{
  "history": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "token_type": "GEN",
      "amount": 10,
      "description": "Daily login bonus",
      "created_at": "2025-04-23T12:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "token_type": "PSP",
      "amount": -50,
      "description": "Unlocked Personal Success Puzzle feature",
      "created_at": "2025-04-23T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

### Invitations

#### Create Invitation

```
POST /invitations
```

Create a new invitation to join the Avolve platform.

**Request Body:**

```json
{
  "email": "friend@example.com",
  "max_uses": 1,
  "expires_in": "7d",
  "metadata": {
    "referral_source": "personal"
  }
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "INV-123456",
  "email": "friend@example.com",
  "created_by": "123e4567-e89b-12d3-a456-426614174000",
  "max_uses": 1,
  "uses": 0,
  "expires_at": "2025-04-30T12:00:00Z",
  "created_at": "2025-04-23T12:00:00Z",
  "metadata": {
    "referral_source": "personal"
  }
}
```

#### Get Invitations

```
GET /invitations
```

Get all invitations created by the current user.

**Response:**

```json
{
  "invitations": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "code": "INV-123456",
      "email": "friend@example.com",
      "created_by": "123e4567-e89b-12d3-a456-426614174000",
      "max_uses": 1,
      "uses": 0,
      "expires_at": "2025-04-30T12:00:00Z",
      "created_at": "2025-04-23T12:00:00Z",
      "metadata": {
        "referral_source": "personal"
      }
    }
  ]
}
```

#### Validate Invitation

```
GET /invitations/validate/:code
```

Validate an invitation code.

**Response:**

```json
{
  "valid": true,
  "code": "INV-123456",
  "expires_at": "2025-04-30T12:00:00Z"
}
```

### Analytics

#### Track Event

```
POST /analytics/events
```

Track a custom event for the current user.

**Request Body:**

```json
{
  "event_type": "custom_event",
  "properties": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response:**

```json
{
  "success": true,
  "event_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain an error message and additional details if available.

### Error Response Format

```json
{
  "error": {
    "code": "authentication_error",
    "message": "Invalid authentication credentials",
    "details": {
      "field": "token",
      "reason": "expired"
    }
  }
}
```

### Common Error Codes

- `400 Bad Request`: The request was invalid or cannot be served.
- `401 Unauthorized`: Authentication is required or has failed.
- `403 Forbidden`: The authenticated user does not have permission to access the requested resource.
- `404 Not Found`: The requested resource does not exist.
- `429 Too Many Requests`: The user has sent too many requests in a given amount of time.
- `500 Internal Server Error`: An error occurred on the server.

## Rate Limiting

The API implements rate limiting to prevent abuse. The rate limits are as follows:

- Authentication endpoints: 10 requests per minute per IP address
- All other endpoints: 60 requests per minute per authenticated user

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1619712000
```

If you exceed the rate limit, you will receive a `429 Too Many Requests` response with a `Retry-After` header indicating how long to wait before making another request.

## Webhooks

The Avolve platform supports webhooks for real-time notifications of events. To use webhooks, you must register a webhook URL in the developer settings.

### Webhook Events

- `user.created`: A new user has been created
- `user.updated`: A user's profile has been updated
- `feature.unlocked`: A user has unlocked a feature
- `token.earned`: A user has earned tokens
- `token.spent`: A user has spent tokens
- `invitation.created`: A new invitation has been created
- `invitation.claimed`: An invitation has been claimed

### Webhook Payload

```json
{
  "event": "feature.unlocked",
  "created_at": "2025-04-23T12:00:00Z",
  "data": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "feature_key": "business_success_puzzle",
    "unlocked_at": "2025-04-23T12:00:00Z"
  }
}
```

## SDK

We provide official SDKs for easy integration with the Avolve platform:

- [JavaScript/TypeScript SDK](https://github.com/avolve-dao/avolve-js)
- [React SDK](https://github.com/avolve-dao/avolve-react)
- [React Native SDK](https://github.com/avolve-dao/avolve-react-native)

### JavaScript/TypeScript SDK Example

```typescript
import { AvolveClient } from '@avolve/sdk';

// Initialize the client
const avolve = new AvolveClient({
  apiKey: 'your-api-key',
});

// Authenticate a user
const { user, token } = await avolve.auth.signIn({
  email: 'user@example.com',
  password: 'securepassword',
});

// Check if a feature is enabled
const isEnabled = await avolve.features.isEnabled('business_success_puzzle');

// Get token balances
const balances = await avolve.tokens.getBalances();

// Track an event
await avolve.analytics.trackEvent('custom_event', {
  key1: 'value1',
  key2: 'value2',
});
```

## Support

If you have any questions or need help with the API, please contact our developer support team at [developers@avolve.io](mailto:developers@avolve.io) or visit our [Developer Portal](https://developers.avolve.io).

## Changelog

### v1.0.0 (2025-04-23)

- Initial release of the Avolve Platform API
