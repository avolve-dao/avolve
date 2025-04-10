# Avolve Database Best Practices

## Overview

This document outlines the best practices for working with the Avolve database using Supabase. Following these guidelines ensures consistency, security, and performance across the platform, while making the codebase more maintainable for both human developers and AI assistants.

## Database Schema Design

### Naming Conventions

- **Tables**: Use `snake_case` for all table names, in singular form (e.g., `user_profile` not `user_profiles`)
- **Columns**: Use `snake_case` for all column names
- **Primary Keys**: Use `id` as the primary key name
- **Foreign Keys**: Use `{table_name}_id` format (e.g., `user_id` for a reference to the `user` table)
- **Junction Tables**: Name as `{table1}_{table2}` in alphabetical order (e.g., `challenge_user`)
- **Timestamps**: Always include `created_at` and `updated_at` columns

### Data Types

- Use `uuid` for IDs when possible
- Use `timestamptz` (timestamp with time zone) for all date/time fields
- Use `text` for variable-length strings
- Use `jsonb` for structured data that doesn't need its own table
- Use `numeric` for financial values to avoid floating-point errors

### Constraints

- Enforce referential integrity with foreign key constraints
- Use `NOT NULL` for required fields
- Add appropriate check constraints for data validation
- Create unique constraints for fields that must be unique

## Row Level Security (RLS)

All tables must have Row Level Security enabled and appropriate policies defined:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own data"
  ON table_name FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own data"
  ON table_name FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own data"
  ON table_name FOR DELETE
  USING (user_id = auth.uid());
```

## Database Functions

### Security Settings

- Default to `SECURITY INVOKER` for functions
- Always set `search_path = ''` to prevent search path injection
- Use `SECURITY DEFINER` only when absolutely necessary, and document why

### Function Template

```sql
CREATE OR REPLACE FUNCTION public.function_name(
  p_param1 type,
  p_param2 type
)
RETURNS return_type
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_variable type;
BEGIN
  -- Function logic here
  RETURN result;
END;
$$;
```

### Error Handling

- Use explicit error handling with `RAISE EXCEPTION`
- Include informative error messages
- Validate all input parameters

```sql
IF p_amount <= 0 THEN
  RAISE EXCEPTION 'Amount must be greater than zero';
END IF;
```

## Migrations

- Name migration files in the format `YYYYMMDDHHmmss_short_description.sql`
- Include a header comment explaining the purpose of the migration
- Add comments for any complex logic
- Test migrations in development before applying to production
- Include rollback logic when possible

## Performance Optimization

### Indexing

- Create indexes for columns used in WHERE clauses
- Create indexes for foreign key columns
- Use composite indexes for queries that filter on multiple columns
- Consider partial indexes for specific query patterns

### Query Optimization

- Use prepared statements to avoid SQL injection and improve performance
- Limit result sets to what's needed
- Use `EXPLAIN ANALYZE` to identify performance bottlenecks
- Consider materialized views for complex, frequently-accessed data

## Integration with TypeScript

- Generate TypeScript types from the database schema
- Keep types in sync with database changes
- Use strongly typed database client libraries

```typescript
// Example of type-safe database access
const { data, error } = await supabase
  .from<Profile>('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

## Monitoring and Maintenance

- Implement regular database health checks
- Set up alerts for abnormal database metrics
- Schedule regular maintenance tasks (vacuum, analyze)
- Monitor query performance and optimize slow queries

## AI-Friendly Documentation

- Document the purpose of each table and its relationships
- Add comments to complex columns explaining their use
- Document any non-obvious constraints or business rules
- Keep an up-to-date ERD (Entity Relationship Diagram)

## Changelog

| Date | Version | Description |
|------|---------|-------------|
| 2025-04-09 | 1.0.0 | Initial database best practices documentation |
