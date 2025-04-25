# Avolve Theme System

This document provides guidance on how to use the Avolve conceptual framework color system in your application.

## Overview

The Avolve platform is built around three main values, each represented by a specific color gradient:

1. **Supercivilization** - The ecosystem journey for transformation (Zinc gradient)
2. **Superachiever** - The individual journey of transformation (Stone gradient)
3. **Superachievers** - The collective journey of transformation (Slate gradient)

Each of these main values has sub-sections with their own color schemes and tokens, creating a comprehensive visual language that reinforces the conceptual framework.

## Color System Implementation

The Avolve color system is implemented in three ways:

1. **Tailwind CSS Configuration**: Colors and gradients defined in `tailwind.config.js`
2. **CSS Variables**: Custom properties defined in `styles/avolve-framework.css`
3. **React Components**: Utility components that use the color system

## Using the Color System

### 1. Tailwind CSS Classes

You can use Tailwind CSS classes directly in your components:

```jsx
// Background colors
<div className="bg-supercivilization">Supercivilization</div>
<div className="bg-superachiever">Superachiever</div>
<div className="bg-personalSuccess">Personal Success</div>

// Text colors
<span className="text-gen-token">GEN Token</span>
<span className="text-sap-token">SAP Token</span>
<span className="text-psp-token">PSP Token</span>

// Gradient backgrounds
<div className="bg-supercivilization-gradient">Zinc Gradient</div>
<div className="bg-personal-success-gradient">Amber-Yellow Gradient</div>
<div className="bg-supermind-gradient">Violet-Purple-Fuchsia-Pink Gradient</div>
```

### 2. CSS Variables

You can use CSS variables in your custom styles:

```css
.my-custom-element {
  background-color: var(--supercivilization);
  color: var(--gen-token);
  border: 1px solid var(--supercivilization-dark);
}

.gradient-background {
  background: linear-gradient(
    45deg,
    var(--personal-success-light),
    var(--personal-success),
    var(--personal-success-dark)
  );
}
```

### 3. Theme Showcase Component

The `AvolveThemeShowcase` component provides a visual reference for all colors and gradients:

```jsx
import { AvolveThemeShowcase } from '@/components/ui/avolve-theme-showcase';

export default function ThemePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Avolve Theme System</h1>
      <AvolveThemeShowcase />
    </div>
  );
}
```

## Color Reference

### Main Values

| Value             | Gradient       | Token     |
| ----------------- | -------------- | --------- |
| Supercivilization | Zinc gradient  | GEN token |
| Superachiever     | Stone gradient | SAP token |
| Superachievers    | Slate gradient | SCQ token |

### Superachiever Sections

| Section                 | Gradient                            | Token     |
| ----------------------- | ----------------------------------- | --------- |
| Personal Success Puzzle | Amber-Yellow gradient               | PSP token |
| Business Success Puzzle | Teal-Cyan gradient                  | BSP token |
| Supermind Superpowers   | Violet-Purple-Fuchsia-Pink gradient | SMS token |

### Superachievers Sections

| Section                   | Gradient                    | Token     |
| ------------------------- | --------------------------- | --------- |
| Superpuzzle Developments  | Red-Green-Blue gradient     | SPD token |
| Superhuman Enhancements   | Rose-Red-Orange gradient    | SHE token |
| Supersociety Advancements | Lime-Green-Emerald gradient | SSA token |
| Supergenius Breakthroughs | Sky-Blue-Indigo gradient    | SBG token |

## Usage Guidelines

### Route Groups

The application's route groups should use the appropriate color scheme:

- `/app/(superachiever)/` routes should use the Stone gradient and related colors
- `/app/(superachievers)/` routes should use the Slate gradient and related colors
- `/app/(supercivilization)/` routes should use the Zinc gradient

### Component Design

When designing components for specific sections:

1. Use the section's primary color for main UI elements
2. Use the token color for interactive elements like buttons and links
3. Use gradients for section headers and featured content
4. Maintain consistent use of colors across related components

### Example: Personal Success Puzzle Component

```jsx
export function PersonalSuccessPuzzleCard({ title, description, icon }) {
  return (
    <div className="rounded-lg border border-psp-token p-4">
      <div className="bg-personal-success-gradient rounded-md p-3 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-psp-token">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <button className="mt-4 bg-psp-token text-white px-4 py-2 rounded-md">Learn More</button>
    </div>
  );
}
```

## Accessibility Considerations

When using the Avolve color system, ensure:

1. **Sufficient contrast**: Text should have at least 4.5:1 contrast ratio with its background
2. **Color is not the only indicator**: Don't rely solely on color to convey information
3. **Dark mode compatibility**: All colors should have dark mode variants

## Adding the Theme to Your Project

1. Import the CSS variables in your global styles:

```css
/* globals.css */
@import 'styles/avolve-framework.css';
```

2. Make sure the Tailwind config includes the Avolve color system:

```js
// tailwind.config.js
module.exports = {
  // ... other config
  theme: {
    extend: {
      colors: {
        // Avolve colors are already included
      },
      backgroundImage: {
        // Avolve gradients are already included
      },
    },
  },
};
```

3. Use the showcase component to explore available colors:

```jsx
import { AvolveThemeShowcase } from '@/components/ui/avolve-theme-showcase';

// Use in any page to see the available colors and gradients
```

## Best Practices

1. **Consistency**: Use colors consistently across related sections
2. **Hierarchy**: Use color to establish visual hierarchy
3. **Meaning**: Colors should reinforce the conceptual meaning of components
4. **Simplicity**: Don't use too many colors in a single view
5. **Accessibility**: Ensure all color combinations meet accessibility standards
