# Token System for AI Assistants

This document provides specialized context about the Avolve token system specifically designed for AI assistants like Cascade and Grok.

## Core Concepts

The token system is the central mechanism of the Avolve platform, implementing a hierarchical structure based on sacred geometry principles and Tesla's 3-6-9 patterns. Understanding this system is essential for working with the codebase.

### Token Hierarchy

```
GEN (Supercivilization)
├── SAP (Superachiever)
│   ├── PSP (Personal Success Puzzle)
│   ├── BSP (Business Success Puzzle)
│   └── SMS (Supermind Superpowers)
└── SCQ (Superachievers)
    ├── SPD (Superpuzzle Developments)
    ├── SHE (Superhuman Enhancements)
    ├── SSA (Supersociety Advancements)
    └── SGB (Supergenius Breakthroughs)
```

### Token Properties

Each token has the following properties:

- **Token Level**: Level in the hierarchy (3, 6, or 9) representing creation, harmony, and completion
- **Digital Root**: Calculated using vortex mathematics
- **Is Tesla 369**: Whether the token belongs to Tesla's special numbers (3, 6, 9)
- **Fibonacci Weight**: Weight based on the Fibonacci sequence
- **Golden Ratio Multiplier**: Multiplier based on the golden ratio (1.618)
- **Token Family**: Family based on digital root (family_369, family_147, family_258)

### Weekly Token Schedule

The platform follows a weekly schedule for token claims:

- **Sunday**: SPD (Superpuzzle Developments) - Red-Green-Blue gradient
- **Monday**: SHE (Superhuman Enhancements) - Rose-Red-Orange gradient
- **Tuesday**: PSP (Personal Success Puzzle) - Amber-Yellow gradient
- **Wednesday**: SSA (Supersociety Advancements) - Lime-Green-Emerald gradient
- **Thursday**: BSP (Business Success Puzzle) - Teal-Cyan gradient
- **Friday**: SGB (Supergenius Breakthroughs) - Sky-Blue-Indigo gradient
- **Saturday**: SMS (Supermind Superpowers) - Violet-Purple-Fuchsia-Pink gradient

## Implementation Details

### Database Schema

The token system is implemented in the database with these key tables:

- `tokens` - Defines all token types with sacred geometry attributes
- `user_tokens` - Tracks token ownership for each user
- `token_transactions` - Records token transfers and rewards
- `token_exchange_rates` - Defines exchange rates between tokens

### Code Structure

The token system is implemented across several files:

- `/lib/token/token-types.ts` - TypeScript types for the token system
- `/lib/token/token-utils.ts` - Utility functions for token operations
- `/lib/token/token-access.ts` - Functions for checking token-based access
- `/lib/token/token-claim.ts` - Functions for claiming daily tokens
- `/lib/token/use-token.ts` - React hook for token operations
- `/lib/token/use-token-rbac.ts` - React hook for token-based access control

### UI Components

The token system is visualized through these components:

- `/components/token/token-badge.tsx` - Displays a visual representation of a token
- `/components/token/daily-claim-card.tsx` - Card for claiming daily tokens
- `/components/token/token-display.tsx` - Displays token information
- `/components/token/token-protected-route.tsx` - Route that requires token access

## Sacred Geometry Implementation

The token system implements sacred geometry principles in several ways:

### Golden Ratio (1.618)

The golden ratio is used for:

- Token exchange rates between different token types
- UI component sizing and spacing
- Reward calculation multipliers

### Fibonacci Sequence

The Fibonacci sequence is used for:

- Token reward progression
- UI component layout
- Animation timing

### Tesla's 3-6-9 Pattern

Tesla's pattern is used for:

- Token level hierarchy (3, 6, 9)
- Special multipliers for tokens with digital roots of 3, 6, or 9
- UI component grouping

### Vortex Mathematics

Vortex mathematics is used for:

- Calculating digital roots of token values
- Determining token families
- Creating mathematical harmony in the system

## Common Patterns

### Checking Token Access

```typescript
// Server Component
import { hasTokenAccess } from '@/lib/token/token-access';

const hasAccess = await hasTokenAccess('GEN', userId);
if (hasAccess) {
  // Show protected content
}

// Client Component
import { useTokenRBAC } from '@/lib/token/use-token-rbac';

function ProtectedComponent() {
  const { hasTokenPermission } = useTokenRBAC();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasTokenPermission('GEN', 'access');
      setHasAccess(access);
    };
    checkAccess();
  }, [hasTokenPermission]);
  
  if (!hasAccess) return <AccessDeniedView />;
  return <ProtectedContent />;
}
```

### Claiming Daily Tokens

```typescript
// Server Action
import { claimDailyToken } from '@/lib/token/token-claim';

async function handleTokenClaim(userId: string) {
  const todayToken = getTodayToken();
  const result = await claimDailyToken(userId, todayToken);
  return result;
}

// Client Component
import { useToken } from '@/lib/token/use-token';

function DailyClaimButton() {
  const { claimDailyToken, loading } = useToken();
  
  const handleClaim = async () => {
    const result = await claimDailyToken();
    if (result.success) {
      // Show success message
    }
  };
  
  return (
    <Button onClick={handleClaim} disabled={loading}>
      Claim Daily Token
    </Button>
  );
}
```

### Getting Token Balance

```typescript
// Server Component
import { getUserTokenBalance } from '@/lib/token/token-utils';

const balance = await getUserTokenBalance(userId, 'GEN');

// Client Component
import { useToken } from '@/lib/token/use-token';

function TokenBalance({ tokenSymbol }) {
  const { getUserTokenBalance } = useToken();
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    const fetchBalance = async () => {
      const result = await getUserTokenBalance(tokenSymbol);
      if (result.success) {
        setBalance(result.data);
      }
    };
    fetchBalance();
  }, [tokenSymbol, getUserTokenBalance]);
  
  return <div>Balance: {balance ?? 'Loading...'}</div>;
}
```

## AI-Specific Guidance

When working with the token system, AI assistants should:

1. **Respect the Hierarchy**: Always consider the hierarchical relationship between tokens
2. **Maintain Sacred Geometry**: Preserve the sacred geometry principles in any modifications
3. **Use Existing Patterns**: Follow established patterns for token operations
4. **Check Access**: Always verify token access before displaying protected content
5. **Consider Digital Roots**: Be aware of the digital root properties of tokens

### Semantic Anchors

Use these semantic anchors to quickly locate token-related code:

- `#TOKEN_SYSTEM` - Core token system implementation
- `#TOKEN_HIERARCHY` - Token hierarchical structure
- `#TOKEN_ACCESS` - Token-based access control
- `#TOKEN_CLAIM` - Daily token claim functionality
- `#TOKEN_EXCHANGE` - Token exchange and conversion
- `#TOKEN_REWARDS` - Token rewards and incentives

### Common Pitfalls

1. **Mixing Token Levels**: Don't confuse tokens from different levels in the hierarchy
2. **Ignoring Digital Roots**: Always consider the digital root properties of tokens
3. **Bypassing Access Control**: Always check token access before displaying protected content
4. **Hardcoding Token Values**: Use the token system utilities instead of hardcoding values
5. **Forgetting Sacred Geometry**: Maintain sacred geometry principles in UI components

## Conclusion

The token system is the foundation of the Avolve platform, implementing sacred geometry principles and Tesla's 3-6-9 patterns to create a mathematically harmonious ecosystem. Understanding this system is essential for effectively working with the codebase.
