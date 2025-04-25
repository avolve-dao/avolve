# Consent API Documentation

## Overview

The Consent API provides endpoints for managing user consent records for various platform interactions, such as governance proposals and terms acceptance.

## Endpoints

### GET /api/consent

Retrieves consent records for the authenticated user.

#### Query Parameters

| Parameter        | Type   | Description                                              |
| ---------------- | ------ | -------------------------------------------------------- |
| interaction_type | string | Filter by interaction type (e.g., 'governance_proposal') |
| status           | string | Filter by consent status (e.g., 'approved', 'rejected')  |
| from_date        | string | Filter records from this date (ISO format)               |
| to_date          | string | Filter records until this date (ISO format)              |

#### Response

```json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "consent_id": "uuid",
      "interaction_type": "governance_proposal",
      "user_id": "uuid",
      "created_at": "2025-01-01T00:00:00.000Z",
      "status": "approved"
    }
  ]
}
```

### POST /api/consent

Creates a new consent record.

#### Request Body

```json
{
  "interaction_type": "governance_proposal",
  "terms": ["term1", "term2"]
}
```

#### Response

```json
{
  "success": true,
  "message": "Consent recorded successfully",
  "record": {
    "consent_id": "uuid",
    "user_id": "uuid",
    "interaction_type": "governance_proposal"
  }
}
```

### PATCH /api/consent/:id

Updates an existing consent record.

#### Request Body

```json
{
  "status": "approved"
}
```

#### Response

```json
{
  "success": true,
  "message": "Consent record updated successfully"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error scenarios:

- 401: Unauthorized - User not authenticated
- 403: Forbidden - User not authorized to perform action
- 404: Not Found - Consent record not found
- 422: Unprocessable Entity - Invalid request data
- 500: Internal Server Error - Database or server error

## Security

- All endpoints require authentication
- Users can only access and modify their own consent records
- Row Level Security (RLS) enforced at database level
- Input validation for all request data
- Rate limiting applied to prevent abuse

## Usage Example

```js
fetch('/api/consent', {
  headers: { Authorization: 'Bearer <your_token>' },
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## FAQ & Troubleshooting

- **Q: Why am I not seeing my consent records?**
  - A: Check your authentication and query parameters. Only records for the authenticated user are returned.
- **Q: How do I revoke consent?**
  - A: Use the PATCH endpoint (see API spec) with the consent ID and new status.

## Feedback & Support

- For help or to request new consent features, open an issue or email dev@avolve.io

## Testing

Comprehensive test suite available in `app/api/consent/__tests__/consent-api.test.ts`.
