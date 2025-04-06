# 📊 Audit Logging System Documentation

> *"What gets measured, gets managed."* — Peter Drucker

Welcome to the Avolve audit logging system! This document provides detailed information about our comprehensive audit logging system implemented in the Avolve platform, focusing on the Role-Based Access Control (RBAC) audit logging features.

## 🔍 Overview

The Avolve platform implements a robust audit logging system that tracks all security-critical actions, particularly those related to role and permission management. This system is essential for:

- 🔐 **Security monitoring** — Detect unauthorized access and suspicious activity
- 📝 **Compliance** — Meet regulatory requirements with detailed audit trails
- 🕵️‍♀️ **Forensic analysis** — Investigate security incidents with complete historical data

## 💾 Database Structure

### 📋 rbac_audit_logs Table

The core of the audit logging system is the `rbac_audit_logs` table, which stores detailed records of all RBAC-related actions.

```sql
create table if not exists public.rbac_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                           -- User who performed the action
  action_type text not null,                       -- Type of action (e.g., assign_role, remove_permission)
  entity_type text not null,                       -- Type of entity affected (e.g., user_role, role_permission)
  entity_id uuid not null,                         -- ID of the affected entity
  target_id uuid,                                  -- Target user or role ID (if applicable)
  details jsonb,                                   -- Additional details about the action
  ip_address text,                                 -- IP address of the user
  user_agent text,                                 -- User agent of the browser/client
  created_at timestamp with time zone not null default now()  -- When the action occurred
);
```

> **Pro Tip:** The `details` field uses JSONB to store flexible metadata about each action, making it easy to add new information without changing the schema.

### 🔒 Row Level Security (RLS) Policies

The audit logs table is protected by RLS policies to ensure that only authorized users can access the logs:

```sql
-- Policy for admins (can read everything)
create policy "Admins can read all audit logs"
  on public.rbac_audit_logs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'user_metadata')::jsonb ? 'is_admin' 
    and ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin')::boolean = true
  );

-- Policy for users (can only read their own audit logs)
create policy "Users can read their own audit logs"
  on public.rbac_audit_logs
  for select
  to authenticated
  using (auth.uid() = user_id);
```

## 🛠️ Database Functions

The audit logging system includes several PostgreSQL functions that handle logging and retrieval of audit data. These functions follow Supabase best practices with `SECURITY INVOKER` and empty search paths.

### 1️⃣ log_rbac_action

This powerful function is the backbone of our audit system, used to log any RBAC-related action, either manually or through triggers.

```sql
create or replace function public.log_rbac_action(
  p_user_id uuid,
  p_action_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_target_id uuid default null,
  p_details jsonb default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_log_id uuid;
begin
  insert into public.rbac_audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    target_id,
    details,
    ip_address,
    user_agent
  ) values (
    p_user_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_target_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) returning id into v_log_id;
  
  return v_log_id;
exception
  when others then
    raise notice 'Error logging RBAC action: %', SQLERRM;
    return null;
end;
$$;
```

> 💡 **Best Practice:** The function includes error handling to ensure that logging failures don't disrupt normal application operation.

### 2️⃣ get_user_rbac_audit_logs

Need to see what's happened to a specific user? This function retrieves audit logs related to a specific user with pagination support.

```sql
create or replace function public.get_user_rbac_audit_logs(
  p_user_id uuid,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  id uuid,
  action_type text,
  entity_type text,
  entity_id uuid,
  target_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select
    al.id,
    al.action_type,
    al.entity_type,
    al.entity_id,
    al.target_id,
    al.details,
    al.ip_address,
    al.user_agent,
    al.created_at
  from
    public.rbac_audit_logs al
  where
    al.target_id = p_user_id
  order by
    al.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;
```

### 3️⃣ get_all_rbac_audit_logs

For administrators who need to see the big picture, this function retrieves all audit logs with flexible filtering options.

```sql
create or replace function public.get_all_rbac_audit_logs(
  p_limit integer default 100,
  p_offset integer default 0,
  p_action_type text default null,
  p_entity_type text default null,
  p_from_date timestamp with time zone default null,
  p_to_date timestamp with time zone default null,
  p_user_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  action_type text,
  entity_type text,
  entity_id uuid,
  target_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user is admin
  if not exists (
    select 1
    from auth.users
    where id = auth.uid()
    and (
      (raw_user_meta_data->>'is_admin')::boolean = true or
      (raw_app_meta_data->>'is_admin')::boolean = true
    )
  ) then
    raise exception 'Only administrators can access all audit logs';
  end if;
  
  return query
  select
    al.id,
    al.user_id,
    al.action_type,
    al.entity_type,
    al.entity_id,
    al.target_id,
    al.details,
    al.ip_address,
    al.user_agent,
    al.created_at
  from
    public.rbac_audit_logs al
  where
    (p_action_type is null or al.action_type = p_action_type)
    and (p_entity_type is null or al.entity_type = p_entity_type)
    and (p_from_date is null or al.created_at >= p_from_date)
    and (p_to_date is null or al.created_at <= p_to_date)
    and (p_user_id is null or al.user_id = p_user_id or al.target_id = p_user_id)
  order by
    al.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;
```

> 🔐 **Security Note:** This function includes a permission check to ensure that only administrators can access all audit logs.

## 🔄 Database Triggers

The audit logging system uses database triggers to automatically log important RBAC events without requiring explicit logging calls in application code. This ensures comprehensive audit coverage with minimal developer effort.

### 🔁 log_role_assignment_changes

This trigger function logs when roles are assigned to or removed from users.

```sql
create or replace function public.log_role_assignment_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (TG_OP = 'INSERT') then
    -- Log role assignment
    perform public.log_rbac_action(
      auth.uid(),
      'assign_role',
      'user_role',
      new.id,
      new.user_id,
      jsonb_build_object(
        'role_id', new.role_id,
        'role_name', (select name from public.roles where id = new.role_id)
      )
    );
  elsif (TG_OP = 'DELETE') then
    -- Log role removal
    perform public.log_rbac_action(
      auth.uid(),
      'remove_role',
      'user_role',
      old.id,
      old.user_id,
      jsonb_build_object(
        'role_id', old.role_id,
        'role_name', (select name from public.roles where id = old.role_id)
      )
    );
  end if;
  
  return null;
end;
$$;

-- Attach the trigger to the user_roles table
create trigger log_role_assignment_changes
after insert or delete on public.user_roles
for each row
execute function public.log_role_assignment_changes();
```

> 🧠 **How it works:** When a role is assigned or removed, this trigger automatically captures who made the change, which user was affected, and which role was involved.

### 🔁 log_permission_assignment_changes

This trigger function logs when permissions are assigned to or removed from roles.

```sql
create or replace function public.log_permission_assignment_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (TG_OP = 'INSERT') then
    -- Log permission assignment
    perform public.log_rbac_action(
      auth.uid(),
      'assign_permission',
      'role_permission',
      new.id,
      new.role_id,
      jsonb_build_object(
        'permission_id', new.permission_id,
        'permission_details', (
          select jsonb_build_object(
            'resource', resource,
            'action', action
          )
          from public.permissions
          where id = new.permission_id
        )
      )
    );
  elsif (TG_OP = 'DELETE') then
    -- Log permission removal
    perform public.log_rbac_action(
      auth.uid(),
      'remove_permission',
      'role_permission',
      old.id,
      old.role_id,
      jsonb_build_object(
        'permission_id', old.permission_id,
        'permission_details', (
          select jsonb_build_object(
            'resource', resource,
            'action', action
          )
          from public.permissions
          where id = old.permission_id
        )
      )
    );
  end if;
  
  return null;
end;
$$;

-- Attach the trigger to the role_permissions table
create trigger log_permission_assignment_changes
after insert or delete on public.role_permissions
for each row
execute function public.log_permission_assignment_changes();
```

> ⚡ **Efficiency Tip:** Using triggers ensures that all changes are logged consistently, even if they occur through different paths (API, database functions, or direct database access).

## 🖥️ Frontend Integration

The audit logging system seamlessly integrates with the frontend application, providing easy-to-use components and services for working with audit logs.

### 🛠️ AuditService

The `AuditService` provides a clean, type-safe interface for retrieving and analyzing audit logs from the client side.

```typescript
export class AuditService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit = 100, offset = 0) {
    try {
      const { data, error } = await this.client.rpc(
        'get_user_rbac_audit_logs',
        {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        }
      );

      if (error) {
        console.error('Error getting user audit logs:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Get all audit logs (admin only)
   */
  async getAllAuditLogs({
    limit = 100,
    offset = 0,
    actionType,
    entityType,
    fromDate,
    toDate,
    userId
  }: {
    limit?: number;
    offset?: number;
    actionType?: string;
    entityType?: string;
    fromDate?: Date;
    toDate?: Date;
    userId?: string;
  }) {
    try {
      const { data, error } = await this.client.rpc(
        'get_all_rbac_audit_logs',
        {
          p_limit: limit,
          p_offset: offset,
          p_action_type: actionType || null,
          p_entity_type: entityType || null,
          p_from_date: fromDate ? fromDate.toISOString() : null,
          p_to_date: toDate ? toDate.toISOString() : null,
          p_user_id: userId || null
        }
      );

      if (error) {
        console.error('Error getting all audit logs:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAllAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Log a custom RBAC action
   */
  async logAction({
    user,
    actionType,
    entityType,
    entityId,
    targetId,
    details,
    ipAddress,
    userAgent
  }: {
    user: Session;
    actionType: string;
    entityType: string;
    entityId: string;
    targetId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
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
        console.error('Error logging RBAC action:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in logAction:', error);
      throw error;
    }
  }
}
```

> 💡 **Developer Tip:** The `AuditService` handles all the complexity of interacting with the database functions, providing a clean API for your application components.

### 📊 AuditLogViewer Component

The `AuditLogViewer` component provides a beautiful, interactive interface for administrators to view and analyze audit logs.

```tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Select, Input } from '@/components/ui';
import { DatePicker } from '@/components/ui/date-picker';
import { AuditService } from '@/lib/audit/audit-service';
import { createClient } from '@/lib/supabase/client';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [actionType, setActionType] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  
  const limit = 20;
  const auditService = new AuditService(createClient());
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAllAuditLogs({
        limit,
        offset: page * limit,
        actionType,
        entityType,
        fromDate,
        toDate
      });
      
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [page, actionType, entityType, fromDate, toDate]);
  
  const handleExport = () => {
    // Implementation for exporting logs to CSV
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'ID,User ID,Action Type,Entity Type,Entity ID,Target ID,Created At\n' +
      logs.map(log => 
        `${log.id},${log.user_id},${log.action_type},${log.entity_type},${log.entity_id},${log.target_id},${log.created_at}`
      ).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const actionTypes = [
    { value: 'assign_role', label: 'Assign Role' },
    { value: 'remove_role', label: 'Remove Role' },
    { value: 'assign_permission', label: 'Assign Permission' },
    { value: 'remove_permission', label: 'Remove Permission' }
  ];
  
  const entityTypes = [
    { value: 'user_role', label: 'User Role' },
    { value: 'role_permission', label: 'Role Permission' }
  ];
  
  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <Button onClick={handleExport} disabled={loading || logs.length === 0}>
            Export CSV
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <Select
              value={actionType || ''}
              onValueChange={(value) => setActionType(value || null)}
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Entity Type</label>
            <Select
              value={entityType || ''}
              onValueChange={(value) => setEntityType(value || null)}
            >
              <option value="">All Entities</option>
              {entityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <DatePicker
              selected={fromDate}
              onSelect={setFromDate}
              placeholder="Select start date"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <DatePicker
              selected={toDate}
              onSelect={setToDate}
              placeholder="Select end date"
            />
          </div>
        </div>
        
        <Table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>User</th>
              <th>Target</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">No audit logs found</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td>{log.action_type}</td>
                  <td>{log.entity_type}</td>
                  <td>{log.user_id}</td>
                  <td>{log.target_id}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    {log.details ? (
                      <details>
                        <summary>View Details</summary>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      'No details'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <span>Page {page + 1}</span>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < limit || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

> 🎨 **UI Enhancement:** The AuditLogViewer component includes filtering, pagination, and export capabilities for a complete audit log management experience.

## Token Transaction Auditing

In addition to RBAC audit logging, the Avolve platform also implements comprehensive auditing for token transactions. This ensures all token-related activities are properly tracked for security, compliance, and transparency.

### token_transactions Table

The `token_transactions` table serves as the primary audit log for all token operations:

```sql
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null,
  fee numeric default 0,
  transaction_type text not null,
  status text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index token_transactions_from_user_id_idx on public.token_transactions (from_user_id);
create index token_transactions_to_user_id_idx on public.token_transactions (to_user_id);
create index token_transactions_token_id_idx on public.token_transactions (token_id);
create index token_transactions_created_at_idx on public.token_transactions (created_at);
```

### Audited Token Operations

The following token operations are automatically audited:

1. **Token Transfers**: When tokens are transferred between users
2. **Token Minting**: When new tokens are created and assigned to users
3. **Token Burning**: When tokens are removed from circulation
4. **Fee Collection**: When transfer fees are collected during token transfers

### Integration with General Audit System

Token transactions are also integrated with the general audit logging system:

```typescript
// Example of logging a token transfer in the audit system
await auditService.logAction({
  user,
  actionType: 'token_transfer',
  entityType: 'token',
  entityId: tokenId,
  targetId: recipientUserId,
  details: {
    amount,
    fee,
    transferAmount: amount - fee,
    transactionId
  }
});
```

### Token Transaction Viewer Component

The platform includes a `TokenTransactionViewer` component that provides a user interface for viewing token transaction history:

```tsx
export const TokenTransactionViewer: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getTokenTransactions } = useToken();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data } = await getTokenTransactions();
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Transaction History</CardTitle>
        <CardDescription>
          View your token transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.transaction_type}</TableCell>
                  <TableCell>{tx.token.symbol}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.fee || 0}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

## Best Practices

### 1. Logging Sensitive Information

- Never log sensitive personal information (passwords, credit card numbers, etc.)
- Mask or hash sensitive data when it must be included in logs
- Be mindful of privacy regulations (GDPR, CCPA, etc.) when logging user data

### 2. Log Retention

- Implement a log retention policy based on regulatory requirements
- Automatically archive or delete old logs based on the retention policy
- Ensure logs are backed up securely before deletion

### 3. Log Analysis

- Regularly review audit logs for suspicious activity
- Set up alerts for critical security events
- Use log analysis tools to identify patterns and anomalies

### 4. Performance Considerations

- Index frequently queried columns in the audit logs table
- Implement pagination for log retrieval to avoid performance issues
- Consider partitioning the audit logs table if it grows very large

## Security Considerations

### 1. Access Control

- Strictly enforce RLS policies for audit logs
- Only allow administrators to access all logs
- Users should only see logs related to their own accounts

### 2. Tamper Protection

- Consider implementing immutable logging mechanisms
- Use cryptographic techniques to verify log integrity
- Store logs in a separate, secure location

### 3. Monitoring

- Set up monitoring for failed log attempts
- Alert on unusual log access patterns
- Regularly audit the audit system itself

## Compliance

The audit logging system helps meet compliance requirements for various regulations:

- **SOC 2**: Provides evidence of access controls and change management
- **GDPR**: Helps track data access and processing activities
- **HIPAA**: Supports audit controls requirement for healthcare applications
- **PCI DSS**: Assists with tracking access to cardholder data environments

## Future Enhancements

1. **Real-time Alerting**: Implement real-time alerts for critical security events
2. **Advanced Analytics**: Add machine learning for anomaly detection in audit logs
3. **Log Visualization**: Create dashboards for visualizing audit log trends
4. **Federated Logging**: Integrate with external SIEM systems
5. **Enhanced Filtering**: Add more advanced filtering and search capabilities

## Conclusion

The RBAC audit logging system provides a comprehensive solution for tracking security-critical actions in the Avolve platform. By following the best practices outlined in this document, you can ensure that your audit logs are secure, compliant, and useful for security monitoring and forensic analysis.
