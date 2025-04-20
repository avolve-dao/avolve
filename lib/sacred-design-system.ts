/**
 * Sacred Design System
 * 
 * A comprehensive design system based on sacred geometry principles,
 * including the golden ratio (φ), Fibonacci sequence, and Tesla's 3-6-9 pattern.
 * 
 * This system provides pixel-perfect sizing, spacing, and proportions for all UI components.
 */

// Golden Ratio (φ ≈ 1.618033988749895)
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 0.618033988749895;

// Fibonacci sequence (first 15 numbers)
export const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

// Tesla's 3-6-9 pattern
export const TESLA = [3, 6, 9];

/**
 * Base unit for the design system (in pixels)
 * Using 3 as the base unit aligns with Tesla's 3-6-9 pattern
 */
export const BASE_UNIT = 3;

/**
 * Spacing scale based on the Fibonacci sequence
 * Each value is a multiple of the BASE_UNIT
 */
export const SPACING = {
  // Fibonacci-based spacing
  '0': 0,
  '1': BASE_UNIT * 1,     // 3px
  '2': BASE_UNIT * 2,     // 6px
  '3': BASE_UNIT * 3,     // 9px
  '5': BASE_UNIT * 5,     // 15px
  '8': BASE_UNIT * 8,     // 24px
  '13': BASE_UNIT * 13,   // 39px
  '21': BASE_UNIT * 21,   // 63px
  '34': BASE_UNIT * 34,   // 102px
  '55': BASE_UNIT * 55,   // 165px
  '89': BASE_UNIT * 89,   // 267px
  '144': BASE_UNIT * 144, // 432px
  
  // Tesla 3-6-9 based spacing
  't3': BASE_UNIT * 3,    // 9px
  't6': BASE_UNIT * 6,    // 18px
  't9': BASE_UNIT * 9,    // 27px
  't18': BASE_UNIT * 18,  // 54px
  't27': BASE_UNIT * 27,  // 81px
  't36': BASE_UNIT * 36,  // 108px
  't54': BASE_UNIT * 54,  // 162px
  't81': BASE_UNIT * 81,  // 243px
  
  // Golden ratio based spacing
  'phi-1': Math.round(BASE_UNIT * 3),                     // 9px
  'phi-2': Math.round(BASE_UNIT * 3 * PHI),               // 15px
  'phi-3': Math.round(BASE_UNIT * 3 * PHI * PHI),         // 24px
  'phi-4': Math.round(BASE_UNIT * 3 * PHI * PHI * PHI),   // 39px
};

/**
 * Font size scale based on the golden ratio
 * Each step is φ times larger than the previous
 */
export const FONT_SIZE = {
  'xs': Math.round(BASE_UNIT * 3),                      // 9px
  'sm': Math.round(BASE_UNIT * 3 * PHI),                // 15px
  'base': Math.round(BASE_UNIT * 3 * PHI * PHI),        // 24px
  'lg': Math.round(BASE_UNIT * 3 * PHI * PHI * PHI),    // 39px
  'xl': Math.round(BASE_UNIT * 3 * Math.pow(PHI, 4)),   // 63px
  '2xl': Math.round(BASE_UNIT * 3 * Math.pow(PHI, 5)),  // 102px
  '3xl': Math.round(BASE_UNIT * 3 * Math.pow(PHI, 6)),  // 165px
  
  // Tesla 3-6-9 based font sizes
  't3': BASE_UNIT * 3,    // 9px
  't6': BASE_UNIT * 6,    // 18px
  't9': BASE_UNIT * 9,    // 27px
};

/**
 * Line height scale based on the golden ratio
 */
export const LINE_HEIGHT = {
  'none': 1,
  'tight': 1.2,
  'snug': 1.375,
  'normal': PHI,         // 1.618
  'relaxed': PHI * 1.1,  // 1.78
  'loose': PHI * 1.2,    // 1.94
};

/**
 * Border radius scale based on the Fibonacci sequence
 */
export const BORDER_RADIUS = {
  'none': 0,
  'sm': BASE_UNIT * 1,     // 3px
  'md': BASE_UNIT * 2,     // 6px
  'lg': BASE_UNIT * 3,     // 9px
  'xl': BASE_UNIT * 5,     // 15px
  '2xl': BASE_UNIT * 8,    // 24px
  '3xl': BASE_UNIT * 13,   // 39px
  'full': 9999,
  
  // Tesla 3-6-9 based border radii
  't3': BASE_UNIT * 3,     // 9px
  't6': BASE_UNIT * 6,     // 18px
  't9': BASE_UNIT * 9,     // 27px
};

/**
 * Width and height scale based on the Fibonacci sequence
 */
export const SIZE = {
  // Fibonacci-based sizes
  '0': 0,
  '1': BASE_UNIT * 1,     // 3px
  '2': BASE_UNIT * 2,     // 6px
  '3': BASE_UNIT * 3,     // 9px
  '5': BASE_UNIT * 5,     // 15px
  '8': BASE_UNIT * 8,     // 24px
  '13': BASE_UNIT * 13,   // 39px
  '21': BASE_UNIT * 21,   // 63px
  '34': BASE_UNIT * 34,   // 102px
  '55': BASE_UNIT * 55,   // 165px
  '89': BASE_UNIT * 89,   // 267px
  '144': BASE_UNIT * 144, // 432px
  
  // Tesla 3-6-9 based sizes
  't3': BASE_UNIT * 3,    // 9px
  't6': BASE_UNIT * 6,    // 18px
  't9': BASE_UNIT * 9,    // 27px
  't18': BASE_UNIT * 18,  // 54px
  't27': BASE_UNIT * 27,  // 81px
  't36': BASE_UNIT * 36,  // 108px
  't54': BASE_UNIT * 54,  // 162px
  't81': BASE_UNIT * 81,  // 243px
  
  // Golden ratio based sizes
  'phi-1': Math.round(BASE_UNIT * 3),                     // 9px
  'phi-2': Math.round(BASE_UNIT * 3 * PHI),               // 15px
  'phi-3': Math.round(BASE_UNIT * 3 * PHI * PHI),         // 24px
  'phi-4': Math.round(BASE_UNIT * 3 * PHI * PHI * PHI),   // 39px
  
  // Percentage-based sizes
  'full': '100%',
  'screen': '100vw',
  'min': 'min-content',
  'max': 'max-content',
  'fit': 'fit-content',
};

/**
 * Z-index scale based on the Fibonacci sequence
 */
export const Z_INDEX = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '5': 5,
  '8': 8,
  '13': 13,
  '21': 21,
  '34': 34,
  '55': 55,
  '89': 89,
  'auto': 'auto',
};

/**
 * Grid system based on the golden ratio and Tesla 3-6-9 pattern
 */
export const GRID = {
  // Golden ratio grid
  'golden': {
    columns: [
      PHI_INVERSE * 100, // 38.2%
      (1 - PHI_INVERSE) * 100 // 61.8%
    ],
    rows: [
      PHI_INVERSE * 100, // 38.2%
      (1 - PHI_INVERSE) * 100 // 61.8%
    ]
  },
  
  // Tesla 3-6-9 grid
  'tesla': {
    columns: [3, 6, 9],
    rows: [3, 6, 9]
  },
  
  // Fibonacci grid
  'fibonacci': {
    columns: [1, 1, 2, 3, 5, 8, 13, 21],
    rows: [1, 1, 2, 3, 5, 8, 13, 21]
  }
};

/**
 * Aspect ratios based on sacred geometry
 */
export const ASPECT_RATIO = {
  'auto': 'auto',
  'square': '1 / 1',
  'golden': `1 / ${PHI}`,
  'golden-landscape': `${PHI} / 1`,
  'vesica': '1.732 / 1', // √3 / 1
  'pentagon': '1.539 / 1', // Based on pentagon geometry
  'hexagon': '1.155 / 1', // Based on hexagon geometry
  'octagon': '1 / 1', // Octagon is nearly square
  'nonagon': '1.064 / 1', // Based on nonagon geometry
};

/**
 * Box shadow values based on the Fibonacci sequence
 */
export const BOX_SHADOW = {
  'sm': `0 ${BASE_UNIT * 1}px ${BASE_UNIT * 2}px 0 rgba(0, 0, 0, 0.05)`,
  'md': `0 ${BASE_UNIT * 2}px ${BASE_UNIT * 3}px 0 rgba(0, 0, 0, 0.1)`,
  'lg': `0 ${BASE_UNIT * 3}px ${BASE_UNIT * 5}px 0 rgba(0, 0, 0, 0.15)`,
  'xl': `0 ${BASE_UNIT * 5}px ${BASE_UNIT * 8}px 0 rgba(0, 0, 0, 0.2)`,
  '2xl': `0 ${BASE_UNIT * 8}px ${BASE_UNIT * 13}px 0 rgba(0, 0, 0, 0.25)`,
  'inner': `inset 0 ${BASE_UNIT * 1}px ${BASE_UNIT * 2}px 0 rgba(0, 0, 0, 0.05)`,
  'none': 'none',
};

/**
 * Opacity values based on the golden ratio
 */
export const OPACITY = {
  '0': '0',
  '5': '0.05',
  '10': '0.1',
  '20': '0.2',
  '25': '0.25',
  '30': '0.3',
  '40': '0.4',
  '50': '0.5',
  '60': '0.6',
  '70': '0.7',
  '75': '0.75',
  '80': '0.8',
  '90': '0.9',
  '95': '0.95',
  '100': '1',
  'phi-1': PHI_INVERSE.toFixed(2), // 0.62
  'phi-2': (1 - PHI_INVERSE).toFixed(2), // 0.38
};

/**
 * Animation durations based on the Fibonacci sequence and Tesla 3-6-9 pattern
 */
export const DURATION = {
  '75': '75ms',
  '100': '100ms',
  '150': '150ms',
  '200': '200ms',
  '300': '300ms',
  '500': '500ms',
  '700': '700ms',
  '1000': '1000ms',
  // Fibonacci-based durations
  'fib-1': `${FIBONACCI[0] * 100}ms`, // 100ms
  'fib-2': `${FIBONACCI[1] * 100}ms`, // 100ms
  'fib-3': `${FIBONACCI[2] * 100}ms`, // 200ms
  'fib-5': `${FIBONACCI[3] * 100}ms`, // 300ms
  'fib-8': `${FIBONACCI[4] * 100}ms`, // 500ms
  'fib-13': `${FIBONACCI[5] * 100}ms`, // 800ms
  'fib-21': `${FIBONACCI[6] * 100}ms`, // 1300ms
  // Tesla-based durations
  't3': '300ms',
  't6': '600ms',
  't9': '900ms',
};

/**
 * Animation timing functions based on sacred geometry
 */
export const TIMING_FUNCTION = {
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'golden-in': `cubic-bezier(0, 0, ${PHI_INVERSE}, 1)`,
  'golden-out': `cubic-bezier(0, ${PHI_INVERSE}, 1, 1)`,
  'golden-in-out': `cubic-bezier(${PHI_INVERSE}, 0, ${1 - PHI_INVERSE}, 1)`,
  'tesla-3': 'cubic-bezier(0.33, 0, 0.67, 1)',
  'tesla-6': 'cubic-bezier(0.66, 0, 0.34, 1)',
  'tesla-9': 'cubic-bezier(0.99, 0, 0.01, 1)',
};

/**
 * Avolve platform specific design tokens
 * Based on the three pillars: Superachiever, Superachievers, Supercivilization
 */
export const AVOLVE_DESIGN: {
  [pillar: string]: {
    [category: string]: any;
  };
} = {
  // Superachiever - Individual journey (Stone gradient)
  superachiever: {
    spacing: {
      base: BASE_UNIT * 3, // 9px (Tesla's 3)
      content: BASE_UNIT * 8, // 24px (Fibonacci)
      section: BASE_UNIT * 21, // 63px (Fibonacci)
    },
    sizing: {
      icon: BASE_UNIT * 8, // 24px (Fibonacci)
      button: BASE_UNIT * 13, // 39px (Fibonacci)
      card: BASE_UNIT * 34, // 102px (Fibonacci)
    },
    radius: BASE_UNIT * 3, // 9px (Tesla's 3)
    ratio: PHI, // Golden ratio
    grid: [3, 3, 3], // 3×3 grid (Tesla's 3)
  },
  
  // Superachievers - Collective journey (Slate gradient)
  superachievers: {
    spacing: {
      base: BASE_UNIT * 6, // 18px (Tesla's 6)
      content: BASE_UNIT * 13, // 39px (Fibonacci)
      section: BASE_UNIT * 34, // 102px (Fibonacci)
    },
    sizing: {
      icon: BASE_UNIT * 13, // 39px (Fibonacci)
      button: BASE_UNIT * 21, // 63px (Fibonacci)
      card: BASE_UNIT * 55, // 165px (Fibonacci)
    },
    radius: BASE_UNIT * 6, // 18px (Tesla's 6)
    ratio: PHI * PHI_INVERSE, // 1 (Square)
    grid: [3, 3, 6, 6], // 2×2 grid with 6 units (Tesla's 6)
  },
  
  // Supercivilization - Ecosystem journey (Zinc gradient)
  supercivilization: {
    spacing: {
      base: BASE_UNIT * 9, // 27px (Tesla's 9)
      content: BASE_UNIT * 21, // 63px (Fibonacci)
      section: BASE_UNIT * 55, // 165px (Fibonacci)
    },
    sizing: {
      icon: BASE_UNIT * 21, // 63px (Fibonacci)
      button: BASE_UNIT * 34, // 102px (Fibonacci)
      card: BASE_UNIT * 89, // 267px (Fibonacci)
    },
    radius: BASE_UNIT * 9, // 27px (Tesla's 9)
    ratio: PHI * PHI, // 2.618 (Golden ratio squared)
    grid: [3, 3, 3, 3, 3, 3, 3, 3, 3], // 3×3 grid with 9 units (Tesla's 9)
  },
};

/**
 * Helper function to get a value from the spacing scale
 * @param key The key in the SPACING object
 * @returns The spacing value in pixels
 */
export function getSpacing(key: keyof typeof SPACING): number | string {
  return SPACING[key];
}

/**
 * Helper function to get a value from the font size scale
 * @param key The key in the FONT_SIZE object
 * @returns The font size value in pixels
 */
export function getFontSize(key: keyof typeof FONT_SIZE): number | string {
  return FONT_SIZE[key];
}

/**
 * Helper function to get a value from the border radius scale
 * @param key The key in the BORDER_RADIUS object
 * @returns The border radius value in pixels
 */
export function getBorderRadius(key: keyof typeof BORDER_RADIUS): number | string {
  return BORDER_RADIUS[key];
}

/**
 * Helper function to get a value from the size scale
 * @param key The key in the SIZE object
 * @returns The size value in pixels or percentage
 */
export function getSize(key: keyof typeof SIZE): number | string {
  return SIZE[key];
}

/**
 * Helper function to get a value from the Avolve design tokens
 * @param pillar The Avolve pillar (superachiever, superachievers, supercivilization)
 * @param category The category of design token (spacing, sizing, radius, ratio, grid)
 * @param key The specific key within the category
 * @returns The design token value
 */
export function getAvolveDesign(
  pillar: keyof typeof AVOLVE_DESIGN,
  category: string,
  key?: string
): number | string | number[] {
  if (category === 'radius' || category === 'ratio') {
    return AVOLVE_DESIGN[pillar][category];
  }
  
  if (key && category !== 'grid') {
    return AVOLVE_DESIGN[pillar][category][key];
  }
  
  return AVOLVE_DESIGN[pillar][category];
}

/**
 * Helper function to create a golden ratio grid
 * @param columns Number of columns
 * @returns Array of column widths in percentage
 */
export function createGoldenGrid(columns: number): string[] {
  if (columns === 1) return ['100%'];
  if (columns === 2) return [`${PHI_INVERSE * 100}%`, `${(1 - PHI_INVERSE) * 100}%`];
  
  // For more than 2 columns, create a Fibonacci-like sequence of percentages
  const total = Math.pow(PHI, columns) - 1;
  return Array.from({ length: columns }, (_, i) => {
    const width = Math.pow(PHI, i + 1) - Math.pow(PHI, i);
    return `${(width / total) * 100}%`;
  });
}

/**
 * Helper function to create a Tesla 3-6-9 grid
 * @param type The type of Tesla grid (3, 6, or 9)
 * @returns Array of column/row sizes
 */
export function createTeslaGrid(type: 3 | 6 | 9): number[] {
  if (type === 3) return [3, 3, 3]; // 3×3 grid
  if (type === 6) return [3, 3, 6, 6, 3, 3]; // 3×2 grid with 6 units
  return [3, 3, 3, 3, 3, 3, 3, 3, 3]; // 3×3 grid with 9 units
}

/**
 * Converts a pixel value to rem
 * @param px Pixel value
 * @param base Base font size (default: 16)
 * @returns Rem value as string
 */
export function pxToRem(px: number, base: number = 16): string {
  return `${px / base}rem`;
}

/**
 * Converts a pixel value to em
 * @param px Pixel value
 * @param base Base font size (default: 16)
 * @returns Em value as string
 */
export function pxToEm(px: number, base: number = 16): string {
  return `${px / base}em`;
}

/**
 * Creates a CSS value with unit
 * @param value Numeric value
 * @param unit Unit (px, rem, em, %, etc.)
 * @returns CSS value as string
 */
export function createCssValue(value: number, unit: string = 'px'): string {
  return `${value}${unit}`;
}
