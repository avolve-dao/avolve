# Regenerative Gamification System

This document provides a comprehensive overview of the GEN-centric regenerative gamified system implemented in the Avolve platform.

## Overview

The Avolve platform implements a regenerative gamified system centered around the GEN token, with daily claims and metrics-driven feature unlocks that encourage regular participation and contribution to the ecosystem.

The system is built around three main value pillars:

1. **Supercivilization (GEN)** - Ecosystem journey of transformation
2. **Superachiever (SAP)** - Individual journey of transformation
3. **Superachievers (SCQ)** - Collective journey of transformation

## Token Hierarchy

The platform implements a hierarchical token structure:

```
GEN (Supercivilization) - Top-level token
├── SAP (Superachiever) - Individual journey
│   ├── PSP (Personal Success Puzzle)
│   ├── BSP (Business Success Puzzle)
│   └── SMS (Supermind Superpowers)
└── SCQ (Superachievers) - Collective journey
    ├── SPD (Superpuzzle Developments)
    ├── SHE (Superhuman Enhancements)
    ├── SSA (Supersociety Advancements)
    └── SGB (Supergenius Breakthroughs)
```

## Daily Token Claims

The platform follows a weekly schedule for token claims, with each day dedicated to a specific token:

| Day | Token | Full Name | Gradient | Value Pillar | Metrics Impact |
|-----|-------|-----------|----------|--------------|----------------|
| Sunday | SPD | Superpuzzle Developments | Red-Green-Blue | Superachievers | Community Engagement |
| Monday | SHE | Superhuman Enhancements | Rose-Red-Orange | Superachievers | D1 Retention |
| Tuesday | PSP | Personal Success Puzzle | Amber-Yellow | Superachiever | DAU/MAU Ratio |
| Wednesday | SSA | Supersociety Advancements | Lime-Green-Emerald | Superachievers | Community Contribution |
| Thursday | BSP | Business Success Puzzle | Teal-Cyan | Superachiever | ARPU Metrics |
| Friday | SGB | Supergenius Breakthroughs | Sky-Blue-Indigo | Superachievers | Innovation Metrics |
| Saturday | SMS | Supermind Superpowers | Violet-Purple-Fuchsia-Pink | Superachiever | User Satisfaction & NPS |

### Claim Streaks and Bonuses

Maintaining a consistent claim streak provides additional benefits:

- **3-Day Streak**: 1.2x multiplier on token rewards
- **5-Day Streak**: 1.5x multiplier on token rewards
- **7-Day Streak**: 2.0x multiplier on token rewards

## Metrics-Driven Feature Unlocks

The platform uses a metrics-driven approach to feature unlocking. By improving engagement and participation metrics, users can unlock additional features and capabilities.

### Key Metrics

- **DAU/MAU Ratio**: Daily Active Users / Monthly Active Users (target: >0.3)
- **Retention**: Percentage of users returning after 1, 7, and 30 days
- **ARPU**: Average Revenue Per User
- **NPS**: Net Promoter Score
- **Engagement**: Time spent, actions taken, and content consumed

### Feature Unlock Requirements

1. **Teams Feature**
   - Complete 10 challenges OR claim 3 different day tokens
   - Unlocks the ability to create or join teams for collaborative work

2. **Governance Feature**
   - Accumulate 100 GEN tokens
   - Unlocks the ability to create petitions and vote on platform decisions

3. **Marketplace Feature**
   - Complete 20 challenges OR achieve DAU/MAU > 0.3
   - Unlocks the ability to buy, sell, and trade items with other users

4. **Token Utility Feature**
   - Complete 5 challenges AND claim 3 different day tokens
   - Unlocks the ability to spend tokens for premium features

## Implementation Details

### Database Schema

The regenerative gamified system is implemented using the following database tables:

- `tokens`: Stores information about all tokens in the system
- `user_balances`: Tracks token balances for each user
- `token_transactions`: Records all token transactions
- `token_metadata`: Stores metadata about tokens, including which day they can be claimed
- `day_token_claims`: Records token claims made by users
- `feature_unlocks`: Records which features are unlocked for each user
- `feature_unlock_criteria`: Defines the criteria for unlocking features
- `user_metrics`: Stores user metrics for gamification

### Key Database Functions

- `process_daily_claim`: Processes a daily token claim, updating user balances and metrics
- `check_feature_unlock`: Checks if a feature is unlocked for a user based on their metrics
- `check_day_token_unlock`: Checks if a day token is unlocked for a user
- `get_user_feature_statuses`: Gets all feature and day token statuses for a user
- `get_day_token_info`: Gets information about a token for a specific day
- `get_claim_streak`: Gets a user's claim streak information

### Frontend Components

- `DayTokenCard`: Displays token information and allows users to claim daily tokens
- `FeatureGuard`: Protects routes based on feature unlock status
- `GenGovernanceOverview`: Provides an overview of the GEN-centric governance system

## Best Practices

### For Developers

1. **Recording Metrics**
   - Always record metrics for important user actions
   - Use the `recordMetric` function with appropriate metric types and values
   - Include relevant metadata for detailed analysis

2. **Token Operations**
   - Always validate token operations before executing them
   - Handle errors properly, especially for token transfers and claims
   - Update user balances and metrics after successful operations

3. **Feature Unlocks**
   - Check feature unlock status before allowing access to protected features
   - Provide clear feedback to users about unlock requirements
   - Update feature unlock status after relevant user actions

### For Users

1. **Daily Engagement**
   - Log in daily to claim tokens
   - Complete challenges to improve metrics
   - Maintain claim streaks for bonus rewards

2. **Balanced Participation**
   - Engage with all three value pillars
   - Claim tokens on different days of the week
   - Participate in both individual and collective activities

3. **Metrics Optimization**
   - Focus on improving metrics that align with desired features
   - Track progress regularly and adjust activity accordingly
   - Celebrate milestones and achievements to maintain motivation

## Conclusion

The GEN-centric regenerative gamified system is designed to create a sustainable ecosystem that rewards consistent participation and contribution. By implementing daily token claims, streak rewards, and feature unlocks, the platform encourages users to engage regularly and contribute to the growth of the ecosystem.
