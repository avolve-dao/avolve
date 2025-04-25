# Avolve Platform Launch Guide

## Introduction

Welcome to the Avolve Platform! This guide will help you understand the platform's core features and how to get started with the invitation-only onboarding process, feature unlocks, and user progression system.

## 🚀 Launch Checklist

Before launching the platform to users, ensure the following items are completed:

- [x] End-to-end testing of invitation flow
- [x] End-to-end testing of onboarding flow
- [x] End-to-end testing of feature flag system
- [x] End-to-end testing of token system
- [x] TypeScript errors fixed
- [x] Lint errors fixed
- [x] Documentation updated
- [ ] Environment variables set in production
- [ ] Email delivery verified in production
- [ ] Analytics integration verified

## 🔑 Core Features

### Invitation System

The Avolve platform uses an invitation-only system for onboarding new users. This creates exclusivity and ensures a controlled growth of the community.

**Key Components:**

- Invitation creation (requires GEN tokens or admin privileges)
- Invitation claiming
- Bulk invitation creation (admin only)
- Invitation tracking and analytics

### Onboarding Flow

The onboarding process is designed to quickly establish a user's identity and intentions, providing immediate value and clear progression.

**Key Steps:**

1. Identity setup
2. Intention setting
3. First contribution
4. Community introduction

### Feature Flag System

Features are progressively unlocked as users engage with the platform, creating a sense of achievement and progression.

**Key Aspects:**

- Token-based unlocks
- Admin-controlled feature flags
- Unlock notifications and celebrations
- Feature teasing in the UI

### Token System

Tokens are the primary currency within the platform, used to unlock features and reward contributions.

**Token Types:**

- GEN (General) - Basic engagement and activity
- CRED (Credibility) - Quality contributions and community standing
- INFL (Influence) - Impact and leadership within the community

## 👨‍💼 Administrator Guide

### Managing Invitations

Administrators can create and manage invitations through:

1. The admin dashboard
2. The bulk invitation API endpoint
3. The invitation manager component

```bash
# Example: Create bulk invitations via API
curl -X POST https://your-domain.com/api/invitations/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"count": 10, "expiresInDays": 14, "metadata": {"campaign": "launch"}}'
```

### Managing Feature Flags

Administrators can control which features are available to users through:

1. The feature flag dashboard
2. Direct database management
3. The feature flag API endpoints

```bash
# Example: Enable a feature for a specific user
curl -X POST https://your-domain.com/api/features/unlock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"featureKey": "advanced_analytics", "userId": "user_id_here", "force": true}'
```

### Monitoring User Progress

Track user progression and engagement through:

1. The metrics dashboard
2. Analytics integration
3. User progress API endpoints

## 👤 User Guide

### Getting Started

1. **Claim Your Invitation**: Use the invitation code you received to create your account
2. **Complete Onboarding**: Set up your profile and intentions
3. **Make Your First Contribution**: Engage with the Supercivilization feed
4. **Track Your Progress**: Monitor your personal progress tracker

### Unlocking Features

Features are unlocked by earning tokens through platform engagement:

1. **Post Quality Content**: Earn GEN tokens
2. **Receive Recognition**: Earn CRED tokens
3. **Lead Discussions**: Earn INFL tokens

### Inviting Others

Once you've unlocked the "Invite Friends" feature:

1. Navigate to the Invitation Manager
2. Create a new invitation (costs 10 GEN tokens)
3. Share the invitation code with your friend

## 🛠️ Technical Reference

### API Endpoints

| Endpoint                            | Method | Description                         |
| ----------------------------------- | ------ | ----------------------------------- |
| `/api/invitations`                  | POST   | Create a new invitation             |
| `/api/invitations/validate`         | POST   | Validate an invitation code         |
| `/api/invitations/claim`            | POST   | Claim an invitation                 |
| `/api/invitations/bulk`             | POST   | Create multiple invitations (admin) |
| `/api/onboarding/update-step`       | PATCH  | Update onboarding progress          |
| `/api/onboarding/update-step`       | GET    | Get onboarding progress             |
| `/api/features`                     | GET    | Get available features              |
| `/api/features/check`               | POST   | Check feature requirements          |
| `/api/features/unlock`              | POST   | Unlock a feature                    |
| `/api/features/unlock-notification` | POST   | Send feature unlock notification    |

### Database Functions

| Function                     | Description                           |
| ---------------------------- | ------------------------------------- |
| `claim_invitation`           | Claims an invitation code             |
| `create_invitation`          | Creates a new invitation              |
| `validate_invitation_code`   | Validates an invitation code          |
| `update_onboarding_progress` | Updates a user's onboarding progress  |
| `get_user_progress`          | Gets a user's progress                |
| `get_next_milestones`        | Gets upcoming milestones for a user   |
| `get_user_token_balances`    | Gets a user's token balances          |
| `add_user_tokens`            | Adds tokens to a user's balance       |
| `check_feature_unlock`       | Checks if a user can unlock a feature |
| `unlock_feature`             | Unlocks a feature for a user          |
| `get_enabled_features`       | Gets all enabled features for a user  |

## 📊 Analytics Integration

The platform includes comprehensive analytics tracking:

- User activation events
- Engagement metrics
- Retention indicators
- Feature unlock progression
- Invitation conversion rates

## 🔄 Launch Iteration Plan

1. **Initial Launch**: Invitation-only access with core features
2. **Week 1-2**: Monitor user engagement and adjust token rewards
3. **Week 3-4**: Enable additional features based on community feedback
4. **Month 2**: Expand invitation pool and refine onboarding
5. **Month 3**: Evaluate progression system and adjust as needed

## 🆘 Troubleshooting

### Common Issues

1. **Invitation Claiming Issues**

   - Check if the invitation code is valid and not expired
   - Verify that the invitation hasn't reached its maximum uses

2. **Feature Unlock Problems**

   - Ensure the user has sufficient tokens
   - Check if the feature is properly configured in the database

3. **Onboarding Flow Interruptions**
   - Verify that all onboarding steps are properly defined
   - Check for database permission issues

### Support Contacts

For technical issues or questions, contact:

- Technical Support: support@avolve.io
- Admin Support: admin@avolve.io

---

## 🎉 Launch Success Metrics

Track these key metrics to evaluate the success of your launch:

1. **Invitation Conversion Rate**: % of invitations that lead to active users
2. **Onboarding Completion Rate**: % of users who complete all onboarding steps
3. **Feature Unlock Progression**: Average time to unlock key features
4. **User Engagement**: Daily/weekly active user metrics
5. **Community Growth**: Rate of new user acquisition via invitations

Good luck with your launch! The Avolve platform is designed to create an engaging, progressive experience that rewards users for their contributions to the Supercivilization.
