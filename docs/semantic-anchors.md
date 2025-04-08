# Semantic Anchors Registry

This document serves as a central registry of semantic anchors used throughout the Avolve codebase. These anchors help AI assistants like Cascade and Grok navigate and understand the relationships between different components.

## How to Use Semantic Anchors

Semantic anchors are special comment tags that can be added to code and documentation files. They follow this format:

```typescript
/**
 * @ai-anchor #ANCHOR_NAME
 * Code or documentation related to the anchor
 */
```

Or in markdown files:

```markdown
<!-- @ai-anchor #ANCHOR_NAME -->
```

## Core System Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#TOKEN_SYSTEM` | Core token system implementation | `/lib/token/token-utils.ts` |
| `#TOKEN_HIERARCHY` | Token hierarchical structure | `/lib/token/token-types.ts` |
| `#TOKEN_ACCESS` | Token-based access control | `/lib/token/token-access.ts` |
| `#TOKEN_CLAIM` | Daily token claim functionality | `/lib/token/token-claim.ts` |
| `#TOKEN_EXCHANGE` | Token exchange and conversion | `/lib/token/token-exchange.ts` |
| `#TOKEN_REWARDS` | Token rewards and incentives | `/lib/token/token-rewards.ts` |

## Sacred Geometry Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#SACRED_GEOMETRY` | Sacred geometry principles | `/lib/sacred-geometry/principles.ts` |
| `#GOLDEN_RATIO` | Golden ratio implementation | `/lib/sacred-geometry/golden-ratio.ts` |
| `#FIBONACCI` | Fibonacci sequence implementation | `/lib/sacred-geometry/fibonacci.ts` |
| `#TESLA_369` | Tesla's 3-6-9 pattern | `/lib/sacred-geometry/tesla-369.ts` |
| `#VORTEX_MATH` | Vortex mathematics | `/lib/sacred-geometry/vortex-math.ts` |

## Authentication Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#AUTH_FLOW` | Authentication flow | `/lib/auth/auth-flow.ts` |
| `#AUTH_HOOKS` | Authentication hooks | `/lib/auth/auth-hooks.ts` |
| `#AUTH_PROVIDERS` | Authentication providers | `/lib/auth/auth-providers.ts` |
| `#AUTH_MIDDLEWARE` | Authentication middleware | `/lib/auth/auth-middleware.ts` |

## Database Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#DB_SCHEMA` | Database schema | `/supabase/migrations` |
| `#DB_FUNCTIONS` | Database functions | `/supabase/functions` |
| `#DB_POLICIES` | Row Level Security policies | `/supabase/policies` |
| `#DB_MIGRATIONS` | Database migrations | `/supabase/migrations` |
| `#DB_SACRED_GEOMETRY` | Sacred geometry in database | `/supabase/sacred-geometry` |

## Journey Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#USER_JOURNEY` | User journey implementation | `/lib/journey/journey-utils.ts` |
| `#USER_PROGRESS` | User progress tracking | `/lib/journey/progress-utils.ts` |
| `#PILLARS` | Pillar implementation | `/lib/journey/pillars.ts` |
| `#SECTIONS` | Section implementation | `/lib/journey/sections.ts` |
| `#COMPONENTS` | Component implementation | `/lib/journey/components.ts` |

## UI Component Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#UI_TOKEN_BADGE` | Token badge component | `/components/token/token-badge.tsx` |
| `#UI_DAILY_CLAIM` | Daily claim component | `/components/token/daily-claim-card.tsx` |
| `#UI_JOURNEY_DASHBOARD` | Journey dashboard | `/components/journey/journey-dashboard.tsx` |
| `#UI_TOKEN_DISPLAY` | Token display component | `/components/token/token-display.tsx` |
| `#UI_PROTECTED_ROUTE` | Protected route component | `/components/token/token-protected-route.tsx` |

## API Route Anchors

| Anchor | Description | Primary Location |
|--------|-------------|------------------|
| `#API_TOKEN_CLAIM` | Token claim API | `/app/api/tokens/claim/route.ts` |
| `#API_TOKEN_BALANCE` | Token balance API | `/app/api/tokens/balance/route.ts` |
| `#API_JOURNEY_PROGRESS` | Journey progress API | `/app/api/journey/progress/route.ts` |
| `#API_AUTH_CSRF` | Auth CSRF token API | `/app/api/auth/csrf/token/route.ts` |

## Usage Guidelines

1. Always use existing anchors when possible to maintain consistency
2. When creating a new anchor, add it to this registry
3. Use the most specific anchor that applies to your code
4. Multiple anchors can be used if the code relates to multiple concepts
5. Include a brief description of how the code relates to the anchor

## Example Usage

```typescript
/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_CLAIM
 * This function handles the daily token claim process, applying
 * sacred geometry multipliers based on the day of the week.
 */
export async function claimDailyToken(userId: string, tokenSymbol: string) {
  // Implementation
}
```
