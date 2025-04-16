# Avolve Token System

## Overview

The Avolve platform uses a gamified, tokenized system to incentivize and reward positive-sum behaviors. Users can simultaneously be:

- **Subscribers** (read-only access)
- **Participants** (write access)
- **Contributors** (execute access)

Each role is based on user behavior and is tracked and rewarded with dedicated tokens. All actions are designed to foster engagement, collaboration, and growth.

---

## Role Model and Access Levels

| Role         | Typical Access    | Example Actions              | Token Earned        |
|--------------|------------------|------------------------------|---------------------|
| Subscriber   | Read-only        | View content, follow updates | Subscription Token  |
| Participant  | Write            | Post, comment, submit forms  | Participation Token |
| Contributor  | Execute          | Launch features, moderate, deploy | Contribution Token |

- **Users can hold any or all roles at once, depending on their actions.**
- **All roles are positive-sum: the more you contribute, the more you and others benefit.**

---

## Gamification & Tokenization

- **Every action** (reading, posting, contributing) can earn the user a token.
- **Tokens are tracked and displayed** in the user dashboard.
- **Leveling up**: Earning more tokens in a category unlocks new privileges (e.g., advanced features, recognition, governance).
- **Tokens can be used for:**
  - Unlocking new content/features
  - Participating in governance
  - Gaining reputation and rewards

---

## Technical Implementation

### 1. Token Types

- `SUBSCRIPTION` (read)
- `PARTICIPATION` (write)
- `CONTRIBUTION` (execute)

### 2. Example TypeScript Interfaces

```ts
// lib/access/roles.ts
export type UserRole = 'subscriber' | 'participant' | 'contributor';

export interface UserTokenBalance {
  userId: string;
  subscriptionTokens: number;
  participationTokens: number;
  contributionTokens: number;
}

export interface UserAccess {
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
  roles: UserRole[];
}
```

### 3. Example Usage in Hooks/Services

```ts
// hooks/useAccess.ts
import { useTokens } from '@/hooks/use-tokens';

export function useAccess(userId: string): UserAccess {
  const { getUserTokenBalance } = useTokens();
  const balances = getUserTokenBalance(userId);

  return {
    canRead: balances.subscriptionTokens > 0,
    canWrite: balances.participationTokens > 0,
    canExecute: balances.contributionTokens > 0,
    roles: [
      balances.subscriptionTokens > 0 ? 'subscriber' : undefined,
      balances.participationTokens > 0 ? 'participant' : undefined,
      balances.contributionTokens > 0 ? 'contributor' : undefined,
    ].filter(Boolean) as UserRole[],
  };
}
```

### 4. Integration with RBAC
- Use these roles to gate content, features, and actions throughout the app.
- Middleware and UI components should check `useAccess` or similar logic to determine what a user can see/do.

---

## Extending the System

- **Add new behaviors**: Reward new types of engagement with tokens.
- **Adjust tokenomics**: Tune how many tokens are earned for each action.
- **Add badges, leaderboards, and quests** for further gamification.

---

## TODOs / Next Steps
- Implement `/lib/access/roles.ts` and `/hooks/useAccess.ts` as shown above.
- Integrate role checks into UI and API routes.
- Add visualizations for token balances and role progress in the dashboard.
- Expand documentation as the system evolves.

---

## Contact / Contribution
For questions or to contribute to the token system, please reach out to the Avolve core team or submit a pull request.
