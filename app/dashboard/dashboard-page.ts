// Token type to gradient mapping
export const TOKEN_GRADIENTS = {
  'SPD': 'from-red-500 via-green-500 to-blue-500', // Sunday
  'SHE': 'from-rose-500 via-red-500 to-orange-500', // Monday
  'PSP': 'from-amber-500 to-yellow-500', // Tuesday
  'SSA': 'from-lime-500 via-green-500 to-emerald-500', // Wednesday
  'BSP': 'from-teal-500 to-cyan-500', // Thursday
  'SGB': 'from-sky-500 via-blue-500 to-indigo-500', // Friday
  'SMS': 'from-violet-500 via-purple-500 to-fuchsia-500', // Saturday
  'GEN': 'from-zinc-400 to-zinc-600',
  'SAP': 'from-amber-500 to-yellow-500',
  'SCQ': 'from-emerald-500 to-teal-500'
};

// Day of week to token type mapping
export const DAY_TO_TOKEN = {
  0: 'SPD', // Sunday
  1: 'SHE', // Monday
  2: 'PSP', // Tuesday
  3: 'SSA', // Wednesday
  4: 'BSP', // Thursday
  5: 'SGB', // Friday
  6: 'SMS'  // Saturday
};

// Token type to full name mapping
export const TOKEN_NAMES = {
  'SPD': 'Superpuzzle Developments',
  'SHE': 'Superhuman Enhancements',
  'PSP': 'Personal Success Puzzle',
  'SSA': 'Supersociety Advancements',
  'BSP': 'Business Success Puzzle',
  'SGB': 'Supergenius Breakthroughs',
  'SMS': 'Supermind Superpowers',
  'GEN': 'Supercivilization',
  'SAP': 'Superachiever',
  'SCQ': 'Superachievers'
};

// User streak interface
export interface UserStreak {
  id: string;
  user_id: string;
  streak_count: number;
  streak_multiplier: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

// Activity action types
export type ActivityActionType = 
  | 'login'
  | 'logout'
  | 'view'
  | 'click'
  | 'complete'
  | 'share'
  | 'comment'
  | 'react'
  | 'challenge_completed';
