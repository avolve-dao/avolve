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

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 10 requests per minute
- Chat endpoints: 60 requests per minute
- Other endpoints: 100 requests per minute

## API Versioning

The current API version is v1 (implicit in the routes). Future versions will be explicitly versioned with a prefix (e.g., `/api/v2/chat`).

## Webhook Support

Avolve supports webhooks for certain events:

- User registration
- Profile updates
- Content creation

To register a webhook, contact the Avolve team with your endpoint URL and the events you want to subscribe to.
