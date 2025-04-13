# Updated Avolve Route Structure 2025

## Overview

As part of the 2025 best practices implementation, the Avolve project has consolidated all super routes under the `/super/` structure. This update ensures consistency in navigation, route protection, and user experience across the platform.

## Core User Journey

### 1. Discovery & Onboarding (Public)
- `/` - Landing page with AI-powered personalization
  - Value proposition
  - Social proof
  - Dynamic feature showcase
  - Personalized CTA

### 2. Authentication Flow
- `/(auth)`
  - `/signin` - Unified sign-in
  - `/signup` - Progressive sign-up
  - `/verify` - Email verification
  - `/reset-password` - Password reset
  - `/update-password` - Password update
  - `/error` - Contextual error handling
  - `/invite` - Invitation handling

### 3. Onboarding Experience
- `/welcome` - Guided onboarding
  - Variant A/B testing
  - 5-step process:
    1. Welcome & orientation
    2. Profile setup
    3. Token introduction
    4. Community connection
    5. Goal setting

### 4. Core Features (Authenticated)
- `/dashboard` - Personalized home
  - Activity feed
  - Progress metrics
  - Recommendations
  - Quick actions

- `/profile` - User profile & settings
  - Personal info
  - Preferences
  - Privacy settings
  - Integration management

- `/teams` - Collaboration hub
  - `/teams/[id]` - Team workspace
  - `/teams/create` - Team creation
  - `/teams/discover` - Team discovery

- `/tokens` - Token management
  - Token overview
  - Transaction history
  - Rewards center
  - Achievement tracking

### 5. Super Features
- `/super` - Advanced features
  - `/super/personal` - Personal Growth
  - `/super/business` - Business
  - `/super/mind` - Mind
  - `/super/puzzle` - Puzzle
  - `/super/human` - Human
  - `/super/society` - Society
  - `/super/genius` - Genius
  - `/super/civilization` - Civilization
  - `/super/puzzles` - Puzzle system
    - `/super/puzzles/[id]` - Individual puzzle
    - `/super/puzzles/[id]/contribute` - Contributions
    - `/super/puzzles/today` - Daily challenge
  - `/super/sacred-geometry` - Sacred geometry
  - `/super/participation` - Participation tracking

### 6. Admin & Management
- `/admin` - Admin dashboard
  - Platform metrics
  - Recent activity
  - Quick actions

- `/admin/analytics` - Platform analytics
  - Growth metrics
  - Engagement metrics
  - Retention metrics
  - Custom reports

- `/admin/users` - User management
  - User search
  - Role management
  - Account actions

- `/admin/content` - Content moderation
  - Flagged content
  - Content guidelines
  - Review queue

- `/admin/security` - Security center
  - Access logs
  - Security settings
  - Rate limiting
  - API keys

### 7. System Pages
- `/unauthorized` - Access denied
- `/protected` - Protected content base
- `/subscription` - Plan management
- `/(unauthenticated)` - Public layout wrapper

## API Routes

### 1. Core API
- `/api/health` - System health check
- `/api/metrics` - Performance metrics
- `/api/feedback` - User feedback

### 2. Feature APIs
- `/api/teams/*` - Team management
- `/api/tokens/*` - Token operations
- `/api/puzzles/*` - Puzzle system
- `/api/auth/*` - Authentication

## Best Practices Implementation

### 1. Progressive Enhancement
- All routes support both JavaScript and non-JavaScript experiences
- Fallback content for unsupported features
- Graceful degradation strategy

### 2. Performance Optimization
- Route-based code splitting
- Prefetching for likely navigation
- Optimized loading states
- Edge-ready architecture

### 3. User Experience
- Consistent navigation patterns
- Contextual breadcrumbs
- Meaningful transitions
- Error recovery paths

### 4. Accessibility
- WCAG 2.2 compliance
- Keyboard navigation
- Screen reader optimization
- High contrast support

### 5. Analytics & Monitoring
- Navigation path analysis
- User behavior tracking
- Performance monitoring

## Migration Summary

1. **New Routes Added**:
   - Consolidated all super features under `/super/`.
   - Added specific paths for personal growth, business, mind, etc., under `/super/`.

2. **Enhancements to Existing Routes**:
   - Updated route protection in middleware to reflect the new structure.
   - Ensured navigation components adapt to the consolidated structure.

3. **Removed Unnecessary Routes**:
   - Consolidated duplicate functionality under the new `/super/` hierarchy.

This updated route structure aligns with the strategic plan for 2025, focusing on user experience, performance, and security. For detailed implementation or feedback, refer to the Avolve project documentation or contact the development team.
