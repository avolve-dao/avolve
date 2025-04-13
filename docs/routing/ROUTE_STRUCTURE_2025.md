# Avolve Route Structure 2025

## Core User Journey

### 1. Discovery & Onboarding (Public)
- `/` - Landing page with AI-powered personalization
  - Value proposition
  - Social proof
  - Dynamic feature showcase
  - Personalized CTA

### 2. Authentication Flow
- `/(auth)`
  - `/signin` - Unified sign-in (password/social)
  - `/signup` - Progressive sign-up
  - `/verify` - Email verification
  - `/reset-password` - Password reset
  - `/update-password` - Password update
  - `/error` - Contextual error handling
  - `/invite` - Invitation handling

### 3. Onboarding Experience
- `/welcome` - Personalized onboarding
  1. Profile setup
  2. Focus selection
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
  - Status tracking
  - Bulk actions

- `/admin/content` - Content management
  - Resource creation
  - Challenge management
  - Community updates
  - Content analytics

- `/admin/security` - Security controls
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
- Page-specific metrics
- User journey tracking
- Performance monitoring
- Error tracking

### 6. SEO Optimization
- Dynamic metadata
- Structured data
- Social media previews
- Sitemap generation

## Required Changes

1. Add New Routes:
   - `/dashboard` for personalized home 
   - `/teams/discover` for team discovery 
   - `/admin/analytics` for usage insights 
   - `/admin/users` for user management 
   - `/admin/content` for content management 
   - `/api/metrics` for performance tracking 
   - `/api/feedback` for user feedback 

2. Enhance Existing Routes:
   - Update landing page with AI personalization 
   - Add progressive sign-up flow 
   - Implement contextual error pages 
   - Add achievement tracking to tokens 

3. Remove Unnecessary Routes:
   - Consolidate duplicate functionality 
   - Remove development/test routes 
   - Streamline authentication paths 

4. Optimize Route Organization:
   - Group related features 
   - Implement consistent naming 
   - Add proper metadata 
   - Setup analytics tracking 
