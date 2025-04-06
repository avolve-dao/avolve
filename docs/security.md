# 🔐 Avolve Security Documentation

> *"Security is not a product, but a process."* — Bruce Schneier

Welcome to the Avolve security fortress! This document outlines the robust security features, architecture, and best practices implemented in the Avolve platform to protect user data and ensure secure access to the system.

## 📋 Table of Contents

- [🔑 Authentication System](#authentication-system)
  - [🔄 Authentication Flow](#authentication-flow)
  - [🔒 Password Security](#password-security)
  - [🛡️ Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
  - [💾 Recovery Codes](#recovery-codes)
  - [📱 Session Management](#session-management)
- [💽 Database Security](#database-security)
  - [🚧 Row Level Security (RLS)](#row-level-security-rls)
  - [🔏 Data Encryption](#data-encryption)
- [🌐 API Security](#api-security)
  - [🛑 CSRF Protection](#csrf-protection)
  - [⏱️ Rate Limiting](#rate-limiting)
- [👥 Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [✅ Security Best Practices](#security-best-practices)
- [💉 SQL Injection Prevention](#sql-injection-prevention)
- [📊 Security Monitoring and Incident Response](#security-monitoring-and-incident-response)

## 🔑 Authentication System

The Avolve platform uses Supabase Authentication as its identity provider, enhanced with custom functionality for multi-factor authentication, session management, and security monitoring.

### 🔄 Authentication Flow

The authentication flow follows these steps:

1. **Initial Authentication** 🚪 — Users authenticate with email/password or magic link
2. **MFA Verification** 📲 — If enabled, users provide a second factor via TOTP code
3. **Session Creation** 🎫 — Upon successful authentication, a secure session is created
4. **Session Monitoring** 👁️ — Active sessions are tracked and can be managed by users

> **Pro Tip:** The authentication service is implemented as a singleton to ensure consistent authentication state across the application.

```typescript
// Example authentication flow
const { signIn, verifyTotpFactor } = useAuth();

// Step 1: Initial authentication
const { data, error } = await signIn(email, password);

// Step 2: MFA verification (if required)
if (data.mfaRequired) {
  const { data: mfaResult } = await verifyTotpFactor(factorId, code);
}
```

### 🔒 Password Security

Passwords are handled with the following security measures:

- **Minimum Requirements** 📏
  - At least 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Secure Storage** 🗄️ — Passwords are hashed using bcrypt with a work factor of 10
- **Password Reset** 🔄 — Secure password reset via email with time-limited tokens

### 🛡️ Multi-Factor Authentication (MFA)

The platform supports Time-based One-Time Password (TOTP) as a second authentication factor:

- **Setup Process** 🛠️
  1. User initiates MFA setup from security settings
  2. System generates a secret key and QR code
  3. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
  4. User verifies setup by entering a valid code

- **Verification Process** ✅
  1. After password authentication, user is prompted for MFA code
  2. User enters 6-digit code from authenticator app
  3. System verifies code against the stored secret

- **Implementation Details** 🧩
  - TOTP follows the RFC 6238 standard
  - 30-second time window for code validity
  - Secure storage of TOTP secrets in the database

```sql
-- Database schema for MFA factors
create table public.user_mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  factor_type text not null check (factor_type in ('totp', 'sms', 'recovery')),
  factor_id text not null,
  friendly_name text,
  secret text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (user_id, factor_type, factor_id)
);
```

### 💾 Recovery Codes

To prevent lockout scenarios, the system provides recovery codes when MFA is enabled:

- **Generation** 🎲 — 10 single-use recovery codes are generated when MFA is set up
- **Storage** 🔐 — Codes are hashed and stored securely in the database
- **Usage** 🔑 — Each code can be used once to bypass MFA if the user loses access to their authenticator device
- **Regeneration** 🔄 — Users can generate new recovery codes, which invalidates all existing codes

```sql
-- Database schema for recovery codes
create table public.user_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_recovery_codes enable row level security;

-- RLS policy
create policy "Users can only view their own recovery codes"
  on public.user_recovery_codes
  for select
  to authenticated
  using (auth.uid() = user_id);
```

### 📱 Session Management

The platform implements robust session management:

- **Session Tracking** 📊 — All active sessions are tracked with device and location information
- **Session Control** 🎮 — Users can view and terminate active sessions from their account settings
- **Automatic Session Expiration** ⏰ — Sessions expire after 7 days of inactivity
- **Suspicious Activity Detection** 🕵️ — Unusual login patterns trigger additional verification

```sql
-- Database schema for session tracking
create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null unique,
  user_agent text,
  ip_address inet,
  device_info jsonb,
  last_active_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_sessions enable row level security;

-- RLS policies
create policy "Users can view their own sessions"
  on public.user_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.user_sessions
  for delete
  to authenticated
  with check (auth.uid() = user_id);
```

## 💽 Database Security

### 🚧 Row Level Security (RLS)

Supabase PostgreSQL's Row Level Security (RLS) is used to enforce access control at the database level:

- **Table-Level Policies** 📑 — Each table has specific RLS policies defining who can access what data
- **User Context** 👤 — Policies use the authenticated user's ID and roles to determine access
- **Fine-Grained Control** 🔍 — Different policies for SELECT, INSERT, UPDATE, and DELETE operations

```sql
-- Example RLS policy for user profiles
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  with check (auth.uid() = id);
```

### 🔏 Data Encryption

Sensitive data is encrypted to provide additional protection:

- **At Rest** 💤 — Database encryption for sensitive fields
- **In Transit** 🚀 — All API communications use HTTPS/TLS
- **Sensitive Fields** 🔒 — MFA secrets and other sensitive data use additional encryption

## 🌐 API Security

### 🛑 CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented for all state-changing operations:

- **CSRF Tokens** 🎟️ — Unique tokens are generated for forms and API requests
- **Double Submit Cookie** 🍪 — Tokens are validated against a secure, same-site cookie
- **SameSite Cookies** 🔒 — Cookies are set with SameSite=Lax to prevent CSRF attacks

### ⏱️ Rate Limiting

Rate limiting is implemented to prevent abuse and brute force attacks:

- **Login Attempts** 🔑 — Limited to 5 attempts per email address in a 15-minute window
- **API Requests** 📡 — Limited based on IP address and authenticated user
- **Progressive Delays** ⏳ — Increasing delays after failed attempts

```sql
-- Function to check if login attempts should be rate limited
create or replace function public.check_rate_limit(
  p_email text,
  p_ip_address inet
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_email_attempts integer;
  v_ip_attempts integer;
  v_rate_limit_window interval := interval '15 minutes';
  v_max_email_attempts integer := 5;
  v_max_ip_attempts integer := 10;
begin
  -- Count failed attempts by email within the time window
  select count(*) into v_email_attempts
  from public.login_attempts
  where email = p_email
    and created_at > now() - v_rate_limit_window
    and success = false;
  
  -- Count failed attempts by IP within the time window
  select count(*) into v_ip_attempts
  from public.login_attempts
  where ip_address = p_ip_address
    and created_at > now() - v_rate_limit_window
    and success = false;
  
  -- Rate limit if either email or IP has too many failed attempts
  return v_email_attempts >= v_max_email_attempts or v_ip_attempts >= v_max_ip_attempts;
end;
$$;
```

## 👥 Role-Based Access Control (RBAC)

The Avolve platform implements a comprehensive Role-Based Access Control (RBAC) system:

1. **Roles** 👑 — Predefined sets of permissions that can be assigned to users. The system includes default roles such as:
   - `admin`: Full system access
   - `user`: Standard user access
   - `moderator`: User with moderation capabilities

2. **Permissions** 🔑 — Granular access controls defined as resource-action pairs (e.g., `users:view`, `content:edit`). Permissions are assigned to roles, and users inherit permissions through their assigned roles.

3. **RBAC Database Schema** 📊

```sql
-- Roles table
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Permissions table
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  created_at timestamp with time zone default now(),
  unique (resource, action)
);

-- Role-Permission mapping
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (role_id, permission_id)
);

-- User-Role mapping
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, role_id)
);
```

#### Client-Side Components

For UI-level access control, use the `Authorized` component:

```tsx
// Only show to users with the "admin" role
<Authorized requiredRoles="admin">
  <AdminPanel />
</Authorized>

// Only show to users who can edit content
<Authorized requiredPermissions="content:edit">
  <EditButton />
</Authorized>
```

#### Programmatic Access Control

For programmatic access control in React components, use the `useRBAC` hook:

```tsx
const { hasRole, hasPermission, can } = useRBAC();

// Check if user has a specific role
if (hasRole('admin')) {
  // Show admin features
}

// Check if user has a specific permission
if (hasPermission('content:edit')) {
  // Show edit button
}

// Check if user can perform an action on a resource
if (can('edit', 'content')) {
  // Show edit button
}
```

For route-level protection, use the `ProtectedPage` component:

```tsx
// Only allow users with the "admin" role to access the page
export default function AdminPage() {
  return (
    <ProtectedPage requiredRoles="admin">
      <AdminDashboard />
    </ProtectedPage>
  );
}

// Only allow users who can edit content to access the page
export default function EditPage() {
  return (
    <ProtectedPage requiredPermissions="content:edit">
      <Editor />
    </ProtectedPage>
  );
}
```

For a more reusable approach, use the `withAuthorization` HOC:

```tsx
// Only allow users with the "admin" role to access the component
const ProtectedAdminPanel = withAuthorization(AdminPanel, { 
  requiredRoles: "admin" 
});

// Only allow users who can edit content to access the component
const ProtectedEditor = withAuthorization(Editor, { 
  requiredPermissions: "content:edit" 
});

// Only allow users with admin OR moderator role to access the component
const ProtectedModeration = withAuthorization(ModerationPanel, { 
  requiredRoles: ["admin", "moderator"] 
});
```

#### Admin Interface

The platform includes an admin interface for managing roles and permissions:

```tsx
<RoleManager />
```

This component provides a user interface to:

- Create, edit, and delete roles
- Assign permissions to roles
- Assign roles to users
- View users with specific roles

### 📝 Audit Logging

The RBAC system includes comprehensive audit logging to track all changes to roles and permissions. This provides a complete history of who made what changes and when, which is essential for security monitoring and compliance.

#### Audit Log Features

1. **Comprehensive Logging**: All RBAC actions are logged, including:
   - Role creation, modification, and deletion
   - Permission assignment and removal
   - User role assignment and removal

2. **Detailed Context**: Each log entry includes:
   - Who performed the action (user ID)
   - What action was performed (e.g., assign_role, remove_permission)
   - When the action was performed (timestamp)
   - Additional context (e.g., role name, permission details)

3. **Filtering and Search**: Logs can be filtered by:
   - Action type
   - Entity type
   - Date range
   - User ID

4. **Programmatic Access**: The `AuditService` provides methods for retrieving and analyzing audit logs:

```typescript
// Get all audit logs (admin only)
const logs = await auditService.getAllAuditLogs({
  limit: 100,
  offset: 0
});

// Get audit logs for a specific user
const userLogs = await auditService.getUserAuditLogs(userId);

// Get audit logs for a specific action type
const actionLogs = await auditService.getAuditLogsByAction({
  actionType: 'assign_role',
  fromDate: new Date('2025-01-01'),
  toDate: new Date()
});

// Log a custom action
await auditService.logAction(
  'custom_action',
  'custom_entity',
  entityId,
  targetId,
  { additionalInfo: 'Custom details' }
);
```

5. **Security** 🔒 — Access to audit logs is controlled by RLS policies:
   - Administrators can view all audit logs
   - Regular users can only view audit logs related to their own account

#### Best Practices for Audit Logging

1. **Log All Security-Critical Actions** 📝 — Ensure all actions that affect security, such as role assignments and permission changes, are logged.

2. **Include Contextual Information** 🔍 — Log enough details to understand what happened, including the who, what, when, and why of each action.

3. **Regular Review** 👁️ — Periodically review audit logs to detect unusual patterns or unauthorized changes.

4. **Retention Policy** ⏱️ — Implement a retention policy for audit logs based on your organization's compliance requirements.

5. **Export Capability** 📤 — Provide a way to export audit logs for offline analysis or long-term storage.

## ✅ Security Best Practices

The Avolve platform follows these security best practices:

1. **Defense in Depth** 🏰 — Multiple layers of security controls
2. **Principle of Least Privilege** 🔑 — Users and processes have minimal necessary access
3. **Secure by Default** 🛡️ — Security features are enabled by default
4. **Regular Security Updates** 🔄 — Dependencies are kept up-to-date
5. **Code Security Reviews** 👁️ — Regular code reviews with security focus
6. **Input Validation** ✅ — All user inputs are validated and sanitized
7. **Output Encoding** 📝 — Data is properly encoded when displayed
8. **Error Handling** ⚠️ — Secure error handling that doesn't leak sensitive information
9. **Logging and Monitoring** 📊 — Security events are logged for monitoring
10. **Security Testing** 🧪 — Regular security testing and vulnerability scanning
11. **SQL Injection Prevention** 💉 — All database functions use parameterized queries and avoid dynamic SQL execution

### 💉 SQL Injection Prevention

To prevent SQL injection attacks, the platform follows these practices:

1. **Parameterized Queries** 📋 — All database functions use parameterized queries instead of string concatenation
2. **SECURITY INVOKER** 👤 — Database functions use `SECURITY INVOKER` by default to run with the permissions of the calling user
3. **Restricted Search Path** 🛣️ — All functions set `search_path = ''` to prevent schema hijacking
4. **Safe Migration Helpers** 🔧 — For database migrations, safe helper functions are used instead of direct SQL execution:
   - `safe_add_column`: Safely adds a column to a table
   - `safe_create_index`: Safely creates an index on a table

> ⚠️ **Warning:** The platform previously contained a `exec_sql` function that was identified as a security vulnerability due to its use of `SECURITY DEFINER` and direct execution of arbitrary SQL. This function has been removed and replaced with safer alternatives.

```sql
-- DO NOT USE: This function has been removed due to security concerns
-- create or replace function public.exec_sql(sql text)
-- returns void
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $$
-- begin
--   execute sql;
-- end;
-- $$;
```

## 📊 Security Monitoring and Incident Response

The platform includes security monitoring and incident response capabilities:

- **Login Monitoring** 👁️ — Unusual login patterns are detected and flagged
- **Activity Logging** 📝 — Security-relevant activities are logged
- **Alerting** 🚨 — Automated alerts for suspicious activities
- **Incident Response Plan** 📋 — Documented procedures for security incidents
- **User Notifications** 📱 — Users are notified of security events related to their account

## 🧩 Implementation Details

The security features are implemented across several components:

1. **AuthService** 🔑 — Core authentication service with MFA and session management
2. **Database Functions** 💾 — Secure PostgreSQL functions for authentication operations
3. **React Components** 🧩 — User interface for security settings and MFA setup
4. **Middleware** 🔄 — Request processing middleware for security checks
5. **API Endpoints** 🌐 — Secure API endpoints for authentication operations

For more details on specific implementations, refer to the codebase and associated documentation.
