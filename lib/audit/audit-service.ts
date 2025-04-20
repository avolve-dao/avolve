/**
 * Audit Service
 * 
 * This service centralizes all audit logging functionality for the Avolve platform.
 * It provides methods for recording and retrieving audit logs.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

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
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Audit Action enum
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REMOVE = 'role_remove',
  CONSENSUS_CREATE = 'consensus_create',
  CONSENSUS_START = 'consensus_start',
  CONSENSUS_END = 'consensus_end',
  RESPECT_GIVE = 'respect_give'
}

// Entity Type enum
export enum EntityType {
  USER = 'user',
  PROFILE = 'profile',
  TOKEN = 'token',
  TOKEN_TYPE = 'token_type',
  PERMISSION = 'permission',
  ROLE = 'role',
  CONSENSUS_MEETING = 'consensus_meeting',
  CONSENSUS_GROUP = 'consensus_group',
  NOTIFICATION = 'notification',
  SETTING = 'setting',
  SESSION = 'session'
}

// Helper function to convert database error to AuthError
function convertError(error: any): AuthError | null {
  if (!error) return null;
  return new AuthError(error.message || 'An unexpected error occurred');
}

/**
 * Audit Service Class
 */
export class AuditService {
  private client: SupabaseClient;
  private static instance: AuditService;

  /**
   * Constructor
   */
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get browser instance
   */
  public static getBrowserInstance(client: SupabaseClient): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService(client);
    }
    return AuditService.instance;
  }

  /**
   * Create an audit log
   */
  public async createAuditLog(
    userId: string,
    action: AuditAction | string,
    entityType: EntityType | string,
    entityId?: string,
    oldData?: Record<string, any>,
    newData?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    try {
      const { data, error } = await this.client.rpc('create_audit_log', {
        p_user_id: userId,
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_old_data: oldData,
        p_new_data: newData,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });
      
      if (error) {
        console.error('Create audit log error:', error);
        return { data: null, error: convertError(error) };
      }
      
      // If the RPC returns the ID, fetch the full audit log
      if (data) {
        const { data: auditLog, error: fetchError } = await this.client
          .from('audit_logs')
          .select('*')
          .eq('id', data)
          .single();
        
        if (fetchError) {
          console.error('Fetch audit log error:', fetchError);
          return { data: null, error: convertError(fetchError) };
        }
        
        return { data: auditLog, error: null };
      }
      
      return { data: null, error: new AuthError('Failed to create audit log') };
    } catch (error) {
      console.error('Unexpected create audit log error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while creating audit log') 
      };
    }
  }

  /**
   * Get audit logs
   */
  public async getAuditLogs(
    limit: number = 100,
    offset: number = 0,
    userId?: string,
    action?: AuditAction | string,
    entityType?: EntityType | string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditResult<AuditLog[]>> {
    try {
      let query = this.client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
        // .offset(offset); // .offset is not supported on PostgrestFilterBuilder in supabase-js v2+
        // Instead, use range for pagination
        .range(offset, offset + limit - 1);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (action) {
        query = query.eq('action', action);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Get audit logs error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get audit logs error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting audit logs') 
      };
    }
  }

  /**
   * Get audit log by ID
   */
  public async getAuditLogById(id: string): Promise<AuditResult<AuditLog>> {
    try {
      const { data, error } = await this.client
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get audit log by ID error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get audit log by ID error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting audit log') 
      };
    }
  }

  /**
   * Get user audit logs
   */
  public async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0,
    action?: AuditAction | string,
    entityType?: EntityType | string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditResult<AuditLog[]>> {
    return this.getAuditLogs(
      limit,
      offset,
      userId,
      action,
      entityType,
      undefined,
      startDate,
      endDate
    );
  }

  /**
   * Get entity audit logs
   */
  public async getEntityAuditLogs(
    entityType: EntityType | string,
    entityId: string,
    limit: number = 100,
    offset: number = 0,
    action?: AuditAction | string,
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditResult<AuditLog[]>> {
    return this.getAuditLogs(
      limit,
      offset,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate
    );
  }

  /**
   * Get audit log count
   */
  public async getAuditLogCount(
    userId?: string,
    action?: AuditAction | string,
    entityType?: EntityType | string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditResult<number>> {
    try {
      let query = this.client
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (action) {
        query = query.eq('action', action);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Get audit log count error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Unexpected get audit log count error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting audit log count') 
      };
    }
  }

  /**
   * Get audit log summary
   */
  public async getAuditLogSummary(
    groupBy: 'action' | 'entity_type' | 'user_id',
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditResult<{ key: string; count: number }[]>> {
    try {
      let timeFilter = '';
      
      if (startDate) {
        timeFilter += ` AND created_at >= '${startDate.toISOString()}'`;
      }
      
      if (endDate) {
        timeFilter += ` AND created_at <= '${endDate.toISOString()}'`;
      }
      
      const { data, error } = await this.client.rpc('get_audit_log_summary', {
        p_group_by: groupBy,
        p_time_filter: timeFilter
      });
      
      if (error) {
        console.error('Get audit log summary error:', error);
        return { data: null, error: convertError(error) };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get audit log summary error:', error);
      return { 
        data: null, 
        error: new AuthError('An unexpected error occurred while getting audit log summary') 
      };
    }
  }

  /**
   * Log user login
   */
  public async logUserLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    return this.createAuditLog(
      userId,
      AuditAction.LOGIN,
      EntityType.USER,
      userId,
      undefined,
      undefined,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log user logout
   */
  public async logUserLogout(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    return this.createAuditLog(
      userId,
      AuditAction.LOGOUT,
      EntityType.USER,
      userId,
      undefined,
      undefined,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log user registration
   */
  public async logUserRegistration(
    userId: string,
    userData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    return this.createAuditLog(
      userId,
      AuditAction.REGISTER,
      EntityType.USER,
      userId,
      undefined,
      userData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log profile update
   */
  public async logProfileUpdate(
    userId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    return this.createAuditLog(
      userId,
      AuditAction.UPDATE,
      EntityType.PROFILE,
      userId,
      oldData,
      newData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log token transfer
   */
  public async logTokenTransfer(
    userId: string,
    tokenTypeId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const transferData = {
      token_type_id: tokenTypeId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      reason
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.TRANSFER,
      EntityType.TOKEN,
      tokenTypeId,
      undefined,
      transferData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log token mint
   */
  public async logTokenMint(
    userId: string,
    tokenTypeId: string,
    toUserId: string,
    amount: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const mintData = {
      token_type_id: tokenTypeId,
      to_user_id: toUserId,
      amount,
      reason
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.MINT,
      EntityType.TOKEN,
      tokenTypeId,
      undefined,
      mintData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log token burn
   */
  public async logTokenBurn(
    userId: string,
    tokenTypeId: string,
    fromUserId: string,
    amount: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const burnData = {
      token_type_id: tokenTypeId,
      from_user_id: fromUserId,
      amount,
      reason
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.BURN,
      EntityType.TOKEN,
      tokenTypeId,
      undefined,
      burnData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log permission grant
   */
  public async logPermissionGrant(
    userId: string,
    targetUserId: string,
    resource: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const permissionData = {
      user_id: targetUserId,
      resource,
      action,
      granted_by: userId,
      granted_at: new Date().toISOString()
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.PERMISSION_GRANT,
      EntityType.PERMISSION,
      `${resource}:${action}`,
      undefined,
      permissionData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log permission revoke
   */
  public async logPermissionRevoke(
    userId: string,
    targetUserId: string,
    resource: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const permissionData = {
      user_id: targetUserId,
      resource,
      action,
      revoked_by: userId,
      revoked_at: new Date().toISOString()
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.PERMISSION_REVOKE,
      EntityType.PERMISSION,
      `${resource}:${action}`,
      undefined,
      permissionData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log role assign
   */
  public async logRoleAssign(
    userId: string,
    targetUserId: string,
    role: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const roleData = {
      user_id: targetUserId,
      role,
      granted_by: userId,
      granted_at: new Date().toISOString()
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.ROLE_ASSIGN,
      EntityType.ROLE,
      role,
      undefined,
      roleData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log role remove
   */
  public async logRoleRemove(
    userId: string,
    targetUserId: string,
    role: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const roleData = {
      user_id: targetUserId,
      role,
      removed_by: userId,
      removed_at: new Date().toISOString()
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.ROLE_REMOVE,
      EntityType.ROLE,
      role,
      undefined,
      roleData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log consensus meeting creation
   */
  public async logConsensusCreate(
    userId: string,
    meetingId: string,
    meetingData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    return this.createAuditLog(
      userId,
      AuditAction.CONSENSUS_CREATE,
      EntityType.CONSENSUS_MEETING,
      meetingId,
      undefined,
      meetingData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log consensus meeting start
   */
  public async logConsensusStart(
    userId: string,
    meetingId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const startData = {
      started_by: userId,
      started_at: new Date().toISOString()
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.CONSENSUS_START,
      EntityType.CONSENSUS_MEETING,
      meetingId,
      undefined,
      startData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log consensus meeting end
   */
  public async logConsensusEnd(
    userId: string,
    meetingId: string,
    outcome?: string,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const endData = {
      ended_by: userId,
      ended_at: new Date().toISOString(),
      outcome,
      notes
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.CONSENSUS_END,
      EntityType.CONSENSUS_MEETING,
      meetingId,
      undefined,
      endData,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log respect given
   */
  public async logRespectGiven(
    userId: string,
    meetingId: string,
    toUserId: string,
    amount: number,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditResult<AuditLog>> {
    const respectData = {
      meeting_id: meetingId,
      from_user_id: userId,
      to_user_id: toUserId,
      amount,
      reason
    };
    
    return this.createAuditLog(
      userId,
      AuditAction.RESPECT_GIVE,
      EntityType.CONSENSUS_MEETING,
      meetingId,
      undefined,
      respectData,
      ipAddress,
      userAgent
    );
  }
}
