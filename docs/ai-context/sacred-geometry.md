# Sacred Geometry for AI Assistants

This document provides specialized context about the sacred geometry principles in the Avolve platform, specifically designed for AI assistants like Cascade and Grok.

## Core Concepts

Sacred geometry principles and Tesla's 3-6-9 patterns form the mathematical foundation of the Avolve platform, creating harmony and balance throughout the system.

### Golden Ratio (1.618)

The golden ratio (φ or phi, approximately 1.618) is a mathematical ratio found throughout nature that creates aesthetically pleasing proportions. In the Avolve platform, it's used for:

- UI component sizing and spacing
- Token exchange rate calculations
- Reward multipliers
- Layout proportions

```typescript
// Example of golden ratio implementation
const GOLDEN_RATIO = 1.618;

// Calculate token exchange rate
const exchangeRate = baseRate * Math.pow(GOLDEN_RATIO, levelDifference);

// Calculate UI component sizing
const largeSize = baseSize * GOLDEN_RATIO;
const smallSize = baseSize / GOLDEN_RATIO;
```

### Fibonacci Sequence

The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, ...) is closely related to the golden ratio. Each number is the sum of the two preceding ones, and the ratio of consecutive Fibonacci numbers approaches the golden ratio. In Avolve, it's used for:

- Progressive reward structures
- UI component layout
- Animation timing
- Token weight calculations

```typescript
// Example of Fibonacci sequence implementation
const fibonacciSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

// Calculate reward based on level
const reward = baseReward * fibonacciSequence[level];

// Calculate UI component spacing
const spacing = basePadding * fibonacciSequence[index % fibonacciSequence.length];
```

### Tesla's 3-6-9 Pattern

Nikola Tesla famously said, "If you only knew the magnificence of the 3, 6, and 9, then you would have the key to the universe." This pattern is central to the Avolve platform:

- **3 (Creation)**: Level 3 tokens represent creation (PSP, BSP, SMS, SPD, SHE, SSA, SGB)
- **6 (Harmony)**: Level 6 tokens represent harmony (SAP, SCQ)
- **9 (Completion)**: Level 9 token represents completion (GEN)

```typescript
// Example of Tesla's 3-6-9 pattern implementation
const isTesla369 = (num: number): boolean => {
  return num === 3 || num === 6 || num === 9;
};

// Apply Tesla multiplier
const applyTeslaMultiplier = (value: number, digitalRoot: number): number => {
  if (isTesla369(digitalRoot)) {
    return value * digitalRoot;
  }
  return value;
};
```

### Vortex Mathematics

Vortex mathematics involves calculating the digital root of numbers by summing their digits until a single digit is obtained. In Avolve, it's used for:

- Determining token families
- Creating mathematical harmony
- Calculating token properties

```typescript
// Example of vortex mathematics implementation
const getDigitalRoot = (num: number): number => {
  if (num === 0) return 0;
  
  const remainder = num % 9;
  return remainder === 0 ? 9 : remainder;
};

// Determine token family
const getTokenFamily = (digitalRoot: number): string => {
  if ([3, 6, 9].includes(digitalRoot)) return 'family_369';
  if ([1, 4, 7].includes(digitalRoot)) return 'family_147';
  return 'family_258';
};
```

## Implementation in the Codebase

### Database Implementation

Sacred geometry principles are implemented in the database through:

1. **Token Attributes**: Each token has attributes like `digital_root`, `fibonacci_weight`, and `golden_ratio_multiplier`
2. **Exchange Rates**: Token exchange rates follow the golden ratio
3. **Token Families**: Tokens are grouped into families based on their digital roots

```sql
-- Example of sacred geometry in database functions
CREATE OR REPLACE FUNCTION public.get_digital_root(num numeric)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
IMMUTABLE
AS $$
DECLARE
  result integer;
BEGIN
  IF num = 0 THEN
    RETURN 0;
  END IF;
  
  result := MOD(num, 9);
  
  IF result = 0 THEN
    RETURN 9;
  END IF;
  
  RETURN result;
END;
$$;
```

### UI Implementation

Sacred geometry principles are implemented in the UI through:

1. **Component Sizing**: Components use the golden ratio for sizing and spacing
2. **Color Gradients**: Token gradients are based on their position in the sacred geometry system
3. **Layout Proportions**: Page layouts follow golden ratio proportions

```tsx
// Example of sacred geometry in UI components
const getSizeClasses = (size: string) => {
  switch (size) {
    // Small size is base / golden ratio
    case 'sm': return 'text-xs px-1.5 py-0.5';
    // Medium size is base
    case 'md': return 'text-sm px-2 py-0.5';
    // Large size is base * golden ratio
    case 'lg': return 'text-base px-3 py-1';
    default: return 'text-sm px-2 py-0.5';
  }
};
```

### Token System Implementation

Sacred geometry principles are implemented in the token system through:

1. **Hierarchical Structure**: The token hierarchy follows Tesla's 3-6-9 pattern
2. **Reward Calculations**: Rewards are calculated using Fibonacci sequences and golden ratio multipliers
3. **Token Properties**: Tokens have properties based on vortex mathematics

```typescript
// Example of sacred geometry in token system
const calculateTokenReward = (
  baseAmount: number,
  tokenSymbol: string,
  dayOfWeek: number
): number => {
  const token = getTokenBySymbol(tokenSymbol);
  
  // Apply Fibonacci weight
  let reward = baseAmount * token.fibonacciWeight;
  
  // Apply golden ratio multiplier
  reward *= Math.pow(GOLDEN_RATIO, token.tokenLevel / 3);
  
  // Apply Tesla multiplier if applicable
  if (isTesla369(token.digitalRoot)) {
    reward *= token.digitalRoot;
  }
  
  return reward;
};
```

## AI-Specific Guidance

When working with sacred geometry in the Avolve platform, AI assistants should:

1. **Preserve Mathematical Harmony**: Maintain the mathematical relationships in any modifications
2. **Respect Tesla's 3-6-9 Pattern**: Keep the hierarchical structure intact
3. **Use Golden Ratio for Proportions**: Apply the golden ratio for sizing and spacing
4. **Consider Digital Roots**: Be aware of the digital root properties of numbers
5. **Follow Fibonacci Progression**: Use the Fibonacci sequence for natural progression

### Semantic Anchors

Use these semantic anchors to quickly locate sacred geometry-related code:

- `#SACRED_GEOMETRY` - Core sacred geometry principles
- `#GOLDEN_RATIO` - Golden ratio implementation
- `#FIBONACCI` - Fibonacci sequence implementation
- `#TESLA_369` - Tesla's 3-6-9 pattern
- `#VORTEX_MATH` - Vortex mathematics

### Common Pitfalls

1. **Arbitrary Proportions**: Don't use arbitrary numbers for sizing and spacing; use the golden ratio
2. **Ignoring Digital Roots**: Always consider the digital root properties of numbers
3. **Breaking the Hierarchy**: Maintain the 3-6-9 hierarchical structure
4. **Random Progression**: Use Fibonacci sequence for natural progression instead of arbitrary increments
5. **Inconsistent Gradients**: Maintain the established gradient patterns for tokens

## Practical Examples

### Calculating Token Value

```typescript
/**
 * @ai-anchor #SACRED_GEOMETRY #GOLDEN_RATIO
 * Calculates the value of a token based on sacred geometry principles
 */
function calculateTokenValue(
  tokenSymbol: string,
  referenceTokenSymbol: string
): number {
  const token = getTokenBySymbol(tokenSymbol);
  const referenceToken = getTokenBySymbol(referenceTokenSymbol);
  
  // Calculate level difference
  const levelDifference = token.tokenLevel - referenceToken.tokenLevel;
  
  // Apply golden ratio based on level difference
  let value = Math.pow(GOLDEN_RATIO, levelDifference);
  
  // Apply digital root multiplier
  value *= getDigitalRootMultiplier(token.digitalRoot);
  
  return value;
}
```

### Creating UI with Golden Ratio

```tsx
/**
 * @ai-anchor #SACRED_GEOMETRY #GOLDEN_RATIO
 * Creates a layout using golden ratio proportions
 */
function GoldenRatioLayout({ children }: { children: React.ReactNode }) {
  // Base unit
  const baseUnit = 16;
  
  // Golden ratio calculations
  const largeSection = baseUnit * GOLDEN_RATIO * GOLDEN_RATIO; // φ²
  const mediumSection = baseUnit * GOLDEN_RATIO;               // φ
  const smallSection = baseUnit;                               // 1
  
  return (
    <div className="flex flex-col h-full">
      <div style={{ height: `${largeSection}px` }} className="bg-primary">
        {/* Large section */}
      </div>
      <div style={{ height: `${mediumSection}px` }} className="bg-secondary">
        {/* Medium section */}
      </div>
      <div style={{ height: `${smallSection}px` }} className="bg-accent">
        {/* Small section */}
      </div>
    </div>
  );
}
```

## Conclusion

Sacred geometry principles and Tesla's 3-6-9 patterns form the mathematical foundation of the Avolve platform, creating harmony and balance throughout the system. Understanding these principles is essential for effectively working with the codebase and maintaining its mathematical integrity.
