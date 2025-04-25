# Feature Flags System

The Avolve platform uses a robust feature flags system to control feature visibility, enable progressive unlocks, and manage feature rollouts. This document explains how the feature flags system works and how to use it.

## Overview

The feature flags system allows:

- **Administrators** to control which features are available to users
- **Gradual rollouts** of new features to specific user segments
- **Token-based unlocks** where users earn access through engagement
- **Percentage-based rollouts** for A/B testing and controlled releases
- **Role-based access** to features based on user roles

## Database Structure

The feature flags system is built on two primary tables:

### `feature_flags` Table

Stores feature flags and their configuration:

| Column               | Type      | Description                                      |
| -------------------- | --------- | ------------------------------------------------ |
| `id`                 | UUID      | Primary key                                      |
| `key`                | TEXT      | Unique feature key (e.g., 'advanced_analytics')  |
| `description`        | TEXT      | Description of the feature                       |
| `value`              | JSONB     | Configuration values for the feature             |
| `enabled`            | BOOLEAN   | Whether the feature is globally enabled          |
| `percentage_rollout` | INTEGER   | Percentage of users who get this feature (0-100) |
| `user_ids`           | UUID[]    | Specific users who get this feature              |
| `user_roles`         | TEXT[]    | User roles that get this feature                 |
| `token_requirements` | JSONB     | Token requirements to unlock this feature        |
| `created_at`         | TIMESTAMP | When the feature flag was created                |
| `updated_at`         | TIMESTAMP | When the feature flag was last updated           |

### `feature_categories` Table

Organizes features into logical categories for display in the UI:

| Column          | Type      | Description                              |
| --------------- | --------- | ---------------------------------------- |
| `id`            | UUID      | Primary key                              |
| `name`          | TEXT      | Display name of the category             |
| `description`   | TEXT      | Description of the category              |
| `icon`          | TEXT      | Icon name for the category               |
| `display_order` | INTEGER   | Order in which to display the categories |
| `features`      | TEXT[]    | Array of feature keys in this category   |
| `created_at`    | TIMESTAMP | When the category was created            |
| `updated_at`    | TIMESTAMP | When the category was last updated       |

## API Endpoints

### `/api/features`

- **GET**: Fetch enabled features for the current user

## React Components

### `FeatureGate`

Component for conditionally rendering content based on feature flag status:

```tsx
import { FeatureGate } from '@/components/feature-flags/FeatureGate';

// In your component:
<FeatureGate feature="advanced_analytics">
  <AdvancedAnalyticsComponent />
</FeatureGate>

// With fallback content:
<FeatureGate
  feature="premium_reports"
  fallback={<PremiumFeatureTeaser />}
  showTooltip={true}
>
  <PremiumReportsComponent />
</FeatureGate>
```

### `FeatureUnlockProgress`

Component for showing users their progress toward unlocking features:

```tsx
import { FeatureUnlockProgress } from '@/components/feature-flags/FeatureUnlockProgress';

// In your dashboard:
<FeatureUnlockProgress />;
```

### `useFeatureFlags` Hook

React hook for checking feature flag status in components:

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { isEnabled, features, loading } = useFeatureFlags();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {isEnabled('feature_x') && <FeatureXComponent />}

      {isEnabled('feature_y') ? <FeatureYComponent /> : <FeatureYTeaser />}
    </div>
  );
}
```

## Admin Interface

The feature flags admin interface is available at `/admin/features` and allows administrators to:

1. Create new feature flags
2. Enable/disable existing features
3. Configure percentage rollouts
4. Set token requirements
5. Assign features to specific users or roles
6. Organize features into categories

## Usage Examples

### Checking if a Feature is Enabled

```tsx
// Using the hook
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { isEnabled } = useFeatureFlags();

  if (isEnabled('premium_feature')) {
    // Render premium feature
  }

  return (
    // Component JSX
  );
}

// Using the FeatureGate component
import { FeatureGate } from '@/components/feature-flags/FeatureGate';

function MyComponent() {
  return (
    <FeatureGate
      feature="premium_feature"
      fallback={<PremiumFeatureTeaser />}
    >
      <PremiumFeatureContent />
    </FeatureGate>
  );
}
```

### Creating a New Feature Flag (Admin)

```tsx
// In an admin component
const createFeatureFlag = async () => {
  try {
    const response = await fetch('/api/admin/features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'new_feature',
        description: 'Description of the new feature',
        enabled: false,
        percentage_rollout: 10,
        token_requirements: {
          AVOLVE: 100,
        },
      }),
    });

    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error creating feature flag:', error);
  }
};
```

### Updating a Feature Flag (Admin)

```tsx
// In an admin component
const updateFeatureFlag = async (id, updates) => {
  try {
    const response = await fetch(`/api/admin/features/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    // Handle the response
  } catch (error) {
    console.error('Error updating feature flag:', error);
  }
};
```

## Implementation Details

### Feature Evaluation Logic

Features are evaluated in the following order:

1. Is the feature globally enabled?
2. Is the user in the `user_ids` list?
3. Does the user have a role in the `user_roles` list?
4. Does the user meet the token requirements?
5. Is the user in the percentage rollout?

### Token Requirements

Token requirements are specified as a JSON object where:

- Keys are token types (e.g., 'AVOLVE', 'CONTRIBUTION')
- Values are the required amounts

Example:

```json
{
  "AVOLVE": 100,
  "CONTRIBUTION": 50
}
```

### Percentage Rollout

Percentage rollout is implemented using a deterministic hashing algorithm that:

1. Combines the user ID and feature key
2. Generates a hash value
3. Maps the hash to a value between 0-100
4. Enables the feature if the value is less than the rollout percentage

This ensures that the same user always gets the same result for a given feature, providing a consistent experience.

## Security Considerations

- All feature flag operations are protected by Row Level Security (RLS) policies
- Only admins can create and modify feature flags
- Users can only see features they have access to
- Feature flag evaluations happen on both the server and client for maximum security

## Analytics and Metrics

The feature flags system logs events to the `metrics` table for analytics:

- `feature_flag_created`: When an admin creates a feature flag
- `feature_flag_updated`: When an admin updates a feature flag
- `feature_flag_enabled`: When a feature is enabled for a user
- `feature_unlocked`: When a user unlocks a feature through tokens

## Best Practices

1. **Use Clear Keys**: Feature keys should be descriptive and use snake_case
2. **Start Small**: Begin with a small percentage rollout and increase gradually
3. **Set Token Requirements**: Use token requirements to gamify feature unlocks
4. **Provide Feedback**: Always show users how to unlock features they don't have
5. **Clean Up**: Remove feature flags that are fully rolled out or deprecated

## Troubleshooting

### Common Issues

1. **Feature Not Showing**: Check if the feature is enabled and the user meets the requirements
2. **Inconsistent Behavior**: Ensure the feature is evaluated the same way on server and client
3. **Performance Issues**: Too many feature flags can impact performance

### Debugging

1. Check the feature flags in the database
2. Use the browser console to log `features` from the `useFeatureFlags` hook
3. Verify that the user has the required tokens

## Extending the System

The feature flags system can be extended in several ways:

1. **Time-Based Flags**: Enable features for specific time periods
2. **Location-Based Flags**: Enable features based on user location
3. **Device-Based Flags**: Enable features based on device type
4. **Usage-Based Flags**: Enable features based on user activity
5. **A/B Testing**: Extend for more sophisticated A/B testing scenarios
