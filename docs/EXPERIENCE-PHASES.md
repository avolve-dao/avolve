# Avolve Experience Phases System

Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.

This document and its contents are proprietary and confidential.

## Overview

The Avolve experience phases system implements Yu-kai Chou's four-phase gamification framework across the platform's three pillars. This progressive disclosure approach guides users through their journey, revealing features and content as they demonstrate readiness and engagement.

## Experience Phases

### 1. Discovery Phase

**Purpose**: Help users discover the value proposition and make the commitment to engage.

**Implementation**:
- Initial onboarding experience
- Limited feature set focused on core value
- Contextual tooltips and guided tours
- Preview of locked features with clear unlock criteria

**User Experience**:
- Low-pressure introduction to platform concepts
- Early wins to build confidence
- Clear pathways to advancement

### 2. Onboarding Phase

**Purpose**: Teach users how the system works and how to achieve win states.

**Implementation**:
- Step-by-step guidance through core features
- Structured learning paths with milestone tracking
- Increased token rewards for completion
- Expanded feature access

**User Experience**:
- Structured progression with clear feedback
- Skill development through guided practice
- Sense of accomplishment through milestone completion

### 3. Scaffolding Phase

**Purpose**: Engage users in the regular journey with progressive challenges.

**Implementation**:
- Full access to pillar-specific features
- Community integration and collaborative opportunities
- Advanced challenges with higher rewards
- Personalized recommendations based on behavior

**User Experience**:
- Deeper engagement with platform mechanics
- Social connection with community
- Autonomy in choosing progression paths

### 4. Endgame Phase

**Purpose**: Retain veteran users through advanced participation and mastery.

**Implementation**:
- Access to governance and leadership opportunities
- Mentorship capabilities
- Advanced customization options
- Recognition and status features

**User Experience**:
- Sense of mastery and ownership
- Contribution to platform evolution
- Recognition as a community leader

## Database Schema

### Tables

1. **user_pillar_progress**
   - `id`: UUID (primary key)
   - `user_id`: UUID (references auth.users)
   - `pillar`: Text (superachiever, superachievers, supercivilization)
   - `current_phase`: experience_phase enum (discover, onboard, scaffold, endgame)
   - `phase_progress`: Integer (0-100)
   - `unlocked_features`: JSONB
   - `completed_milestones`: JSONB
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

2. **user_phase_transitions**
   - `id`: UUID (primary key)
   - `user_id`: UUID (references auth.users)
   - `pillar`: Text
   - `from_phase`: experience_phase
   - `to_phase`: experience_phase
   - `transitioned_at`: Timestamptz

3. **phase_milestones**
   - `id`: UUID (primary key)
   - `pillar`: Text
   - `phase`: experience_phase
   - `name`: Text
   - `description`: Text
   - `required_for_advancement`: Boolean
   - `token_reward`: Integer
   - `token_type`: Text
   - `order_index`: Integer
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

4. **user_milestone_progress**
   - `id`: UUID (primary key)
   - `user_id`: UUID (references auth.users)
   - `milestone_id`: UUID (references phase_milestones)
   - `is_completed`: Boolean
   - `progress`: Integer (0-100)
   - `completed_at`: Timestamptz
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

5. **phase_requirements**
   - `id`: UUID (primary key)
   - `pillar`: Text
   - `phase`: experience_phase
   - `phase_milestone_threshold`: Integer
   - `token_requirements`: JSONB
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

### Materialized Views

1. **user_progress_analytics**
   - Aggregates user progress data across pillars
   - Provides milestone completion statistics
   - Enables efficient dashboard rendering

### Functions

1. **update_user_phase()**
   - Trigger function that automatically advances users to the next phase when requirements are met
   - Records phase transitions
   - Resets phase progress for the new phase

2. **initialize_user_progress()**
   - Creates initial progress records for new users
   - Sets all pillars to the Discovery phase

3. **complete_milestone()**
   - Marks a milestone as completed
   - Awards tokens based on milestone definition
   - Updates user progress percentage
   - Checks if user should advance to next phase

4. **calculate_overall_progress()**
   - Calculates overall progress across all pillars
   - Returns JSON with overall and per-pillar progress

5. **get_user_progress()**
   - Retrieves comprehensive user progress data
   - Includes available milestones and phase transitions

## Integration with Token System

The experience phases system is tightly integrated with the token system:

1. **Milestone Rewards**
   - Completing milestones awards tokens
   - Token types and amounts vary by pillar and phase
   - Higher phases offer larger token rewards

2. **Phase Advancement Requirements**
   - Some phases require minimum token balances
   - Token requirements increase with phase progression

3. **Feature Unlocking**
   - Features are unlocked based on phase and token balances
   - Progressive disclosure of advanced features

## Client Implementation

### React Hooks

1. **useExperiencePhases**
   - Provides phase management functionality
   - Real-time updates via Supabase subscriptions
   - Methods for completing milestones and checking progress

```typescript
// Example usage
const { 
  userProgress, 
  completeMilestone, 
  getCurrentPhase, 
  isFeatureAvailable 
} = useExperiencePhases();

// Get current phase for a pillar
const currentPhase = getCurrentPhase('superachiever');

// Check if a feature is available
if (isFeatureAvailable('mentorship', 'superachiever')) {
  // Show feature
}

// Complete a milestone
await completeMilestone(milestoneId);
```

### Components

1. **JourneyMap**
   - Visualizes user progression through phases across pillars
   - Shows completed and available milestones
   - Indicates current position and next steps

2. **FocusMode**
   - Provides personalized recommendations based on current phase
   - Highlights next best actions for progression
   - Adapts content based on user's phase and progress

3. **FeaturePreview**
   - Shows locked and unlocked features
   - Displays requirements for unlocking
   - Tracks progress toward requirements

4. **PhaseCelebration**
   - Displays celebratory messages when users advance phases
   - Highlights new capabilities and opportunities
   - Creates moments of delight and achievement

5. **UnifiedNav**
   - Adapts navigation based on user's current phase
   - Progressive disclosure of navigation options
   - Visual indicators of current phase and progress

## Performance Optimizations

1. **Database Partitioning**
   - Partitioned tables for user_phase_transitions by date
   - Improves query performance for large datasets

2. **Materialized Views**
   - Precalculated analytics for dashboard rendering
   - Scheduled refreshes for data currency

3. **Indexing**
   - Strategic indexes on frequently queried columns
   - Optimized for phase and milestone lookups

4. **React Server Components**
   - Server-side rendering for static content
   - Client components only where interactivity is needed
   - Improved initial page load performance

5. **Suspense and Streaming**
   - Progressive loading of complex components
   - Skeleton UI during data fetching
   - Prioritized loading of critical UI elements

## Security Considerations

1. **Row Level Security**
   - Users can only view and modify their own progress
   - Phase requirements and milestones are publicly viewable
   - Phase transitions are protected by RLS policies

2. **Data Validation**
   - Server-side validation of milestone completion
   - Protection against manipulation of progress data
   - Atomic transactions for phase transitions

3. **Audit Logging**
   - Records of all phase transitions
   - Milestone completion history
   - Protection against rollback attacks

## Accessibility Considerations

1. **Progressive Enhancement**
   - Core functionality works without JavaScript
   - Enhanced experience with client-side features

2. **Screen Reader Support**
   - ARIA attributes for interactive elements
   - Descriptive alt text for phase visualizations
   - Announcements for phase transitions

3. **Keyboard Navigation**
   - Full keyboard support for all interactions
   - Focus management for modal dialogs
   - Skip links for navigation

## Best Practices for Implementation

1. **Server Components for Data Fetching**
   - Use React Server Components for initial data loading
   - Keep client components focused on interactivity
   - Implement proper Suspense boundaries

```tsx
// Server Component
async function UserProgressData({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.rpc('get_user_progress', { p_user_id: userId });
  return <UserProgressClient data={data} />;
}

// Client Component
'use client';
function UserProgressClient({ data }: { data: UserProgress[] }) {
  // Interactive UI with data
}

// Export with Suspense
export function UserProgress(props: { userId: string }) {
  return (
    <Suspense fallback={<ProgressSkeleton />}>
      <UserProgressData {...props} />
    </Suspense>
  );
}
```

2. **Real-time Updates**
   - Use Supabase subscriptions for live updates
   - Implement optimistic UI updates for better UX
   - Handle offline scenarios gracefully

3. **Error Boundaries**
   - Implement error boundaries around critical components
   - Provide fallback UI for error states
   - Log errors for monitoring

4. **Testing Strategy**
   - Unit tests for phase calculation logic
   - Integration tests for database functions
   - E2E tests for user journeys across phases

## Future Enhancements

1. **AI-Powered Recommendations**
   - Personalized milestone suggestions based on user behavior
   - Predictive modeling for phase progression
   - Content recommendations tailored to phase

2. **Advanced Analytics**
   - Cohort analysis by phase and pillar
   - Progression velocity metrics
   - Milestone completion patterns

3. **Dynamic Phase Requirements**
   - Adjust requirements based on user behavior
   - A/B testing of progression paths
   - Personalized challenge difficulty

4. **Social Progression**
   - Group progression mechanics
   - Collaborative milestone completion
   - Team-based phase advancement

## Conclusion

The Avolve experience phases system provides a comprehensive framework for guiding users through their journey on the platform. By implementing Yu-kai Chou's four-phase approach across all three pillars, we create a personalized, engaging experience that adapts to each user's progress and preferences.

This system, combined with the token economy, creates a powerful gamification engine that drives meaningful engagement and progression while maintaining a focus on delivering real value to users at each stage of their journey.
