import { SupercivilizationBrandScript } from "@/lib/branding/supercivilization-brandscript"

/**
 * Routes for the application
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  UPDATE_PASSWORD: "/auth/update-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  MESSAGES: "/messages",
  CHAT: "/chat",
  WALLET: "/wallet",
  GENIE_AI: "/genie-ai",
  UNLOCK_GENIUS_ID: "/unlock/genius-id",
  UNLOCK_GEN_TOKEN: "/unlock/gen-token",
  UNLOCK_GENIE_AI: "/unlock/genie-ai",
  AGREEMENT: "/agreement",
}

/**
 * Cache TTLs in milliseconds
 */
export const CACHE_TTLS = {
  SHORT: 1000 * 60, // 1 minute
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 30, // 30 minutes
  PROFILE: 1000 * 60 * 5, // 5 minutes
  TOKEN_BALANCE: 1000 * 60, // 1 minute
  USER_ROLE: 1000 * 60 * 15, // 15 minutes
}

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  SERVER_ERROR: "Something went wrong on our end. Please try again.",
  AUTH_REQUIRED: "You need to sign in to access this feature.",
  INVALID_INPUT: "Please check your information and try again.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  PERMISSION_DENIED: "You don't have permission to access this feature.",
}

/**
 * Database tables
 */
export const DB_TABLES = {
  PROFILES: "profiles",
  MESSAGES: "messages",
  CHALLENGES: "challenges",
  USER_CHALLENGES: "user_challenges",
  TOKENS: "tokens",
  TOKEN_TRANSACTIONS: "token_transactions",
  AGREEMENTS: "agreements",
  USER_AGREEMENTS: "user_agreements",
  EVENTS: "analytics_events",
  PAGE_VIEWS: "analytics_pageviews",
}

/**
 * Supercivilization messaging constants
 */
export const SUPERCIVILIZATION_MESSAGING = {
  // Core concepts
  DEGEN: "Follower mentality trapped in zero-sum thinking",
  REGEN: "Self-leader and integrated thinker creating positive-sum value",
  ANTICIVILIZATION: "System based on value extraction and destruction",
  SUPERCIVILIZATION: "System based on value creation and production",

  // Problems
  DEGEN_PROBLEM: SupercivilizationBrandScript.problem.external,
  ANTICIVILIZATION_PROBLEM: "Enables parasitical elites who harm good and great people",

  // Solutions
  REGEN_SOLUTION: "Become a value creator who benefits self, others, society, and environment",
  SUPERCIVILIZATION_SOLUTION: "Join a positive-sum system where everyone can thrive",

  // Core components
  GENIUS_ID: "Your unique identity as a value creator in the Supercivilization",
  GEN_TOKEN: "The currency of value creation in the Supercivilization",
  GENIE_AI: "Your guide on the journey from Degen to Regen",

  // Transformation steps
  STEP_1: SupercivilizationBrandScript.plan[0],
  STEP_2: SupercivilizationBrandScript.plan[1],
  STEP_3: SupercivilizationBrandScript.plan[2],
  STEP_4: SupercivilizationBrandScript.plan[3],

  // Calls to action
  PRIMARY_CTA: SupercivilizationBrandScript.callToAction.direct,
  SECONDARY_CTA: SupercivilizationBrandScript.callToAction.transitional,

  // One-liner
  ONE_LINER: SupercivilizationBrandScript.oneLiner,
}

/**
 * User roles
 */
export const USER_ROLES = {
  USER: "user",
  CONTRIBUTOR: "contributor",
  MODERATOR: "moderator",
  ADMIN: "admin",
  GUEST: "guest",
}

/**
 * Token costs for various actions
 */
export const TOKEN_COSTS = {
  MESSAGE_SEND: 1,
  CHALLENGE_COMPLETION: 5,
  PROFILE_UPDATE: 2,
  GENIE_AI_QUERY: 3,
  CONTENT_CREATION: 10,
  INVITATION_SEND: 15,
}

/**
 * Pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MESSAGES_PAGE_SIZE: 20,
  CHALLENGES_PAGE_SIZE: 12,
  TRANSACTIONS_PAGE_SIZE: 15,
  MAX_PAGE_SIZE: 50,
}

/**
 * Rate limits for various actions
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { count: 5, window: "10m" },
  PASSWORD_RESET: { count: 3, window: "1h" },
  MESSAGE_SEND: { count: 50, window: "1h" },
  GENIE_AI_QUERIES: { count: 20, window: "1h" },
  API_REQUESTS: { count: 100, window: "1m" },
}

/**
 * Current agreement version
 */
export const CURRENT_AGREEMENT_VERSION = "1.0.0"

/**
 * Token types
 */
export const TOKEN_TYPES = {
  GEN: "gen",
  SAP: "sap",
  PSP: "psp",
  BSP: "bsp",
  SMS: "sms",
  SCQ: "scq",
  SPD: "spd",
  SHE: "she",
  SSA: "ssa",
  SBG: "sbg",
}

/**
 * Token rewards for various actions
 */
export const TOKEN_REWARDS = {
  DAILY_LOGIN: 5,
  PROFILE_COMPLETION: 20,
  CHALLENGE_COMPLETION: {
    EASY: 10,
    MEDIUM: 25,
    HARD: 50,
  },
  CONTENT_CREATION: 15,
  REFERRAL: 50,
  COMMUNITY_CONTRIBUTION: 30,
}
