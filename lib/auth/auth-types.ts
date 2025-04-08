/**
 * @ai-anchor #AUTH_TYPES
 * @ai-context This file contains all authentication-related type definitions for the Avolve platform
 * @ai-related-to auth-service.ts, auth-repository.ts
 * 
 * Authentication Types
 * 
 * This file contains all authentication-related type definitions for the Avolve platform.
 * It provides type safety and documentation for authentication-related data structures.
 */

import { AuthError, Session, User } from '@supabase/supabase-js';

/**
 * Authentication result interface
 * Generic wrapper for all authentication operations
 */
export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

/**
 * Authentication session type
 * Alias for Supabase Session
 */
export type AuthSession = Session;

/**
 * Authentication provider enum
 * Supported OAuth providers
 */
export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  DISCORD = 'discord',
  SLACK = 'slack',
  LINKEDIN = 'linkedin',
  SPOTIFY = 'spotify',
  TWITCH = 'twitch',
  AZURE = 'azure'
}

/**
 * Authentication event enum
 * Events that can be emitted by the authentication system
 */
export enum AuthEvent {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
  USER_UPDATED = 'USER_UPDATED',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  USER_DELETED = 'USER_DELETED'
}

/**
 * Authentication role enum
 * Standard roles in the system
 */
export enum AuthRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

/**
 * User profile interface
 * Extended user information beyond the basic Supabase User
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User settings interface
 * User preferences and settings
 */
export interface UserSettings {
  id: string;
  theme: string;
  notificationPreferences: Record<string, any>;
  privacySettings: Record<string, any>;
  language: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MFA Factor types
 * Types of multi-factor authentication factors
 */
export type MfaFactorType = 'totp' | 'sms' | 'recovery';

/**
 * MFA Factor interface
 * Base interface for multi-factor authentication factors
 */
export interface MfaFactor {
  id: string;
  userId: string;
  factorType: MfaFactorType;
  factorId: string;
  friendlyName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

/**
 * TOTP Factor interface
 * Time-based One-Time Password factor
 */
export interface TotpFactor extends MfaFactor {
  factorType: 'totp';
  secret: string;
  qrCode: string;
}

/**
 * Recovery Codes interface
 * Backup codes for account recovery
 */
export interface RecoveryCodes {
  codes: string[];
  userId: string;
}

/**
 * User Session interface
 * Information about a user's session
 */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Role interface
 * User role information
 */
export interface Role {
  id: string;
  userId: string;
  role: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission interface
 * Permission definition
 */
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

/**
 * User Permission interface
 * Permission assigned to a user
 */
export interface UserPermission {
  id: string;
  userId: string;
  resource: string;
  action: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Token Permission interface
 * Permission with status based on token balance
 */
export interface TokenPermission {
  resource: string;
  action: string;
  hasPermission: boolean;
}
