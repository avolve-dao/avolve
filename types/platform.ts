// Token related types
export const TokenSymbols = {
  GEN: 'GEN',
  SAP: 'SAP',
  PSP: 'PSP',
  BSP: 'BSP',
  SMS: 'SMS',
  SCQ: 'SCQ',
  SPD: 'SPD',
  SHE: 'SHE',
  SSA: 'SSA',
  SGB: 'SGB'
} as const;
export type TokenSymbol = typeof TokenSymbols[keyof typeof TokenSymbols];

// Metric related types
export const MetricTypes = {
  ACTIVITY: 'ACTIVITY',
  ENGAGEMENT: 'ENGAGEMENT',
  CONTRIBUTION: 'CONTRIBUTION',
  LEARNING: 'LEARNING',
  COMMUNITY: 'COMMUNITY',
  NPS: 'NPS',
  TIME_SPENT: 'TIME_SPENT',
  INTERACTION: 'INTERACTION'
} as const;
export type MetricType = typeof MetricTypes[keyof typeof MetricTypes];

// Team related types
export const TeamRoles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  CONTRIBUTOR: 'CONTRIBUTOR',
  OBSERVER: 'OBSERVER'
} as const;
export type TeamRole = typeof TeamRoles[keyof typeof TeamRoles];

export const TeamChallengeStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;
export type TeamChallengeStatus = typeof TeamChallengeStatuses[keyof typeof TeamChallengeStatuses];
