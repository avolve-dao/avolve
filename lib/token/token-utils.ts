/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_UTILS
 * @ai-context This module provides utility functions for token operations
 * @ai-related-to token-repository.ts, token-types.ts, token-service.ts
 */

import { DAY_TO_TOKEN_MAP } from './token-types';

/**
 * Retry an operation with exponential backoff
 *
 * @param operation - The operation to retry
 * @param maxRetries - Maximum number of retries (default: 2)
 * @param initialDelay - Initial delay in milliseconds (default: 300)
 * @returns The result of the operation
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 300
): Promise<T> {
  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Get token color based on symbol
 *
 * @param tokenType - The token symbol
 * @returns CSS class string for token color
 */
export function getTokenColor(tokenType: string): string {
  switch (tokenType) {
    case 'SPD':
      return 'bg-gradient-to-r from-red-500 to-blue-500 text-white'; // Red-Green-Blue
    case 'SHE':
      return 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'; // Rose-Red-Orange
    case 'PSP':
      return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'; // Amber-Yellow
    case 'SSA':
      return 'bg-gradient-to-r from-lime-500 to-emerald-500 text-white'; // Lime-Green-Emerald
    case 'BSP':
      return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'; // Teal-Cyan
    case 'SGB':
      return 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'; // Sky-Blue-Indigo
    case 'SMS':
      return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'; // Violet-Purple-Fuchsia-Pink
    case 'SAP':
      return 'bg-gradient-to-r from-slate-500 to-slate-700 text-white'; // Stone gradient
    case 'SCQ':
      return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white'; // Slate gradient
    case 'GEN':
      return 'bg-gradient-to-r from-zinc-400 to-zinc-600 text-white'; // Zinc gradient
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Get today's token symbol based on day of week
 *
 * @returns Today's token symbol
 */
export function getTodayTokenSymbol(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return DAY_TO_TOKEN_MAP[dayOfWeek] || 'GEN';
}

/**
 * Get token name based on symbol
 *
 * @param tokenSymbol - The token symbol
 * @returns The full token name
 */
export function getTokenName(tokenSymbol: string): string {
  switch (tokenSymbol) {
    case 'SPD':
      return 'Superpuzzle Developments';
    case 'SHE':
      return 'Superhuman Enhancements';
    case 'PSP':
      return 'Personal Success Puzzle';
    case 'SSA':
      return 'Supersociety Advancements';
    case 'BSP':
      return 'Business Success Puzzle';
    case 'SGB':
      return 'Supergenius Breakthroughs';
    case 'SMS':
      return 'Supermind Superpowers';
    case 'SAP':
      return 'Superachiever';
    case 'SCQ':
      return 'Superachievers';
    case 'GEN':
      return 'Supercivilization';
    default:
      return 'Unknown Token';
  }
}

/**
 * Get day name based on token symbol
 *
 * @param tokenSymbol - The token symbol
 * @returns The day name for the token
 */
export function getDayForToken(tokenSymbol: string): string {
  switch (tokenSymbol) {
    case 'SPD':
      return 'Sunday';
    case 'SHE':
      return 'Monday';
    case 'PSP':
      return 'Tuesday';
    case 'SSA':
      return 'Wednesday';
    case 'BSP':
      return 'Thursday';
    case 'SGB':
      return 'Friday';
    case 'SMS':
      return 'Saturday';
    default:
      return 'Unknown day';
  }
}

/**
 * Calculate streak bonus multiplier based on Tesla's 3-6-9 pattern
 *
 * @param streakLength - The user's current streak length
 * @returns The bonus multiplier
 */
export function calculateStreakBonus(streakLength: number): number {
  if (streakLength <= 0) {
    return 1.0;
  }
  if (streakLength >= 9) {
    // For streaks of 9 or more: 1.9x + 0.3x for each additional 3 days
    return parseFloat((1.9 + Math.floor((streakLength - 9) / 3) * 0.3).toFixed(1));
  } else if (streakLength >= 6) {
    // For streaks of 6-8: 1.6x
    return 1.6;
  } else if (streakLength >= 3) {
    // For streaks of 3-5: 1.3x
    return 1.3;
  } else {
    // For streaks of 1-2: 1.0x (no bonus)
    return 1.0;
  }
}

/**
 * Get the next streak milestone
 *
 * @param currentStreak - The current streak length
 * @returns The next streak milestone (3, 6, or 9)
 */
export function getNextStreakMilestone(currentStreak: number): number {
  const remainder = currentStreak % 9;

  if (remainder < 3) {
    return 3;
  } else if (remainder < 6) {
    return 6;
  } else {
    return 9;
  }
}

/**
 * Calculate days until next streak milestone
 *
 * @param currentStreak - The current streak length
 * @returns Days until next milestone
 */
export function getDaysUntilNextMilestone(currentStreak: number): number {
  const remainder = currentStreak % 9;

  if (remainder < 3) {
    return 3 - remainder;
  } else if (remainder < 6) {
    return 6 - remainder;
  } else {
    return 9 - remainder;
  }
}
