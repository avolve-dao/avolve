# Route Map

## Public Routes
- `/` - Landing page
- `/unauthorized` - Unauthorized access page

## Authentication Routes (/(auth))
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/verify` - Email verification
- `/reset-password` - Password reset request
- `/update-password` - Password update form
- `/error` - Auth error page
- `/invite` - Invitation handling

## Authenticated Routes
- `/profile` - User profile management
- `/welcome` - Initial onboarding
- `/teams` - Team management
  - `/teams/[id]` - Individual team view
  - `/teams/create` - Create new team
- `/tokens` - Token management
- `/subscription` - Subscription management

## Super Routes (/super)
- `/super/puzzles` - Puzzle management
  - `/super/puzzles/[id]` - Individual puzzle
  - `/super/puzzles/[id]/contribute` - Puzzle contributions
  - `/super/puzzles/today` - Today's puzzle
- `/super/sacred-geometry` - Sacred geometry features
- `/super/participation` - Participation tracking

## Admin Routes
- `/admin/security` - Security settings and monitoring

## Protected System Routes
- `/protected` - Protected content base
- `/(unauthenticated)` - Unauthenticated layout wrapper
- `/api/health` - System health check endpoint

## Route Groups
1. `(auth)` - Authentication flow pages
2. `(unauthenticated)` - Pages for non-authenticated users
3. `(authenticated)` - Pages requiring authentication

## Access Control
- Public routes: No authentication required
- Auth routes: Special handling for authentication flow
- Authenticated routes: Require valid session
- Super routes: Require authentication + specific permissions
- Admin routes: Require admin role
- Protected routes: Require specific feature flags/permissions

## Navigation Structure
1. Main Navigation (Authenticated)
   - Profile
   - Teams
   - Tokens
   - Super Features (if authorized)
   
2. Auth Navigation (Unauthenticated)
   - Sign In
   - Sign Up
   - Password Reset
   
3. Admin Navigation (Admin users)
   - Security
   - Monitoring

## URL Patterns
- Use kebab-case for URLs
- Use descriptive, semantic names
- Group related features
- Maintain logical hierarchy
- Keep URLs as short as possible

## Redirects
- Unauthenticated users → Sign in
- Authenticated users → Dashboard
- Invalid routes → 404
- Unauthorized access → /unauthorized
- Completed onboarding → Dashboard
- Incomplete onboarding → Welcome
