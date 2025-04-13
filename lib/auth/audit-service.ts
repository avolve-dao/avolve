/**
 * RBAC Audit Service
 * 
 * This service provides methods for retrieving and analyzing RBAC audit logs.
 * It helps administrators track changes to roles and permissions over time.
 */

import { AuthError } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import { createServerComponentClient } from '@/lib/supabase/server';

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

// Result interface
export interface AuditResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Audit Log interface
export interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  target_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Audit Log Filter interface
export interface AuditLogFilter {
  actionType?: string;
  entityType?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Audit Service Class
 */
export class AuditService {
  private client: any;
  private static instance: AuditService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(client: any) {
    this.client = client;
  }

  /**
   * Get browser-side instance of the audit service
   */
  public static getBrowserInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService(createBrowserClient());
    }
    return AuditService.instance;
  }

  /**
   * Get server-side instance of the audit service
   */
  public static getServerInstance(): AuditService {
    // Server-side instance is always created fresh to ensure correct cookie handling
    return new AuditService(createServerComponentClient());
  }

  /**
   * Get the Supabase client
   * This is needed for direct access to the client in certain scenarios
   */
  public getSupabaseClient(): any {
    return this.client;
  }

  /**
   * Get audit logs for a specific user
   * 
   * @param userId - The ID of the user to get audit logs for
   * @param limit - The maximum number of logs to return (default: 100)
   * @param offset - The offset for pagination (default: 0)
   * @returns AuditResult with array of AuditLog objects
   */
  public async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditResult<AuditLog[]>> {
    try {
      const { data, error } = await this.client.rpc('get_user_rbac_audit_logs', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) {
        console.error('Get user audit logs error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user audit logs error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting user audit logs') 
      };
    }
  }

  /**
   * Get all RBAC audit logs (admin only)
   * 
   * @param filter - Filter options for audit logs
   * @returns AuditResult with array of AuditLog objects
   */
  public async getAllAuditLogs(
    filter: AuditLogFilter = {}
  ): Promise<AuditResult<AuditLog[]>> {
    try {
      const { 
        actionType, 
        entityType, 
        fromDate, 
        toDate, 
        limit = 100, 
        offset = 0 
      } = filter;
      
      const { data, error } = await this.client.rpc('get_all_rbac_audit_logs', {
        p_limit: limit,
        p_offset: offset,
        p_action_type: actionType || null,
        p_entity_type: entityType || null,
        p_from_date: fromDate ? fromDate.toISOString() : null,
        p_to_date: toDate ? toDate.toISOString() : null
      });
      
      if (error) {
        console.error('Get all audit logs error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all audit logs error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting audit logs') 
      };
    }
  }

  /**
   * Log a custom RBAC action
   * This is useful for logging client-side actions that don't trigger database triggers
   * 
   * @param actionType - The type of action being performed
   * @param entityType - The type of entity being acted upon
   * @param entityId - The ID of the entity being acted upon
   * @param targetId - The ID of the target entity (optional)
   * @param details - Additional details about the action (optional)
   * @returns AuditResult with the ID of the created log
   */
  public async logAction(
    actionType: string,
    entityType: string,
    entityId: string,
    targetId?: string,
    details?: any
  ): Promise<AuditResult<string>> {
    try {
      const { data: user } = await this.client.auth.getUser();
      
      if (!user.user) {
        return { 
          data: null, 
          error: new AuthError('User not authenticated') 
        };
      }
      
      // Get client information if available
      let ipAddress: string | null = null;
      let userAgent: string | null = null;
      
      if (typeof window !== 'undefined') {
        userAgent = window.navigator.userAgent;
      }
      
      const { data, error } = await this.client.rpc('log_rbac_action', {
        p_user_id: user.user.id,
        p_action_type: actionType,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_target_id: targetId || null,
        p_details: details ? JSON.stringify(details) : null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });
      
      if (error) {
        console.error('Log action error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected log action error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while logging action') 
      };
    }
  }
}
