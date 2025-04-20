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

import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * User type
 * Alias for Supabase User
 */
export type User = SupabaseUser;

/**
 * Authentication result interface
 * Generic wrapper for all authentication operations
 */
export interface AuthResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Authentication session type
 * Information about a user's session
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

/**
 * User profile interface
 * Extended user information beyond the basic Supabase User
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences: UserSettings;
  created_at: string;
  updated_at: string;
  role?: Role;
  hasMfa?: boolean;
}

/**
 * User settings interface
 * User preferences and settings
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

/**
 * MFA Factor types
 * Types of multi-factor authentication factors
 */
export type MfaFactorType = 'totp' | 'recovery';

/**
 * MFA Factor interface
 * Base interface for multi-factor authentication factors
 */
export interface MfaFactor {
  id: string;
  type: MfaFactorType;
  created_at: string;
  updated_at: string;
}

/**
 * TOTP Factor interface
 * Time-based One-Time Password factor
 */
export interface TotpFactor extends MfaFactor {
  type: 'totp';
  secret: string;
  verified: boolean;
}

/**
 * Recovery Codes interface
 * Backup codes for account recovery
 */
export interface RecoveryCodes {
  codes: string[];
  created_at: string;
}

/**
 * User Session interface
 * Information about a user's session
 */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Role type
 * User role information
 */
export type Role = 'user' | 'super' | 'admin';

/**
 * Permission interface
 * Permission definition
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

/**
 * User Permission interface
 * Permission assigned to a user
 */
export interface UserPermission {
  user_id: string;
  permission_id: string;
  granted_at: string;
  granted_by: string;
}

/**
 * Authentication event interface
 * Events that can be emitted by the authentication system
 */
export interface AuthEvent {
  id: string;
  user_id: string;
  type: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Authentication role type
 * Standard roles in the system
 */
export type AuthRole = 'authenticated' | 'anon';

/**
 * Token Permission interface
 * Permission with status based on token balance
 */
export interface TokenPermission {
  resource: string;
  action: string;
  granted: boolean;
}
