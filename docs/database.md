# 🗃️ Database Schema Documentation

> *"Data is the new oil. It's valuable, but if unrefined it cannot really be used."* — Clive Humby

Welcome to the Avolve database documentation! This guide provides detailed information about the database schema that powers our platform.

## 🔍 Overview

Avolve uses Supabase PostgreSQL as its database, with a schema designed for security, performance, and scalability. The database implements Row Level Security (RLS) policies to ensure data access is properly controlled.

## 📊 Tables

### 1️⃣ profiles

Stores user profile information linked to Supabase Auth users.

#### Schema

```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  last_active_at timestamp with time zone,
  status text default 'active'::text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better performance
create index profiles_username_idx on public.profiles (username);
create index profiles_status_idx on public.profiles (status);
create index profiles_last_active_idx on public.profiles (last_active_at);
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key, references auth.users | Primary Key, Foreign Key |
| username | text | Unique username for the user | Unique |
| full_name | text | User's full name | |
| avatar_url | text | URL to the user's avatar image | |
| website | text | User's website URL | |
| bio | text | User's biography or description | |
| last_active_at | timestamp with time zone | When the user was last active | |
| status | text | User status (active, inactive, suspended) | Default: 'active' |
| metadata | jsonb | Additional user metadata | Default: '{}' |
| created_at | timestamp with time zone | When the profile was created | Default: now() |
| updated_at | timestamp with time zone | When the profile was last updated | Default: now() |

### 2️⃣ auth.users (Supabase System Table)

This is a Supabase system table that stores user authentication information.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User's email address |
| encrypted_password | text | Encrypted password |
| email_confirmed_at | timestamp with time zone | When the email was confirmed |
| last_sign_in_at | timestamp with time zone | Last sign-in timestamp |
| raw_user_meta_data | jsonb | Additional user metadata |

#### Triggers

```sql
-- Trigger to create a profile when a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3️⃣ user_settings

Stores user preferences and settings.

#### Schema

```sql
create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme text default 'light',
  preferences jsonb default '{}',
  notification_preferences jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint user_settings_user_id_key unique (user_id)
);

-- Enable RLS
alter table public.user_settings enable row level security;
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| user_id | uuid | References auth.users | Foreign Key, Unique |
| theme | text | User's preferred theme | Default: 'light' |
| preferences | jsonb | General user preferences | Default: '{}' |
| notification_preferences | jsonb | Notification settings | Default: '{}' |
| created_at | timestamp with time zone | When the settings were created | Default: now() |
| updated_at | timestamp with time zone | When the settings were last updated | Default: now() |

### 4️⃣ notifications

Stores user notifications for in-app messaging.

#### Schema

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  read_at timestamp with time zone,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_is_read_idx on public.notifications (is_read);
create index notifications_created_at_idx on public.notifications (created_at);

-- Enable RLS
alter table public.notifications enable row level security;
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| user_id | uuid | References auth.users | Foreign Key |
| type | text | Notification type | Not Null |
| title | text | Notification title | Not Null |
| message | text | Notification message | Not Null |
| link | text | Optional link to navigate to | |
| is_read | boolean | Whether the notification has been read | Default: false |
| created_at | timestamp with time zone | When the notification was created | Default: now() |
| read_at | timestamp with time zone | When the notification was read | |
| metadata | jsonb | Additional notification metadata | Default: '{}' |

### 5️⃣ audit_logs

Stores audit logs for tracking important system activities.

#### Schema

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_created_at_idx on public.audit_logs (created_at);

-- Enable RLS
alter table public.audit_logs enable row level security;
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| user_id | uuid | References auth.users | Foreign Key |
| action | text | The action that was performed | Not Null |
| entity_type | text | The type of entity that was affected | Not Null |
| entity_id | text | The ID of the entity that was affected | |
| created_at | timestamp with time zone | When the action was performed | Default: now() |

### 6️⃣ tokens

Stores token types for the platform's token economy.

#### Schema

```sql
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  symbol text not null unique,
  description text,
  is_active boolean default true,
  is_transferable boolean default true,
  transfer_fee numeric default 0,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better performance
create index tokens_symbol_idx on public.tokens (symbol);
create index tokens_is_active_idx on public.tokens (is_active);
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| name | text | Token name | Not Null |
| symbol | text | Token symbol | Not Null, Unique |
| description | text | Token description | |
| is_active | boolean | Whether the token is active | Default: true |
| is_transferable | boolean | Whether the token can be transferred between users | Default: true |
| transfer_fee | numeric | Fee percentage applied to transfers (0-1) | Default: 0 |
| metadata | jsonb | Additional token metadata | Default: '{}' |
| created_at | timestamp with time zone | When the token was created | Default: now() |
| updated_at | timestamp with time zone | When the token was last updated | Default: now() |

### 7️⃣ user_tokens

Stores token balances for users.

#### Schema

```sql
create table public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric default 0,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint user_tokens_user_token_key unique (user_id, token_id)
);

-- Indexes for better performance
create index user_tokens_user_id_idx on public.user_tokens (user_id);
create index user_tokens_token_id_idx on public.user_tokens (token_id);
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| user_id | uuid | User ID | Foreign Key, Not Null |
| token_id | uuid | Token ID | Foreign Key, Not Null |
| balance | numeric | Token balance | Default: 0 |
| last_updated | timestamp with time zone | When the balance was last updated | Default: now() |
| created_at | timestamp with time zone | When the record was created | Default: now() |
| updated_at | timestamp with time zone | When the record was last updated | Default: now() |

### 8️⃣ token_transactions

Stores token transaction history.

#### Schema

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

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | Primary Key |
| from_user_id | uuid | Sender user ID | Foreign Key |
| to_user_id | uuid | Recipient user ID | Foreign Key |
| token_id | uuid | Token ID | Foreign Key, Not Null |
| amount | numeric | Transaction amount | Not Null |
| fee | numeric | Transaction fee | Default: 0 |
| transaction_type | text | Type of transaction (transfer, reward, stake, etc.) | Not Null |
| status | text | Transaction status (completed, pending, failed) | Not Null |
| metadata | jsonb | Additional transaction metadata | Default: '{}' |
| created_at | timestamp with time zone | When the transaction was created | Default: now() |

## 🧩 Functions

### 1️⃣ handle_new_user()

Creates a profile when a new user is created.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    metadata
  ) values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    jsonb_build_object(
      'email', new.email,
      'provider', new.raw_user_meta_data->>'provider'
    )
  );
  
  return new;
end;
$$;
```

> 💡 **Tip:** This function automatically creates a profile when a user signs up, ensuring that all users have a profile entry.

### 2️⃣ get_profile_by_username()

Gets a user profile by username.

```sql
create or replace function public.get_profile_by_username(p_username text)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile
  from public.profiles
  where username = p_username;
  
  return v_profile;
end;
$$;
```

### 3️⃣ update_profile()

Updates a user's profile.

```sql
create or replace function public.update_profile(
  p_user_id uuid,
  p_bio text default null,
  p_status text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.profiles
  set 
    bio = coalesce(p_bio, bio),
    status = coalesce(p_status, status),
    updated_at = now()
  where 
    id = p_user_id;
  
  return found;
end;
$$;
```

### 4️⃣ update_user_last_active()

Updates a user's last active timestamp.

```sql
create or replace function public.update_user_last_active(p_user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.profiles
  set 
    last_active_at = now(),
    updated_at = now()
  where 
    id = p_user_id;
  
  return found;
end;
$$;
```

### 5️⃣ create_notification()

Creates a notification for a user.

```sql
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text default null,
  p_metadata jsonb default '{}'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    metadata
  )
