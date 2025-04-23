/**
 * Sacred Geometry Utilities for Avolve Platform
 * 
 * This module provides functions and constants based on sacred geometry principles
 * including the golden ratio, Fibonacci sequence, and sacred geometric patterns.
 */

// Golden Ratio (φ ≈ 1.618033988749895)
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 0.618033988749895;

// Fibonacci sequence (first 15 numbers)
export const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

/**
 * Tesla's 3-6-9 Pattern Constants
 * 
 * "If you only knew the magnificence of the 3, 6 and 9, then you would have a key to the universe."
 * - Nikola Tesla
 * 
 * These numbers represent the fundamental patterns of energy flow in the universe.
 */
export const TESLA_TRIAD = {
  THREE: 3,   // Creation, beginning, trinity
  SIX: 6,     // Harmony, balance, hexad
  NINE: 9     // Completion, fulfillment, nonagon
};

/**
 * Vortex Mathematics Digital Roots
 * 
 * In vortex mathematics, all numbers reduce to a single digit (1-9)
 * through digital root calculation. The pattern of 3-6-9 is special
 * and forms its own family.
 */
export const VORTEX_FAMILIES = {
  FAMILY_369: [3, 6, 9],           // Tesla's key numbers
  FAMILY_147: [1, 4, 7],           // Manifestation family
  FAMILY_258: [2, 5, 8]            // Balance family
};

/**
 * Sacred Geometry Angles (in degrees)
 */
export const SACRED_ANGLES = {
  // Tesla 3-6-9 based angles
  ANGLE_36: 36,   // 9×4 degrees
  ANGLE_60: 60,   // 6×10 degrees - Hexagon/Flower of Life
  ANGLE_72: 72,   // Pentagon/Five-fold symmetry
  ANGLE_90: 90,   // 9×10 degrees - Right angle
  ANGLE_108: 108, // 9×12 degrees - Pentagon interior
  ANGLE_120: 120, // 6×20 degrees - Hexagon interior
  ANGLE_144: 144, // 9×16 degrees
  ANGLE_180: 180, // 9×20 degrees - Straight line
  
  // Triangular symmetry (equilateral triangle)
  TRIANGLE: 60,
  
  // Square symmetry
  SQUARE: 90,
  
  // Pentagonal symmetry
  PENTAGON: 72,
  PENTAGON_INTERIOR: 108,
  
  // Hexagonal symmetry (Flower of Life)
  HEXAGON: 60,
  HEXAGON_INTERIOR: 120,
  
  // Octagonal symmetry
  OCTAGON: 45,
  
  // Dodecagonal symmetry
  DODECAGON: 30,
};

/**
 * Sacred Geometry Ratios
 */
export const SACRED_RATIOS = {
  GOLDEN_RATIO: PHI,
  GOLDEN_RATIO_INVERSE: PHI_INVERSE,
  SQUARE_ROOT_2: 1.4142135623730951, // √2
  SQUARE_ROOT_3: 1.7320508075688772, // √3
  SQUARE_ROOT_5: 2.23606797749979,   // √5
};

/**
 * Calculates a value based on the golden ratio
 * @param base The base value
 * @param steps Number of golden ratio steps (positive or negative)
 * @returns The calculated value
 */
export function goldenRatioScale(base: number, steps: number): number {
  return base * Math.pow(PHI, steps);
}

/**
 * Calculates a Fibonacci-based value
 * @param index The index in the Fibonacci sequence (0-based)
 * @returns The Fibonacci number at the specified index
 */
export function getFibonacciNumber(index: number): number {
  if (index < 0) return 0;
  if (index < FIBONACCI.length) return FIBONACCI[index];
  
  // Calculate Fibonacci numbers beyond the predefined array
  let a = FIBONACCI[FIBONACCI.length - 2];
  let b = FIBONACCI[FIBONACCI.length - 1];
  
  for (let i = FIBONACCI.length; i <= index; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  
  return b;
}

/**
 * Calculates the digital root of a number (used in vortex mathematics)
 * Digital root is the single-digit value obtained by summing the digits
 * @param num The number to calculate the digital root for
 * @returns The digital root (1-9)
 */
export function digitalRoot(num: number): number {
  if (num <= 0) return 0;
  if (num % 9 === 0) return 9;
  return num % 9;
}

/**
 * Checks if a number belongs to Tesla's 3-6-9 pattern
 * @param num The number to check
 * @returns True if the number's digital root is 3, 6, or 9
 */
export function isTesla369Number(num: number): boolean {
  const root = digitalRoot(num);
  return root === 3 || root === 6 || root === 9;
}

/**
 * Determines which vortex family a number belongs to
 * @param num The number to check
 * @returns The vortex family (369, 147, or 258)
 */
export function getVortexFamily(num: number): '369' | '147' | '258' {
  const root = digitalRoot(num);
  
  if (VORTEX_FAMILIES.FAMILY_369.includes(root)) return '369';
  if (VORTEX_FAMILIES.FAMILY_147.includes(root)) return '147';
  return '258';
}

/**
 * Generates SVG path data for a golden spiral
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param size Base size of the spiral
 * @param turns Number of turns in the spiral
 * @returns SVG path data string
 */
export function goldenSpiralPath(centerX: number, centerY: number, size: number, turns: number = 4): string {
  let path = `M ${centerX} ${centerY}`;
  let currentSize = size;
  let currentAngle = 0;
  
  for (let i = 0; i < turns * 4; i++) {
    const nextSize = currentSize * PHI_INVERSE;
    currentAngle += 90; // 90 degrees per quarter turn
    
    // Calculate end point of this arc
    const radians = (currentAngle * Math.PI) / 180;
    const x = centerX + currentSize * Math.cos(radians);
    const y = centerY + currentSize * Math.sin(radians);
    
    path += ` A ${currentSize} ${currentSize} 0 0 1 ${x} ${y}`;
    currentSize = nextSize;
  }
  
  return path;
}

/**
 * Generates SVG path data for a Tesla 3-6-9 vortex spiral
 * This spiral follows a pattern based on 3, 6, and 9
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param size Base size of the spiral
 * @param turns Number of turns in the spiral
 * @returns SVG path data string
 */
export function tesla369SpiralPath(centerX: number, centerY: number, size: number, turns: number = 3): string {
  let path = `M ${centerX} ${centerY}`;
  let currentSize = size / 9; // Start with smallest size
  let currentAngle = 0;
  
  // Create 3 turns with 3 segments each (total of 9 segments)
  for (let turn = 0; turn < turns; turn++) {
    for (let segment = 0; segment < 3; segment++) {
      // Each segment is 120 degrees (360/3)
      currentAngle += 120;
      
      // Size increases by a factor related to segment position (3, 6, or 9)
      const growthFactor = (segment + 1) * 3 / 9;
      currentSize = currentSize * (1 + growthFactor);
      
      // Calculate end point of this arc
      const radians = (currentAngle * Math.PI) / 180;
      const x = centerX + currentSize * Math.cos(radians);
      const y = centerY + currentSize * Math.sin(radians);
      
      path += ` A ${currentSize} ${currentSize} 0 0 1 ${x} ${y}`;
    }
  }
  
  return path;
}

/**
 * Generates SVG path data for a pentagon
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Radius of the pentagon
 * @returns SVG path data string
 */
export function pentagonPath(centerX: number, centerY: number, radius: number): string {
  let path = '';
  
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 18) * (Math.PI / 180); // -18 to start at top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      path = `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  return path + ' Z'; // Close the path
}

/**
 * Generates SVG path data for a hexagon
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Radius of the hexagon
 * @returns SVG path data string
 */
export function hexagonPath(centerX: number, centerY: number, radius: number): string {
  let path = '';
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      path = `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  return path + ' Z'; // Close the path
}

/**
 * Generates SVG path data for a nonagon (9-sided polygon)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Radius of the nonagon
 * @returns SVG path data string
 */
export function nonagonPath(centerX: number, centerY: number, radius: number): string {
  let path = '';
  
  for (let i = 0; i < 9; i++) {
    const angle = (i * 40) * (Math.PI / 180); // 360/9 = 40 degrees per side
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      path = `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  return path + ' Z'; // Close the path
}

/**
 * Generates SVG path data for a triangle (3-sided polygon)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Radius of the triangle
 * @returns SVG path data string
 */
export function trianglePath(centerX: number, centerY: number, radius: number): string {
  let path = '';
  
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 - 90) * (Math.PI / 180); // -90 to start at top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      path = `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  return path + ' Z'; // Close the path
}

/**
 * Generates SVG path data for the Seed of Life pattern
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param radius Radius of each circle
 * @returns Array of circle coordinates {cx, cy, r}
 */
export function seedOfLifeCircles(centerX: number, centerY: number, radius: number): Array<{cx: number, cy: number, r: number}> {
  const circles = [
    { cx: centerX, cy: centerY, r: radius } // Center circle
  ];
  
  // Six surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    circles.push({
      cx: centerX + radius * Math.cos(angle),
      cy: centerY + radius * Math.sin(angle),
      r: radius
    });
  }
  
  return circles;
}

/**
 * Generates coordinates for a Tesla 3-6-9 pattern
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param baseRadius Base radius for the pattern
 * @returns Array of point coordinates for 3, 6, and 9 positions
 */
export function tesla369Pattern(centerX: number, centerY: number, baseRadius: number): {
  three: Array<{x: number, y: number, r: number}>,
  six: Array<{x: number, y: number, r: number}>,
  nine: Array<{x: number, y: number, r: number}>
} {
  // 3 points at the top (smallest)
  const three = Array.from({ length: 3 }, (_, i) => {
    const angle = (i * 120 - 90) * (Math.PI / 180); // -90 to start at top
    return {
      x: centerX + baseRadius * 0.5 * Math.cos(angle),
      y: centerY + baseRadius * 0.5 * Math.sin(angle),
      r: baseRadius * 0.1
    };
  });
  
  // 6 points in the middle
  const six = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60) * (Math.PI / 180);
    return {
      x: centerX + baseRadius * 0.75 * Math.cos(angle),
      y: centerY + baseRadius * 0.75 * Math.sin(angle),
      r: baseRadius * 0.15
    };
  });
  
  // 9 points around the perimeter (largest)
  const nine = Array.from({ length: 9 }, (_, i) => {
    const angle = (i * 40) * (Math.PI / 180); // 360/9 = 40 degrees per side
    return {
      x: centerX + baseRadius * Math.cos(angle),
      y: centerY + baseRadius * Math.sin(angle),
      r: baseRadius * 0.2
    };
  });
  
  return { three, six, nine };
}

/**
 * Generates a clip path for a shape based on the golden ratio
 * @param shape The shape name ('card', 'button', 'icon', etc.)
 * @returns CSS clip-path value
 */
export function goldenClipPath(shape: 'card' | 'button' | 'icon' | 'avatar' | 'container'): string {
  switch (shape) {
    case 'card':
      // Golden ratio card with subtle sacred geometry influence
      return `polygon(
        0% 0%,
        100% 0%,
        100% calc(100% - ${PHI_INVERSE * 100}%),
        calc(100% - ${PHI_INVERSE * 100}%) 100%,
        0% 100%
      )`;
      
    case 'button':
      // Hexagonal button with golden ratio proportions
      return `polygon(
        ${PHI_INVERSE * 50}% 0%,
        ${100 - PHI_INVERSE * 50}% 0%,
        100% 50%,
        ${100 - PHI_INVERSE * 50}% 100%,
        ${PHI_INVERSE * 50}% 100%,
        0% 50%
      )`;
      
    case 'icon':
      // Pentagonal icon
      return `polygon(
        50% 0%,
        100% ${PHI_INVERSE * 100}%,
        ${50 + PHI_INVERSE * 50}% 100%,
        ${50 - PHI_INVERSE * 50}% 100%,
        0% ${PHI_INVERSE * 100}%
      )`;
      
    case 'avatar':
      // Octagonal avatar
      return `polygon(
        29.3% 0%,
        70.7% 0%,
        100% 29.3%,
        100% 70.7%,
        70.7% 100%,
        29.3% 100%,
        0% 70.7%,
        0% 29.3%
      )`;
      
    case 'container':
      // Subtle golden ratio container
      return `polygon(
        0% ${PHI_INVERSE * 10}%,
        ${PHI_INVERSE * 10}% 0%,
        ${100 - PHI_INVERSE * 10}% 0%,
        100% ${PHI_INVERSE * 10}%,
        100% ${100 - PHI_INVERSE * 10}%,
        ${100 - PHI_INVERSE * 10}% 100%,
        ${PHI_INVERSE * 10}% 100%,
        0% ${100 - PHI_INVERSE * 10}%
      )`;
      
    default:
      return '';
  }
}

/**
 * Generates a clip path for a shape based on Tesla's 3-6-9 pattern
 * @param shape The shape name ('trinity', 'hexad', 'nonagon')
 * @returns CSS clip-path value
 */
export function tesla369ClipPath(shape: 'trinity' | 'hexad' | 'nonagon'): string {
  switch (shape) {
    case 'trinity':
      // Triangle (3 sides) representing the power of 3
      return `polygon(
        50% 0%,
        93.3% 75%,
        6.7% 75%
      )`;
      
    case 'hexad':
      // Hexagon (6 sides) representing the power of 6
      return `polygon(
        25% 0%,
        75% 0%,
        100% 50%,
        75% 100%,
        25% 100%,
        0% 50%
      )`;
      
    case 'nonagon':
      // Nonagon (9 sides) representing the power of 9
      return `polygon(
        50% 0%,
        80% 10%,
        100% 35%,
        100% 70%,
        80% 90%,
        50% 100%,
        20% 90%,
        0% 70%,
        0% 35%,
        20% 10%
      )`;
      
    default:
      return '';
  }
}

/**
 * Maps Avolve platform sections to sacred geometry patterns
 */
export const AVOLVE_SACRED_PATTERNS = {
  superachiever: {
    angle: SACRED_ANGLES.PENTAGON_INTERIOR,
    ratio: SACRED_RATIOS.GOLDEN_RATIO,
    shape: 'pentagon',
    gradient: 'from-zinc-500 to-zinc-700',
    vortexFamily: '369' as const,
    teslaShape: 'trinity' as const
  },
  personal: {
    angle: SACRED_ANGLES.PENTAGON,
    ratio: SACRED_RATIOS.GOLDEN_RATIO,
    shape: 'pentagon',
    gradient: 'from-amber-500 to-yellow-500',
    vortexFamily: '147' as const,
    teslaShape: 'trinity' as const
  },
  business: {
    angle: SACRED_ANGLES.HEXAGON,
    ratio: SACRED_RATIOS.SQUARE_ROOT_3,
    shape: 'hexagon',
    gradient: 'from-teal-500 to-cyan-500',
    vortexFamily: '258' as const,
    teslaShape: 'hexad' as const
  },
  supermind: {
    angle: SACRED_ANGLES.TRIANGLE,
    ratio: SACRED_RATIOS.SQUARE_ROOT_5,
    shape: 'octagon',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    vortexFamily: '369' as const,
    teslaShape: 'nonagon' as const
  },
  superachievers: {
    angle: SACRED_ANGLES.SQUARE,
    ratio: SACRED_RATIOS.SQUARE_ROOT_2,
    shape: 'square',
    gradient: 'from-zinc-500 to-zinc-700',
    vortexFamily: '147' as const,
    teslaShape: 'hexad' as const
  },
  supercivilization: {
    angle: SACRED_ANGLES.DODECAGON,
    ratio: PHI,
    shape: 'circle',
    gradient: 'from-zinc-500 to-zinc-700',
    vortexFamily: '258' as const,
    teslaShape: 'nonagon' as const
  },
};

/**
 * Calculates spacing based on the golden ratio
 * @param baseSize Base size in pixels
 * @param level Level of scaling (-3 to 3)
 * @returns The calculated size
 */
export function goldenSpacing(baseSize: number = 16, level: number = 0): number {
  return baseSize * Math.pow(PHI, level);
}

/**
 * Calculates spacing based on Tesla's 3-6-9 pattern
 * @param baseSize Base size in pixels
 * @param factor Which Tesla factor to use (3, 6, or 9)
 * @returns The calculated size
 */
export function tesla369Spacing(baseSize: number = 3, factor: 3 | 6 | 9 = 3): number {
  return baseSize * factor;
}

/**
 * Returns a CSS value for golden ratio spacing
 * @param baseSize Base size in pixels
 * @param level Level of scaling (-3 to 3)
 * @returns CSS value with unit
 */
export function goldenSpace(baseSize: number = 16, level: number = 0): string {
  return `${goldenSpacing(baseSize, level)}px`;
}

/**
 * Returns a CSS value for Tesla 3-6-9 spacing
 * @param baseSize Base size in pixels
 * @param factor Which Tesla factor to use (3, 6, or 9)
 * @returns CSS value with unit
 */
export function tesla369Space(baseSize: number = 3, factor: 3 | 6 | 9 = 3): string {
  return `${tesla369Spacing(baseSize, factor)}px`;
}

/**
 * Generates a sacred geometry background pattern
 * @param type Pattern type
 * @param color Base color
 * @returns CSS background value
 */
export function sacredPattern(
  type: 'flower-of-life' | 'seed-of-life' | 'metatron' | 'fibonacci' | 'golden-spiral' | 'tesla-369' | 'vortex',
  color: string = 'currentColor'
): string {
  // Implementation would depend on the pattern type
  // This is a simplified example
  switch (type) {
    case 'flower-of-life':
      return `radial-gradient(circle at 0px 0px, transparent 20px, ${color} 21px, transparent 22px),
              radial-gradient(circle at 21px 12px, transparent 20px, ${color} 21px, transparent 22px),
              radial-gradient(circle at 21px 36px, transparent 20px, ${color} 21px, transparent 22px)`;
    
    case 'tesla-369':
      return `radial-gradient(circle at 50% 50%, transparent 8px, ${color} 9px, transparent 10px),
              radial-gradient(circle at calc(50% + 18px) 50%, transparent 5px, ${color} 6px, transparent 7px),
              radial-gradient(circle at calc(50% - 18px) 50%, transparent 5px, ${color} 6px, transparent 7px),
              radial-gradient(circle at 50% calc(50% + 18px), transparent 5px, ${color} 6px, transparent 7px),
              radial-gradient(circle at 50% calc(50% - 18px), transparent 5px, ${color} 6px, transparent 7px),
              radial-gradient(circle at calc(50% + 9px) calc(50% + 9px), transparent 2px, ${color} 3px, transparent 4px),
              radial-gradient(circle at calc(50% - 9px) calc(50% + 9px), transparent 2px, ${color} 3px, transparent 4px),
              radial-gradient(circle at calc(50% + 9px) calc(50% - 9px), transparent 2px, ${color} 3px, transparent 4px),
              radial-gradient(circle at calc(50% - 9px) calc(50% - 9px), transparent 2px, ${color} 3px, transparent 4px)`;
    
    case 'vortex':
      return `conic-gradient(
                from 0deg,
                transparent 0deg,
                ${color}10 40deg,
                transparent 80deg,
                ${color}10 120deg,
                transparent 160deg,
                ${color}10 200deg,
                transparent 240deg,
                ${color}10 280deg,
                transparent 320deg,
                ${color}10 360deg
              )`;
    
    // Other patterns would be implemented similarly
    default:
      return '';
  }
}

/**
 * Converts a section name to its sacred geometry class
 * @param section Avolve platform section name
 * @returns CSS class name
 */
export function getSacredGeometryClass(section: string): string {
  const sectionMap: Record<string, string> = {
    'superachiever': 'superachiever-sacred',
    'personal': 'personal-success-sacred',
    'business': 'business-success-sacred',
    'supermind': 'supermind-sacred',
    'superachievers': 'superachievers-sacred',
    'supercivilization': 'supercivilization-sacred',
  };
  
  return sectionMap[section] || '';
}

/**
 * Converts a section name to its Tesla 3-6-9 class
 * @param section Avolve platform section name
 * @returns CSS class name
 */
export function getTesla369Class(section: string): string {
  const pattern = AVOLVE_SACRED_PATTERNS[section as keyof typeof AVOLVE_SACRED_PATTERNS];
  
  if (!pattern) return '';
  
  switch (pattern.teslaShape) {
    case 'trinity':
      return 'trinity-sacred';
    case 'hexad':
      return 'hexad-sacred';
    case 'nonagon':
      return 'nonagon-sacred';
    default:
      return '';
  }
}
