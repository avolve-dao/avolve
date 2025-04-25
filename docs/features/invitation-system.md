# Invitation System

The Avolve platform uses an invitation-only onboarding strategy to create exclusivity, control growth, and ensure a high-quality community of engaged users. This document explains how the invitation system works and how to use it.

## Overview

The invitation system allows:

- **Administrators** to create and manage invitations
- **Users** to claim invitations during onboarding
- **Visitors** to request invitations if they don't have a code
- **Analytics** to track invitation usage and effectiveness

## Database Structure

The invitation system is built on two primary tables:

### `invitations` Table

Stores invitation codes and their usage status:

| Column       | Type      | Description                                     |
| ------------ | --------- | ----------------------------------------------- |
| `id`         | UUID      | Primary key                                     |
| `code`       | TEXT      | Unique invitation code                          |
| `email`      | TEXT      | Optional email address for specific invitee     |
| `created_by` | UUID      | User ID of admin who created the invitation     |
| `claimed_by` | UUID      | User ID of person who claimed the invitation    |
| `max_uses`   | INTEGER   | Maximum number of times this code can be used   |
| `uses`       | INTEGER   | Current number of times this code has been used |
| `used`       | BOOLEAN   | Whether the invitation has been used            |
| `used_at`    | TIMESTAMP | When the invitation was used                    |
| `expires_at` | TIMESTAMP | When the invitation expires                     |
| `created_at` | TIMESTAMP | When the invitation was created                 |
| `updated_at` | TIMESTAMP | When the invitation was last updated            |
| `metadata`   | JSONB     | Additional metadata about the invitation        |

### `invitation_requests` Table

Stores requests from users who want to join but don't have an invitation code:

| Column          | Type      | Description                                        |
| --------------- | --------- | -------------------------------------------------- |
| `id`            | UUID      | Primary key                                        |
| `email`         | TEXT      | Email address of the requester                     |
| `name`          | TEXT      | Full name of the requester                         |
| `reason`        | TEXT      | Why they want to join                              |
| `status`        | ENUM      | Status: 'pending', 'approved', 'denied', 'invited' |
| `request_count` | INTEGER   | Number of times this email has requested           |
| `approved_by`   | UUID      | Admin who approved the request                     |
| `invitation_id` | UUID      | ID of invitation created for this request          |
| `created_at`    | TIMESTAMP | When the request was created                       |
| `updated_at`    | TIMESTAMP | When the request was last updated                  |

## Database Functions

The invitation system provides several database functions:

### `generate_invitation_code()`

Generates a unique, secure invitation code.

### `create_invitation(p_email, p_max_uses, p_expires_in, p_metadata)`

Creates a new invitation with the specified parameters.

**Parameters:**

- `p_email` (TEXT): Optional email for a specific invitee
- `p_max_uses` (INTEGER): Maximum number of times this code can be used (default: 1)
- `p_expires_in` (INTERVAL): How long the invitation is valid (default: 7 days)
- `p_metadata` (JSONB): Additional metadata about the invitation

**Returns:** JSONB object with the invitation details

### `validate_invitation_code(p_code)`

Checks if an invitation code is valid.

**Parameters:**

- `p_code` (TEXT): The invitation code to validate

**Returns:** BOOLEAN indicating if the code is valid

### `claim_invitation(p_code)`

Claims an invitation code for the current user.

**Parameters:**

- `p_code` (TEXT): The invitation code to claim

**Returns:** BOOLEAN indicating success

### `approve_invitation_request(p_request_id, p_max_uses, p_expires_in)`

Approves a pending invitation request and creates an invitation.

**Parameters:**

- `p_request_id` (UUID): The ID of the request to approve
- `p_max_uses` (INTEGER): Maximum number of times the code can be used (default: 1)
- `p_expires_in` (INTERVAL): How long the invitation is valid (default: 7 days)

**Returns:** JSONB object with the invitation details

## API Endpoints

### `/api/invitations`

- **GET**: Fetch invitations for the current user
- **POST**: Create a new invitation

### `/api/invitations/validate`

- **PATCH**: Validate an invitation code

### `/api/invitations/claim`

- **POST**: Claim an invitation code

### `/api/invitations/request`

- **POST**: Submit a request for an invitation

## Frontend Components

### `InvitationManager`

Admin component for creating and managing invitations:

```tsx
import { InvitationManager } from '@/components/invitation/InvitationManager';

// In your admin page:
<InvitationManager />;
```

### `InvitationCodeInput`

Component for users to enter an invitation code:

```tsx
import { InvitationCodeInput } from '@/components/onboarding/InvitationCodeInput';

// In your onboarding flow:
<InvitationCodeInput onValidCode={handleValidCode} required={true} />;
```

### `RequestInviteForm`

Component for visitors to request an invitation:

```tsx
import { RequestInviteForm } from '@/components/onboarding/RequestInviteForm';

// In your landing page:
<RequestInviteForm onRequestSent={handleRequestSent} />;
```

## Usage Examples

### Creating an Invitation (Admin)

```tsx
// In an admin component
const createInvitation = async () => {
  try {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com', // Optional
        maxUses: 1,
        expiresIn: '7 days',
        metadata: { source: 'admin_dashboard' },
      }),
    });

    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error creating invitation:', error);
  }
};
```

### Claiming an Invitation (User)

```tsx
// In an onboarding component
const claimInvitation = async code => {
  try {
    const response = await fetch('/api/invitations/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (data.success) {
      // Proceed to next onboarding step
    }
  } catch (error) {
    console.error('Error claiming invitation:', error);
  }
};
```

### Requesting an Invitation (Visitor)

```tsx
// In a landing page component
const requestInvitation = async (email, name, reason) => {
  try {
    const response = await fetch('/api/invitations/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, reason }),
    });

    const data = await response.json();
    // Show success message
  } catch (error) {
    console.error('Error requesting invitation:', error);
  }
};
```

## Security Considerations

- All invitation operations are protected by Row Level Security (RLS) policies
- Only authenticated users can claim invitations
- Only admins can create invitations and approve requests
- Invitation codes are cryptographically secure
- Rate limiting is applied to invitation requests

## Analytics and Metrics

The invitation system logs events to the `metrics` table for analytics:

- `invitation_created`: When an admin creates an invitation
- `invitation_claimed`: When a user claims an invitation
- `invitation_request_submitted`: When a visitor requests an invitation
- `invitation_request_approved`: When an admin approves a request

## Best Practices

1. **Set Expiration Dates**: Always set an expiration date for invitations to prevent stale codes.
2. **Limit Uses**: For most invitations, limit to 1 use per code.
3. **Track Sources**: Use the metadata field to track where invitations are being shared.
4. **Review Requests Regularly**: Check the invitation request queue regularly.
5. **Monitor Analytics**: Use the metrics table to track invitation effectiveness.

## Troubleshooting

### Common Issues

1. **Invalid Code**: Check if the code has expired or reached its maximum uses.
2. **Already Claimed**: A user can only claim one invitation.
3. **Rate Limiting**: Too many failed attempts will trigger rate limiting.

### Debugging

1. Check the logs in the Supabase dashboard
2. Verify the invitation status in the database
3. Ensure the user is authenticated when claiming an invitation

## Extending the System

The invitation system can be extended in several ways:

1. **Email Integration**: Automatically send invitation emails
2. **Social Sharing**: Allow users to share invitations via social media
3. **Referral Program**: Reward users for successful invitations
4. **Tiered Access**: Different invitation types for different access levels
