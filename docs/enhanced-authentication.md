# Enhanced Authentication System

## Overview

The Avolve platform implements a robust authentication system built on Supabase Auth with additional security features and integrations with the platform's business logic. This document outlines the architecture, features, and usage patterns of the enhanced authentication system.

## Architecture

The authentication system consists of several key components:

1. **AuthService**: A centralized service that handles all authentication-related functionality.
2. **useAuth Hook**: A React hook that provides authentication state and methods to components.
3. **Middleware**: Server-side middleware that handles session management and route protection.
4. **Database Functions**: PostgreSQL functions that integrate authentication with database operations.
5. **Security Policies**: Row-Level Security (RLS) policies that enforce access control at the database level.

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  React UI   │────▶│  AuthService │────▶│  Supabase   │
│  Components │◀────│     API      │◀────│    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Database   │     │  JWT Token  │
                    │  Functions  │     │  Validation │
                    └─────────────┘     └─────────────┘
```

## Features

### User Authentication

- **Email/Password Authentication**: Traditional email and password sign-in.
- **Magic Link Authentication**: Passwordless authentication via email links.
- **OAuth Providers**: Support for third-party authentication providers (Google, GitHub, etc.).
- **Multi-factor Authentication**: Additional security layer for sensitive operations.

### Session Management

- **Secure Cookie-based Sessions**: HTTP-only cookies for secure session storage.
- **CSRF Protection**: Cross-Site Request Forgery protection for all authenticated requests.
- **Automatic Session Refresh**: Background refreshing of sessions to maintain user state.

### Authorization

- **Role-based Access Control**: User roles and permissions management.
- **Row-Level Security**: Database-level access control for all resources.
- **Resource Ownership**: Automatic verification of resource ownership.

### User Management

- **User Profiles**: Automatic creation and management of user profiles.
- **Account Recovery**: Password reset and account recovery flows.
- **Email Verification**: Verification of user email addresses.
- **Account Deletion**: Secure account deletion with data archiving.

### Security Features

- **Rate Limiting**: Protection against brute force attacks.
- **Audit Logging**: Comprehensive logging of authentication events.
- **Secure Headers**: HTTP security headers for all responses.
- **Data Encryption**: Encryption of sensitive user data.

## Usage

### Client-Side Authentication

#### Using the AuthService

The `AuthService` class provides methods for all authentication operations:

```typescript
import { AuthService } from '@/lib/auth/auth-service';

// Get browser-side instance
const authService = AuthService.getBrowserInstance();

// Sign in with email and password
const { data, error } = await authService.signInWithPassword('user@example.com', 'password');

// Sign in with magic link
const { error } = await authService.signInWithMagicLink('user@example.com');

// Sign up a new user
const { data, error } = await authService.signUp('user@example.com', 'password');

// Sign out
const { error } = await authService.signOut();

// Get the current session
const { data: session } = await authService.getSession();

// Get the current user
const { data: user } = await authService.getUser();

// Get the user profile with additional data
const { data: profile } = await authService.getUserProfile();
```

#### Using the useAuth Hook

The `useAuth` hook provides authentication state and methods to React components:

```tsx
import { useAuth } from '@/lib/hooks/use-auth';

function ProfileComponent() {
  const { 
    user, 
    isLoading, 
    isAuthenticated,
    error,
    signOut 
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.fullName || user?.username}</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

#### Protecting Routes

Use the `withAuth` HOC to protect routes that require authentication:

```tsx
import { withAuth } from '@/lib/hooks/use-auth';

function DashboardPage() {
  // Dashboard content
  return <div>Dashboard Content</div>;
}

// Protect the route and redirect to login if not authenticated
export default withAuth(DashboardPage, { redirectTo: '/auth/login' });

// Protect the route and require a specific role
export default withAuth(AdminPage, { 
  redirectTo: '/auth/login',
  requiredRole: 'admin'
});
```

### Server-Side Authentication

#### Using the AuthService in API Routes

```typescript
import { AuthService } from '@/lib/auth/auth-service';

export async function GET(request: Request) {
  // Get server-side instance
  const authService = AuthService.getServerInstance();
  
  // Validate the session
  const { data: session, error } = await authService.setSessionCookie(request);
  
  if (error || !session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Process the authenticated request
  // ...
}
```

### Database Functions

The authentication system provides several database functions for use in SQL queries:

```sql
-- Get the current user ID
SELECT public.get_auth_user_id();

-- Check if the user is authenticated
SELECT public.is_authenticated();

-- Check if the user is an admin
SELECT public.is_admin();

-- Check if the user has a specific role
SELECT public.has_role('moderator');

-- Check if the user owns a resource
SELECT public.is_owner('posts', '123e4567-e89b-12d3-a456-426614174000');

-- Get the current user's profile
SELECT * FROM public.get_current_user_profile();

-- Get the user's token balances
SELECT * FROM public.get_user_token_balances();

-- Get the user's recent transactions
SELECT * FROM public.get_user_recent_transactions(5);

-- Get the user's community memberships
SELECT * FROM public.get_user_community_memberships();

-- Get the user's upcoming meetings
SELECT * FROM public.get_user_upcoming_meetings(3);
```

## Security Considerations

### Password Security

- Passwords are hashed using bcrypt with a work factor of 10.
- Password requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.
- Password history is maintained to prevent reuse of recent passwords.

### Session Security

- Sessions are stored in HTTP-only cookies with secure and SameSite flags.
- Session tokens are rotated periodically to mitigate the risk of token theft.
- CSRF tokens are required for all state-changing operations.

### Data Security

- Sensitive user data is encrypted at rest.
- Row-Level Security (RLS) policies ensure users can only access their own data.
- Soft deletion is used to preserve data integrity and allow for recovery.

### API Security

- Rate limiting is applied to authentication endpoints to prevent brute force attacks.
- Security headers are set on all responses to mitigate common web vulnerabilities.
- API requests are validated against a schema to prevent injection attacks.

## Error Handling

The authentication system provides detailed error messages for debugging while maintaining security:

```typescript
try {
  const { data, error } = await authService.signInWithPassword(email, password);
  
  if (error) {
    // Handle specific error types
    switch (error.code) {
      case 'auth/invalid-email':
        // Handle invalid email
        break;
      case 'auth/wrong-password':
        // Handle wrong password
        break;
      case 'auth/user-not-found':
        // Handle user not found
        break;
      default:
        // Handle other errors
        break;
    }
  }
} catch (err) {
  // Handle unexpected errors
  console.error('Authentication error:', err);
}
```

## Best Practices

1. **Always Use HTTPS**: Ensure all authentication traffic is encrypted.
2. **Implement Rate Limiting**: Protect against brute force attacks.
3. **Use HTTP-Only Cookies**: Store session tokens in HTTP-only cookies.
4. **Implement CSRF Protection**: Use CSRF tokens for all state-changing operations.
5. **Validate User Input**: Sanitize and validate all user input.
6. **Implement Proper Error Handling**: Provide helpful error messages without revealing sensitive information.
7. **Use Row-Level Security**: Enforce access control at the database level.
8. **Audit Authentication Events**: Log all authentication events for security monitoring.
9. **Implement Account Recovery**: Provide secure account recovery options.
10. **Regular Security Reviews**: Conduct regular security reviews of the authentication system.

## Conclusion

The enhanced authentication system provides a secure, scalable, and user-friendly authentication experience for the Avolve platform. By leveraging Supabase Auth and implementing additional security features, the system ensures that user data is protected while providing a seamless authentication experience.
