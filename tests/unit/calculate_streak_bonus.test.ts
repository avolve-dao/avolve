/**
 * Unit tests for the calculate_streak_bonus function
 * 
 * These tests verify that the Tesla 3-6-9 streak bonus pattern works correctly
 */

import { describe, it, expect } from 'vitest';

/**
 * Calculate streak bonus multiplier based on Tesla's 3-6-9 pattern
 * 
 * @param streak - The current streak count
 * @returns The bonus multiplier
 */
function calculateStreakBonus(streak: number): number {
  if (streak <= 0) {
    return 1.0; // No bonus for zero or negative streaks
  }
  
  if (streak >= 9) {
    // For streaks of 9 or more: 1.9x + 0.3x for each additional 3 days
    return 1.9 + (Math.floor((streak - 9) / 3) * 0.3);
  } else if (streak >= 6) {
    // For streaks of 6-8: 1.6x
    return 1.6;
  } else if (streak >= 3) {
    // For streaks of 3-5: 1.3x
    return 1.3;
  } else {
    // For streaks of 1-2: 1.0x (no bonus)
    return 1.0;
  }
}

describe('calculateStreakBonus', () => {
  // Test cases for invalid inputs
  it('should return 1.0 for negative streaks', () => {
    expect(calculateStreakBonus(-1)).toBe(1.0);
    expect(calculateStreakBonus(-5)).toBe(1.0);
  });
  
  it('should return 1.0 for zero streak', () => {
    expect(calculateStreakBonus(0)).toBe(1.0);
  });
  
  // Test cases for streaks 1-2 (no bonus)
  it('should return 1.0 for streaks of 1-2 days', () => {
    expect(calculateStreakBonus(1)).toBe(1.0);
    expect(calculateStreakBonus(2)).toBe(1.0);
  });
  
  // Test cases for streaks 3-5 (Tesla 3 bonus)
  it('should return 1.3 for streaks of 3-5 days', () => {
    expect(calculateStreakBonus(3)).toBe(1.3);
    expect(calculateStreakBonus(4)).toBe(1.3);
    expect(calculateStreakBonus(5)).toBe(1.3);
  });
  
  // Test cases for streaks 6-8 (Tesla 6 bonus)
  it('should return 1.6 for streaks of 6-8 days', () => {
    expect(calculateStreakBonus(6)).toBe(1.6);
    expect(calculateStreakBonus(7)).toBe(1.6);
    expect(calculateStreakBonus(8)).toBe(1.6);
  });
  
  // Test cases for streaks 9+ (Tesla 9 bonus with incremental increases)
  it('should return 1.9 for a streak of 9 days', () => {
    expect(calculateStreakBonus(9)).toBe(1.9);
  });
  
  it('should return 1.9 for streaks of 10-11 days', () => {
    expect(calculateStreakBonus(10)).toBe(1.9);
    expect(calculateStreakBonus(11)).toBe(1.9);
  });
  
  it('should return 2.2 for a streak of 12 days', () => {
    expect(calculateStreakBonus(12)).toBe(2.2);
  });
  
  it('should return 2.2 for streaks of 13-14 days', () => {
    expect(calculateStreakBonus(13)).toBe(2.2);
    expect(calculateStreakBonus(14)).toBe(2.2);
  });
  
  it('should return 2.5 for a streak of 15 days', () => {
    expect(calculateStreakBonus(15)).toBe(2.5);
  });
  
  // Test case for a very long streak
  it('should calculate the correct bonus for a very long streak', () => {
    // For a 30-day streak: 1.9 + (7 * 0.3) = 1.9 + 2.1 = 4.0
    expect(calculateStreakBonus(30)).toBe(4.0);
  });
});
