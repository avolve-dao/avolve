# AI Metadata Standards

This document defines standards for AI-specific metadata in the Avolve codebase. Following these standards ensures that AI assistants like Cascade and Grok can effectively understand and work with the codebase.

## AI Metadata Tags

Use these special comment tags to provide AI-specific metadata:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@ai-anchor` | Link to semantic anchors | `@ai-anchor #TOKEN_SYSTEM` |
| `@ai-context` | Provide context for AI | `@ai-context This implements the token claim process` |
| `@ai-related-to` | Reference related components | `@ai-related-to TokenDisplay, useToken` |
| `@ai-database-tables` | List database tables used | `@ai-database-tables tokens, user_tokens` |
| `@ai-example` | Provide usage examples | `@ai-example claimToken('GEN')` |
| `@ai-implementation-status` | Current implementation status | `@ai-implementation-status complete` |
| `@ai-sacred-geometry` | Sacred geometry principles used | `@ai-sacred-geometry golden-ratio, tesla-369` |

## Format for Different File Types

### TypeScript/JavaScript Files

```typescript
/**
 * @ai-anchor #TOKEN_SYSTEM
 * @ai-context This function handles the daily token claim process
 * @ai-related-to DailyClaimCard, useToken
 * @ai-database-tables tokens, user_tokens, token_transactions
 * @ai-sacred-geometry tesla-369, fibonacci
 * 
 * Function description and regular JSDoc comments...
 */
```

### React Components

```tsx
/**
 * @ai-anchor #UI_TOKEN_BADGE
 * @ai-context Displays a visual representation of a token with optional balance
 * @ai-related-to useToken, TokenDisplay
 * @ai-sacred-geometry golden-ratio
 * @ai-implementation-status complete
 * 
 * Component description and regular JSDoc comments...
 */
```

### SQL Files

```sql
-- @ai-anchor #DB_FUNCTIONS
-- @ai-context Function to check if a user has access to content requiring a token
-- @ai-related-to has_token_permission, get_user_tokens
-- @ai-sacred-geometry tesla-369
```

### Markdown Documentation

```markdown
<!-- 
@ai-anchor #TOKEN_SYSTEM
@ai-context Overview of the token system architecture
@ai-related-to token-based-access.md, tokenomics-implementation-plan.md
-->

# Token System
```

## AI Context Blocks

For complex components or functions, use expanded AI context blocks:

```typescript
/**
 * @ai-context-block
 * This component implements the daily token claim functionality.
 * It follows Tesla's 3-6-9 pattern by applying special multipliers
 * to tokens with digital roots of 3, 6, or 9.
 * 
 * The claim process involves:
 * 1. Determining today's token based on day of week
 * 2. Checking if the user has already claimed today
 * 3. Calculating the reward amount using sacred geometry principles
 * 4. Recording the transaction in the database
 * @ai-context-block-end
 */
```

## Implementation Status Values

Use these standardized values for `@ai-implementation-status`:

- `planned` - Feature is planned but not yet implemented
- `in-progress` - Implementation has started but is not complete
- `complete` - Implementation is complete and working
- `deprecated` - Feature is deprecated and may be removed
- `needs-refactoring` - Feature works but needs improvement

## Sacred Geometry References

Use these standardized values for `@ai-sacred-geometry`:

- `golden-ratio` - Uses the golden ratio (1.618) for proportions
- `fibonacci` - Uses the Fibonacci sequence for progression
- `tesla-369` - Implements Tesla's 3-6-9 pattern
- `vortex-math` - Uses vortex mathematics for calculations
- `digital-root` - Uses digital root calculations

## Best Practices

1. **Be Specific**: Provide detailed context rather than vague descriptions
2. **Be Consistent**: Use the same terminology across all metadata
3. **Be Comprehensive**: Include all relevant tags for each component
4. **Update Regularly**: Keep metadata current as the codebase evolves
5. **Link to Semantic Anchors**: Always include relevant semantic anchors

## Example: Fully Documented Component

```tsx
/**
 * @ai-anchor #UI_TOKEN_BADGE #TOKEN_SYSTEM
 * @ai-context-block
 * This component displays a visual representation of a token with optional
 * balance and tooltip information. It implements sacred geometry principles
 * through its gradient styling and proportions.
 * 
 * The component follows Tesla's 3-6-9 pattern by categorizing tokens into
 * three main families:
 * - Family 3: Creation tokens (GEN, SAP, SCQ)
 * - Family 6: Harmony tokens (PSP, BSP, SMS)
 * - Family 9: Completion tokens (SPD, SHE, SSA, SGB)
 * 
 * Each token has a unique gradient that corresponds to its position in the
 * sacred geometry system.
 * @ai-context-block-end
 * 
 * @ai-related-to useToken, useTokenRBAC, TokenDisplay
 * @ai-database-tables tokens, user_tokens
 * @ai-sacred-geometry golden-ratio, tesla-369
 * @ai-implementation-status complete
 * 
 * @component TokenBadge
 * @description Displays a visual representation of a token with optional balance and tooltip information.
 */
export function TokenBadge({
  tokenCode,
  tokenName,
  tokenSymbol,
  className,
  showBalance = false,
  showTooltip = true,
  size = 'md'
}: TokenBadgeProps) {
  // Implementation...
}
```
