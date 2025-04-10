# API Documentation

This document provides comprehensive documentation for all API endpoints in the Avolve application.

## Table of Contents

- [Authentication API](#authentication-api)
- [Chat API](#chat-api)
- [Grok API](#grok-api)
- [Invitation API](#invitation-api)
- [Verification API](#verification-api)
- [Token API](#token-api)
- [Trust Score API](#trust-score-api)
- [Governance API](#governance-api)
- [Analytics API](#analytics-api)
- [Consent API](#consent-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Security Headers](#security-headers)
- [Input Validation](#input-validation)
- [Structured Logging](#structured-logging)
- [API Versioning](#api-versioning)
- [Tracking API](#tracking-api)
- [Webhook Support](#webhook-support)

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

## Governance API

### List Proposals

Retrieves a list of governance proposals based on status filter.

- **URL**: `/api/governance/proposals`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `status`: Filter by proposal status (`pending`, `approved`, `rejected`)
  - `limit`: Maximum number of proposals to return (default: 20)
  - `offset`: Offset for pagination (default: 0)
- **Response**:
  ```json
  {
    "proposals": [
      {
        "id": "proposal-uuid",
        "title": "Proposal Title",
        "description": "Detailed proposal description",
        "status": "pending",
        "created_at": "2025-04-01T10:30:00Z",
        "created_by": "user-uuid",
        "voteCount": 15,
        "approved_at": null,
        "rejected_at": null,
        "profiles": {
          "username": "proposer_username",
          "avatar_url": "https://example.com/avatar.png"
        }
      }
    ],
    "total": 45
  }
  ```

### Get Proposal Details

Retrieves detailed information about a specific proposal.

- **URL**: `/api/governance/proposals/:id`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "id": "proposal-uuid",
    "title": "Proposal Title",
    "description": "Detailed proposal description",
    "status": "pending",
    "created_at": "2025-04-01T10:30:00Z",
    "created_by": "user-uuid",
    "voteCount": 15,
    "approved_at": null,
    "rejected_at": null,
    "profiles": {
      "username": "proposer_username",
      "avatar_url": "https://example.com/avatar.png"
    },
    "votes": [
      {
        "id": "vote-uuid",
        "user_id": "user-uuid",
        "vote_weight": 10,
        "created_at": "2025-04-02T14:25:00Z",
        "profiles": {
          "username": "voter_username",
          "avatar_url": "https://example.com/avatar2.png"
        }
      }
    ]
  }
  ```

### Create Proposal

Creates a new governance proposal.

- **URL**: `/api/governance/proposals`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 10 requests per hour
- **Request Body**:
  ```json
  {
    "title": "Proposal Title",
    "description": "Detailed proposal description",
    "consent_id": "consent-record-uuid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "petitionId": "proposal-uuid",
      "message": "Proposal created successfully"
    }
  }
  ```

### Vote on Proposal

Records a vote on a governance proposal.

- **URL**: `/api/governance/proposals/:id/vote`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 20 requests per hour
- **Request Body**:
  ```json
  {
    "consent_id": "consent-record-uuid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "voteId": "vote-uuid",
      "voteWeight": 10,
      "message": "Vote recorded successfully"
    }
  }
  ```

### Check Eligibility

Checks if the authenticated user is eligible to create proposals.

- **URL**: `/api/governance/eligibility`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "isEligible": true,
    "genBalance": 150,
    "requiredGen": 100
  }
  ```

## Analytics API

The Analytics API provides access to platform engagement, contribution, and impact metrics for users and the overall network state.

### Get Engagement Analytics

Retrieves engagement metrics for the authenticated user or the entire platform.

- **URL**: `/api/analytics/engagement`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `scope`: Scope of analytics (`user` or `platform`, default: `user`)
  - `period`: Time period for analytics (`day`, `week`, `month`, `quarter`, `year`, default: `month`)
  - `start_date`: Start date for custom period (ISO format, optional)
  - `end_date`: End date for custom period (ISO format, optional)
- **Response**:
  ```json
  {
    "metrics": {
      "dau": 125,
      "mau": 450,
      "dau_mau_ratio": 0.278,
      "average_session_duration": 12.5,
      "sessions_per_user": 3.2,
      "retention_rate": 0.85,
      "churn_rate": 0.15
    },
    "trends": {
      "dau_trend": [120, 118, 125, 130, 125],
      "mau_trend": [430, 435, 440, 445, 450],
      "retention_trend": [0.82, 0.83, 0.84, 0.84, 0.85]
    },
    "period": {
      "start": "2025-03-01T00:00:00Z",
      "end": "2025-03-31T23:59:59Z",
      "type": "month"
    }
  }
  ```

### Get Contribution Analytics

Retrieves contribution metrics for the authenticated user or specific users.

- **URL**: `/api/analytics/contributions`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `user_id`: Specific user ID to analyze (optional, defaults to authenticated user)
  - `period`: Time period for analytics (`day`, `week`, `month`, `quarter`, `year`, default: `month`)
  - `start_date`: Start date for custom period (ISO format, optional)
  - `end_date`: End date for custom period (ISO format, optional)
  - `type`: Filter by contribution type (`content`, `governance`, `community`, `technical`, `educational`, optional)
- **Response**:
  ```json
  {
    "contributions": {
      "total": 42,
      "by_type": {
        "content": 15,
        "governance": 8,
        "community": 12,
        "technical": 4,
        "educational": 3
      },
      "by_token": {
        "GEN": 10,
        "SPD": 5,
        "SHE": 4,
        "PSP": 6,
        "SSA": 7,
        "BSP": 3,
        "SGB": 4,
        "SMS": 3
      }
    },
    "impact": {
      "reach": 230,
      "engagement": 85,
      "value_created": 450,
      "influence_score": 72
    },
    "trends": {
      "contribution_trend": [38, 39, 40, 41, 42],
      "impact_trend": [65, 68, 70, 71, 72]
    },
    "period": {
      "start": "2025-03-01T00:00:00Z",
      "end": "2025-03-31T23:59:59Z",
      "type": "month"
    }
  }
  ```

### Get Census Data

Retrieves comprehensive census data for the authenticated user.

- **URL**: `/api/analytics/census`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 30 requests per hour
- **Query Parameters**:
  - `include_trends`: Whether to include historical trends (boolean, default: `true`)
  - `include_predictions`: Whether to include future predictions (boolean, default: `false`)
- **Response**:
  ```json
  {
    "census": {
      "user_id": "user-uuid",
      "contribution_score": 78.5,
      "network_influence": 42.3,
      "engagement_rate": 0.67,
      "value_creation": 450,
      "token_distribution": {
        "GEN": 250,
        "SAP": 180,
        "SCQ": 210,
        "SPD": 45,
        "SHE": 35,
        "PSP": 65,
        "SSA": 75,
        "BSP": 40,
        "SGB": 50,
        "SMS": 30
      },
      "governance_participation": {
        "proposals_created": 5,
        "proposals_voted": 28,
        "vote_weight": 250,
        "consent_actions": 33
      },
      "streak_data": {
        "current_streaks": {
          "SPD": 3,
          "SHE": 5,
          "PSP": 9,
          "SSA": 2,
          "BSP": 4,
          "SGB": 7,
          "SMS": 1
        },
        "longest_streaks": {
          "SPD": 12,
          "SHE": 15,
          "PSP": 21,
          "SSA": 8,
          "BSP": 14,
          "SGB": 18,
          "SMS": 6
        }
      }
    },
    "trends": {
      "contribution_score_trend": [72.5, 74.0, 75.5, 77.0, 78.5],
      "network_influence_trend": [38.5, 39.2, 40.1, 41.5, 42.3],
      "engagement_rate_trend": [0.62, 0.63, 0.65, 0.66, 0.67]
    },
    "predictions": {
      "contribution_score_prediction": [79.2, 80.1, 81.0, 82.2, 83.5],
      "network_influence_prediction": [43.0, 43.8, 44.5, 45.2, 46.0],
      "engagement_rate_prediction": [0.68, 0.69, 0.70, 0.71, 0.72]
    },
    "timestamp": "2025-04-09T14:05:39-06:00"
  }
  ```

### Export Analytics Data

Exports analytics data in various formats for the authenticated user.

- **URL**: `/api/analytics/export`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 10 requests per hour
- **Request Body**:
  ```json
  {
    "data_type": "census",
    "format": "csv",
    "period": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-03-31T23:59:59Z"
    },
    "metrics": ["contribution_score", "network_influence", "engagement_rate"]
  }
  ```
- **Response**: Binary file download with the requested data in the specified format

## Consent API

### Record Consent

Records user consent for a specific action.

- **URL**: `/api/consent`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Request Body**:
  ```json
  {
    "interaction_type": "governance_proposal",
    "terms": {
      "action": "create",
      "title": "Proposal Title",
      "description": "Proposal Description"
    },
    "status": "approved",
    "metadata": {
      "client_ip": "127.0.0.1",
      "user_agent": "Mozilla/5.0..."
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "consent_id": "consent-record-uuid",
      "created_at": "2025-04-09T12:30:00Z"
    }
  }
  ```

### Get Consent Records

Retrieves consent records for the authenticated user.

- **URL**: `/api/consent`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `start_date`: Filter by start date (ISO format)
  - `end_date`: Filter by end date (ISO format)
  - `interaction_type`: Filter by interaction type
  - `status`: Filter by consent status (`approved`, `revoked`)
  - `limit`: Maximum number of records to return (default: 20)
  - `offset`: Offset for pagination (default: 0)
- **Response**:
  ```json
  {
    "records": [
      {
        "id": "consent-record-uuid",
        "user_id": "user-uuid",
        "interaction_type": "governance_proposal",
        "terms": {
          "action": "create",
          "title": "Proposal Title",
          "description": "Proposal Description"
        },
        "status": "approved",
        "created_at": "2025-04-09T12:30:00Z",
        "updated_at": "2025-04-09T12:30:00Z",
        "metadata": {
          "client_ip": "127.0.0.1",
          "user_agent": "Mozilla/5.0..."
        }
      }
    ],
    "total": 45
  }
  ```

### Get Consent Record

Retrieves a specific consent record.

- **URL**: `/api/consent/:id`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Response**:
  ```json
  {
    "id": "consent-record-uuid",
    "user_id": "user-uuid",
    "interaction_type": "governance_proposal",
    "terms": {
      "action": "create",
      "title": "Proposal Title",
      "description": "Proposal Description"
    },
    "status": "approved",
    "created_at": "2025-04-09T12:30:00Z",
    "updated_at": "2025-04-09T12:30:00Z",
    "metadata": {
      "client_ip": "127.0.0.1",
      "user_agent": "Mozilla/5.0..."
    }
  }
  ```

### Revoke Consent

Revokes a previously given consent.

- **URL**: `/api/consent/:id/revoke`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Rate Limit**: 20 requests per hour
- **Request Body**:
  ```json
  {
    "reason": "Optional reason for revocation"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "consent-record-uuid",
      "status": "revoked",
      "updated_at": "2025-04-09T14:45:00Z"
    }
  }
  ```

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

## Tracking API

The Tracking API allows for recording user actions and events within the Avolve platform.

### Track Event

Records a user action or event for analytics and activity tracking.

- **URL**: `/api/track`
- **Method**: `POST`
- **Authentication Required**: Optional (supports both authenticated and anonymous tracking)
- **Rate Limit**: 100 requests per minute for authenticated users, 20 per minute for anonymous
- **Request Body**:
  ```json
  {
    "event_type": "challenge_completion",
    "user_id": "user-uuid", // Optional for authenticated requests
    "metadata": {
      "challenge_id": "challenge-uuid",
      "token_type": "PSP",
      "points_earned": 10,
      "completion_time": 120 // seconds
    },
    "timestamp": "2025-04-09T14:30:00Z" // Optional, defaults to server time
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "event_id": "event-uuid",
    "recorded_at": "2025-04-09T14:30:05Z"
  }
  ```

### Track Anonymous Event

Records an event from an unauthenticated user, typically for landing page analytics.

- **URL**: `/api/track/anonymous`
- **Method**: `POST`
- **Authentication Required**: No
- **Rate Limit**: 10 requests per minute per IP
- **Request Body**:
  ```json
  {
    "event_type": "page_view",
    "session_id": "browser-session-id", // Client-generated session ID
    "metadata": {
      "page": "/landing",
      "referrer": "https://example.com",
      "device_type": "mobile"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "event_id": "event-uuid"
  }
  ```

### Get User Activity

Retrieves activity history for the authenticated user.

- **URL**: `/api/track/activity`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Rate Limit**: 60 requests per hour
- **Query Parameters**:
  - `limit`: Maximum number of events to return (default: 20, max: 100)
  - `offset`: Offset for pagination (default: 0)
  - `event_type`: Filter by event type (optional)
  - `start_date`: Filter by start date (ISO format, optional)
  - `end_date`: Filter by end date (ISO format, optional)
- **Response**:
  ```json
  {
    "events": [
      {
        "id": "event-uuid",
        "event_type": "challenge_completion",
        "timestamp": "2025-04-09T14:30:00Z",
        "metadata": {
          "challenge_id": "challenge-uuid",
          "token_type": "PSP",
          "points_earned": 10
        }
      },
      {
        "id": "event-uuid-2",
        "event_type": "profile_update",
        "timestamp": "2025-04-08T10:15:22Z",
        "metadata": {
          "fields_updated": ["display_name", "avatar"]
        }
      }
    ],
    "total": 42
  }
  ```

## Webhook Support

Avolve supports webhooks for certain events:

- User registration
- Profile updates
- Content creation

To register a webhook, contact the Avolve team with your endpoint URL and the events you want to subscribe to.

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
