# API Documentation

This document provides comprehensive documentation for all API endpoints in the Avolve application.

## Authentication API

### CSRF Token

Generates a CSRF token for secure form submissions.

- **URL**: `/api/auth/csrf/token`
- **Method**: `GET`
- **Authentication Required**: No
- **Response**:
  ```json
  {
    "csrfToken": "random-token-string"
  }
  ```

### CSRF Validation

Validates a CSRF token.

- **URL**: `/api/auth/csrf/validate`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "token": "csrf-token-to-validate"
  }
  ```
- **Response**:
  - Success (200 OK):
    ```json
    {
      "valid": true
    }
    ```
  - Error (400 Bad Request):
    ```json
    {
      "valid": false,
      "error": "Invalid CSRF token"
    }
    ```

## Chat API

### Chat

Processes chat messages and returns AI-generated responses.

- **URL**: `/api/chat`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "model": "gpt-4",
    "systemPrompt": "Optional system prompt"
  }
  ```
- **Response**: Streaming text response

### Chat Test

Test endpoint for chat functionality.

- **URL**: `/api/chat-test`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Test message"
      }
    ]
  }
  ```
- **Response**: Streaming text response with a mock message

## Grok API

### Grok Chat

Processes chat messages using the Grok model.

- **URL**: `/api/grok/chat`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Hello Grok"
      }
    ],
    "model": "grok-1",
    "contextId": "optional-context-id"
  }
  ```
- **Response**: Streaming text response from Grok

### Grok Context

Creates or retrieves a contextual conversation.

- **URL**: `/api/grok/context`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "contextId": "existing-context-id" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "contextId": "generated-or-provided-context-id",
    "messages": [] // Previous messages if context exists
  }
  ```

### Grok Create

Creates a new Grok-powered document or content.

- **URL**: `/api/grok/create`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "prompt": "Create a document about...",
    "format": "markdown",
    "model": "grok-1"
  }
  ```
- **Response**: Streaming text response with the created content

### Grok Enhance

Enhances existing content using Grok.

- **URL**: `/api/grok/enhance`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "content": "Original content to enhance",
    "instructions": "Make this more professional",
    "model": "grok-1"
  }
  ```
- **Response**: Streaming text response with enhanced content

### Grok Insights

Generates insights from provided content.

- **URL**: `/api/grok/insights`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "content": "Content to analyze",
    "model": "grok-1"
  }
  ```
- **Response**:
  ```json
  {
    "insights": [
      {
        "title": "Key Insight",
        "description": "Detailed explanation"
      }
    ]
  }
  ```

## Invitation API

### Check Invitation

Validates an invitation code and returns its status.

- **URL**: `/api/invitations/check`
- **Method**: `POST`
- **Authentication Required**: No
- **Rate Limit**: 5 requests per minute
- **Request Body**:
  ```json
  {
    "code": "2024-ABCD-1234-5678"
  }
  ```
- **Response**:
  - Success (200 OK):
    ```json
    {
      "valid": true,
      "status": "pending",
      "expires_at": "2024-12-31T23:59:59Z"
    }
    ```
  - Error (400 Bad Request):
    ```json
    {
      "valid": false,
      "error": "Invalid invitation code"
    }
    ```

### Create Invitation

Creates a new invitation code.

- **URL**: `/api/invitations/create`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 10 requests per hour
- **Request Body**:
  ```json
  {
    "email": "user@example.com",  // Optional
    "expires_in_days": 14         // Optional, defaults to 14
  }
  ```
- **Response**:
  ```json
  {
    "code": "2024-ABCD-1234-5678",
    "expires_at": "2024-12-31T23:59:59Z"
  }
  ```

### Accept Invitation

Accepts an invitation and creates a user account.

- **URL**: `/api/invitations/accept`
- **Method**: `POST`
- **Authentication Required**: No
- **Rate Limit**: 3 requests per hour per IP
- **Request Body**:
  ```json
  {
    "code": "2024-ABCD-1234-5678",
    "email": "user@example.com",
    "password": "secure-password",
    "display_name": "User Name"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user_id": "user-uuid",
    "redirect_url": "/onboarding"
  }
  ```

### Vouch for User

Vouches for another user, increasing their trust score.

- **URL**: `/api/invitations/vouch`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 5 requests per day
- **Request Body**:
  ```json
  {
    "user_id": "user-uuid-to-vouch-for",
    "message": "I vouch for this user because..."  // Optional
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "trust_score_increase": 5
  }
  ```

## Verification API

### Start Verification

Initiates the human verification process.

- **URL**: `/api/verification/start`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 3 requests per hour
- **Response**:
  ```json
  {
    "session_id": "verification-session-uuid",
    "challenges": [
      {
        "id": "challenge-uuid",
        "type": "community_puzzle",
        "data": {
          "question": "Which pillar represents individual transformation?",
          "options": ["Superachiever", "Superachievers", "Supercivilization"]
        }
      }
    ]
  }
  ```

### Submit Verification

Submits answers to verification challenges.

- **URL**: `/api/verification/submit`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 10 requests per hour
- **Request Body**:
  ```json
  {
    "session_id": "verification-session-uuid",
    "challenge_id": "challenge-uuid",
    "answer": "Superachiever"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "correct": true,
    "points": 10,
    "total_points": 25,
    "verified": false,
    "next_challenge": {
      "id": "next-challenge-uuid",
      "type": "pattern_challenge",
      "data": {
        "pattern": [1, 3, 5, 7],
        "options": [9, 10, 11]
      }
    }
  }
  ```

### Check Verification Status

Checks the current verification status of a user.

- **URL**: `/api/verification/status`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 20 requests per hour
- **Response**:
  ```json
  {
    "verified": true,
    "score": 75,
    "completed_at": "2024-05-15T10:30:45Z",
    "expires_at": "2024-08-15T10:30:45Z"
  }
  ```

## Token API

### Get Token Balance

Retrieves the token balances for the authenticated user.

- **URL**: `/api/tokens/balance`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "balances": [
      {
        "token_id": "token-uuid",
        "symbol": "GEN",
        "name": "Genesis Token",
        "balance": 150.5,
        "staked_balance": 25.0
      },
      {
        "token_id": "token-uuid-2",
        "symbol": "SAP",
        "name": "Superachiever Pillar",
        "balance": 75.0,
        "staked_balance": 0.0
      }
    ]
  }
  ```

### Get Transaction History

Retrieves the token transaction history for the authenticated user.

- **URL**: `/api/tokens/transactions`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `limit`: Maximum number of transactions to return (default: 20)
  - `offset`: Offset for pagination (default: 0)
  - `token_id`: Filter by token ID (optional)
  - `type`: Filter by transaction type (optional)
- **Response**:
  ```json
  {
    "transactions": [
      {
        "id": "transaction-uuid",
        "token_id": "token-uuid",
        "symbol": "GEN",
        "amount": 10.0,
        "transaction_type": "reward",
        "from_user_id": null,
        "to_user_id": "user-uuid",
        "status": "completed",
        "created_at": "2024-05-15T10:30:45Z",
        "completed_at": "2024-05-15T10:30:45Z",
        "metadata": {
          "reward_id": "reward-uuid",
          "reward_name": "Daily Login"
        }
      }
    ],
    "total": 45,
    "limit": 20,
    "offset": 0
  }
  ```

### Transfer Tokens

Transfers tokens from the authenticated user to another user.

- **URL**: `/api/tokens/transfer`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 20 requests per hour
- **Request Body**:
  ```json
  {
    "token_id": "token-uuid",
    "to_user_id": "recipient-user-uuid",
    "amount": 10.5,
    "memo": "Payment for services"  // Optional
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "transaction_id": "transaction-uuid",
    "new_balance": 140.0
  }
  ```

### Get Available Rewards

Retrieves the available token rewards for the authenticated user.

- **URL**: `/api/tokens/rewards`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "rewards": [
      {
        "id": "reward-uuid",
        "token_id": "token-uuid",
        "symbol": "GEN",
        "name": "Daily Login",
        "description": "Reward for logging in daily",
        "amount": 5.0,
        "reward_type": "daily",
        "available": true,
        "cooldown_remaining": null
      },
      {
        "id": "reward-uuid-2",
        "token_id": "token-uuid",
        "symbol": "GEN",
        "name": "Weekly Contribution",
        "description": "Reward for weekly platform contribution",
        "amount": 20.0,
        "reward_type": "contribution",
        "available": false,
        "cooldown_remaining": "2d 5h"
      }
    ]
  }
  ```

### Claim Reward

Claims an available token reward.

- **URL**: `/api/tokens/claim-reward`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 20 requests per hour
- **Request Body**:
  ```json
  {
    "reward_id": "reward-uuid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "transaction_id": "transaction-uuid",
    "amount": 5.0,
    "token_id": "token-uuid",
    "symbol": "GEN",
    "new_balance": 155.5
  }
  ```

## Trust Score API

### Get Trust Score

Retrieves the trust score for the authenticated user.

- **URL**: `/api/trust/score`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "score": 75.5,
    "level": 4,
    "next_level_threshold": 100,
    "progress_to_next_level": 0.755
  }
  ```

### Get Trust History

Retrieves the trust score history for the authenticated user.

- **URL**: `/api/trust/history`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `limit`: Maximum number of events to return (default: 20)
  - `offset`: Offset for pagination (default: 0)
- **Response**:
  ```json
  {
    "events": [
      {
        "id": "event-uuid",
        "points": 5,
        "reason": "Verified email",
        "previous_score": 70.5,
        "new_score": 75.5,
        "created_at": "2024-05-15T10:30:45Z"
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
  ```

## Authentication Routes

These are not API endpoints but server-rendered routes for authentication flows.

### Login

- **URL**: `/auth/login`
- **Method**: `GET`
- **Description**: Renders the login page

### Sign Up

- **URL**: `/auth/sign-up`
- **Method**: `GET`
- **Description**: Renders the sign-up page

### Forgot Password

- **URL**: `/auth/forgot-password`
- **Method**: `GET`
- **Description**: Renders the forgot password page

### Callback

- **URL**: `/auth/callback`
- **Method**: `GET`
- **Description**: Handles authentication callbacks from Supabase

### Confirm

- **URL**: `/auth/confirm`
- **Method**: `GET`
- **Description**: Confirms email addresses

### Update Password

- **URL**: `/auth/update-password`
- **Method**: `GET`
- **Description**: Renders the update password page

## Error Handling

All API endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Invalid input parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

Error responses follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

## Rate Limiting

All API endpoints are protected by rate limiting to prevent abuse:

- **Limit**: 10 requests per minute per IP address and endpoint
- **Headers**: All responses include rate limit headers:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Remaining requests in the current window
  - `X-RateLimit-Reset`: Time when the rate limit window resets (ISO format)
- **Status Code**: When rate limit is exceeded, endpoints return `429 Too Many Requests`

Example of exceeding rate limit:
```json
{
  "error": "Too many requests, please try again later."
}
```

## Caching

The API implements intelligent caching to improve performance:

- **Chat Responses**: Short conversations (less than 5 messages) are cached for 5 minutes
- **Cache Key**: Generated based on request method, path, and body content
- **Cache Invalidation**: Automatic after TTL expiration (5 minutes by default)
- **Cache Bypass**: Longer conversations (5+ messages) bypass the cache to ensure freshness

## Security Headers

All API responses include the following security headers:

- `Content-Security-Policy`: Restricts sources of executable scripts
- `Strict-Transport-Security`: Enforces HTTPS connections
- `X-Frame-Options`: Prevents clickjacking attacks
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features
- `Cache-Control`: Controls caching behavior

## Input Validation

All API endpoints implement strict input validation:

- **Validation Library**: Zod schema validation
- **Error Format**: Detailed validation errors are returned with 400 status code
- **Validation Rules**:
  - Chat messages must have valid roles (`user`, `assistant`, `system`)
  - Message content must be between 1 and 4000 characters
  - Arrays have minimum and maximum length limits
  - Required fields are strictly enforced

Example validation error:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["messages", 0, "content"],
      "message": "Required"
    }
  ]
}
```

## Structured Logging

All API requests are logged with structured data:

- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Context**: Each log entry includes relevant context (route, user info, etc.)
- **Error Tracking**: Errors are logged with full stack traces and context
- **Environment Awareness**: Different logging behavior in development vs. production

## API Versioning

The current API version is v1 (implicit in the routes). Future versions will be explicitly versioned with a prefix (e.g., `/api/v2/chat`).

## Webhook Support

Avolve supports webhooks for certain events:

- User registration
- Profile updates
- Content creation

To register a webhook, contact the Avolve team with your endpoint URL and the events you want to subscribe to.
