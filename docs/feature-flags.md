# Avolve Feature Flags System

## Overview

The Avolve platform uses feature flags to control access to features, create a sense of progression, and enable a gradual rollout of functionality. This document explains how the feature flags system works, how to manage feature access, and how to implement new feature unlocks.

## Purpose and Benefits

- **Controlled Progression**: Gradually introduce users to platform capabilities
- **User Delight**: Create moments of excitement when new features are unlocked
- **Testing**: Safely test new features with limited user groups
- **Personalization**: Tailor the user experience based on engagement and progress
- **Analytics**: Measure feature usage and impact on user behavior

## User Experience

### Feature Discovery

- **Locked Features**: Visible but inaccessible features in the sidebar with clear unlock criteria
- **Teaser Content**: Preview content that hints at upcoming features
- **Progress Tracking**: Visual indicators of progress toward unlocking features

### Unlock Experience

- **Unlock Animation**: Celebratory animation when a feature is unlocked
- **Email Notification**: Email sent to notify users of newly unlocked features
- **In-App Notification**: Notification in the notification center about new features
- **Guided Tour**: Optional walkthrough of newly unlocked features

## Admin Guide

### Managing Feature Flags

Admins can manage feature flags in the following ways:

1. **Create Feature Flags**:

   - Navigate to Admin > Features
   - Click "Create Feature Flag"
   - Enter key, name, and description
   - Set default enabled status
   - Click "Create"

2. **Edit Feature Flags**:

   - Navigate to Admin > Features
   - Find the feature to edit
   - Click "Edit"
   - Update details
   - Click "Update"

3. **Manage User Access**:
   - Navigate to Admin > Users
   - Find the user to manage
   - Click "Manage"
   - Under "Features" tab, toggle access to specific features
   - Click "Save Changes"

### Unlock Strategies

- **Time-Based**: Unlock features after a certain period of membership
- **Engagement-Based**: Unlock features based on user activity and engagement
- **Achievement-Based**: Unlock features when users complete specific actions
- **Admin-Granted**: Manually grant access to specific users or groups

## Technical Implementation

### Database Schema

The feature flags system uses the following tables:

- `feature_flags`: Stores feature definitions and default settings
- `user_features`: Maps users to their enabled features
- `notifications`: Stores feature unlock notifications
- `metrics`: Tracks feature-related events

### API Endpoints

- `GET /api/features`: Gets all features for the current user
- `POST /api/features/enable`: Enables a feature for a user
- `POST /api/features/unlock-notification`: Sends notifications for unlocked features
- `GET /api/features/admin`: Gets all features (admin only)
- `POST /api/features/admin`: Creates or updates features (admin only)

### Components

- `FeatureFlagProvider`: React context provider for feature flags
- `useFeatureFlags`: Hook for accessing feature flag state
- `FeatureUnlockAnimation`: Component that displays unlock animations
- `LockedFeature`: Component for displaying locked features

## Implementation Guide

### Adding a New Feature Flag

1. **Create the Feature Flag**:

   - Add the feature flag in the admin interface
   - Set the default to disabled for new users

2. **Implement Feature Check**:

   ```jsx
   import { useFeatureFlags } from '@/hooks/useFeatureFlags';

   function MyComponent() {
     const { hasFeature } = useFeatureFlags();

     if (!hasFeature('feature_key')) {
       return <LockedFeature name="Feature Name" />;
     }

     return <ActualFeature />;
   }
   ```

3. **Add Unlock Criteria**:

   - Implement the logic that determines when to unlock the feature
   - Call the feature enable API when criteria are met

4. **Test the Feature**:
   - Test with the feature both enabled and disabled
   - Verify the unlock experience works correctly

## Analytics and Monitoring

The feature flags system tracks the following metrics:

- **Feature Unlock Rate**: How many users unlock each feature over time
- **Feature Usage**: How often unlocked features are used
- **Engagement Impact**: How feature unlocks affect overall engagement
- **Progression Speed**: How quickly users progress through feature unlocks

## Best Practices

1. **Feature Rollout Strategy**:

   - Start with core features available to all users
   - Create a clear progression path for feature unlocks
   - Balance challenge with accessibility for unlocking criteria

2. **User Communication**:

   - Clearly communicate how features are unlocked
   - Celebrate feature unlocks to create moments of delight
   - Provide guidance on newly unlocked features

3. **Monitoring and Iteration**:
   - Regularly review feature unlock and usage metrics
   - Adjust unlock criteria based on user feedback and behavior
   - Consider removing flags for universally beneficial features

## Troubleshooting

### Common Issues

1. **Feature Not Appearing**:

   - Check if the feature flag exists in the database
   - Verify the feature key is spelled correctly in code
   - Ensure the user has the feature enabled

2. **Unlock Animation Not Showing**:

   - Check if the notification API was called
   - Verify the animation component is properly mounted
   - Check for JavaScript errors in the console

3. **Inconsistent Feature State**:
   - Clear browser cache and reload
   - Verify database state for the user's features
   - Check for race conditions in feature state updates
