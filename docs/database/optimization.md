# Database Optimization Guide

This guide provides best practices for optimizing the Avolve database for performance, scalability, and maintainability as the platform grows from the first 100 to 1000+ users.

**Last Updated:** April 23, 2025

## Table of Contents

1. [Indexing Strategies](#indexing-strategies)
2. [Query Optimization](#query-optimization)
3. [Realtime Performance](#realtime-performance)
4. [Row Level Security Optimization](#row-level-security-optimization)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Scaling Strategies](#scaling-strategies)

## Indexing Strategies

Proper indexing is crucial for database performance, especially as data volumes grow. The Avolve platform has several key tables that benefit from strategic indexing.

### Current Indexes

The following indexes are already implemented in the database migrations:

| Table              | Index                                                                 | Purpose                             |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| `profiles`         | `idx_profiles_is_admin`                                               | Optimize admin user queries         |
| `metrics`          | `idx_metrics_event`, `idx_metrics_timestamp`, `idx_metrics_user_id`   | Optimize analytics queries          |
| `tokens`           | `idx_tokens_user_id_token_type`                                       | Optimize token balance calculations |
| `peer_recognition` | `idx_peer_recognition_sender_id`, `idx_peer_recognition_recipient_id` | Optimize recognition queries        |

### When to Add New Indexes

Consider adding indexes when:

- Queries consistently take longer than 100ms
- `EXPLAIN ANALYZE` shows sequential scans on large tables
- Specific columns are frequently used in `WHERE`, `JOIN`, or `ORDER BY` clauses

### Index Creation Template

```sql
-- Add index to optimize specific query pattern
create index if not exists idx_table_column
  on public.table_name(column_name);

-- For composite indexes
create index if not exists idx_table_columns
  on public.table_name(column1, column2);

-- For expression indexes
create index if not exists idx_table_expression
  on public.table_name(lower(column_name));
```

### Index Maintenance

Regularly analyze index usage to identify unused or redundant indexes:

```sql
-- Find unused indexes
select
  schemaname || '.' || relname as table,
  indexrelname as index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size,
  idx_scan as index_scans
from pg_stat_user_indexes ui
join pg_index i on ui.indexrelid = i.indexrelid
where idx_scan = 0 and pg_relation_size(relid) > 5 * 8192
order by pg_relation_size(i.indexrelid) / nullif(idx_scan, 0) desc nulls first,
         pg_relation_size(i.indexrelid) desc;
```

## Query Optimization

### Common Query Patterns

Optimize these common query patterns in the Avolve platform:

#### Token Balance Calculation

Use the `get_user_token_balances` function instead of direct aggregation:

```sql
-- Optimized approach
select * from get_user_token_balances(user_id);

-- Instead of
select token_type, sum(amount) as balance
from tokens
where user_id = :user_id
group by token_type;
```

#### Recognition Feed Queries

Limit results and use appropriate indexes:

```sql
-- Optimized approach
select pr.*,
       p_sender.full_name as sender_name,
       p_recipient.full_name as recipient_name
from peer_recognition pr
join profiles p_sender on pr.sender_id = p_sender.id
join profiles p_recipient on pr.recipient_id = p_recipient.id
order by pr.created_at desc
limit 20;
```

### Query Optimization Tips

1. **Use Specific Columns**: Select only needed columns instead of `SELECT *`
2. **Limit Results**: Always include `LIMIT` clauses for feed-style queries
3. **Use JOINs Wisely**: Prefer JOINs over subqueries when appropriate
4. **Pagination**: Implement keyset pagination for large result sets
5. **Materialized Views**: Consider for complex, frequently-accessed analytics

## Realtime Performance

Supabase Realtime is used for the recognition feed and other real-time features. Optimize its performance:

### Broadcast Configuration

Current broadcast configuration:

```sql
-- Enable realtime for peer_recognition
alter publication supabase_realtime add table peer_recognition;

-- Enable realtime for recognition_reactions
alter publication supabase_realtime add table recognition_reactions;
```

### Optimization Tips

1. **Selective Broadcasting**: Only broadcast essential columns
2. **Client-Side Filtering**: Use channel filters to reduce payload size
3. **Throttle Updates**: Implement debouncing for high-frequency updates
4. **Monitor Realtime Usage**: Watch for excessive connections or broadcasts

## Row Level Security Optimization

RLS policies can impact performance. Optimize them for efficiency:

### Current RLS Policies

The platform uses these RLS policy patterns:

```sql
-- Example of optimized RLS policy
create policy "Users can view public recognitions"
  on peer_recognition
  for select
  using (true);  -- Simple condition for public data

-- Example of user-specific policy with index
create policy "Users can view their own metrics"
  on metrics
  for select
  using (auth.uid() = user_id);  -- Uses indexed column
```

### Optimization Tips

1. **Simplify Conditions**: Use the simplest possible RLS conditions
2. **Index RLS Columns**: Ensure columns used in RLS policies are indexed
3. **Avoid Subqueries**: Prefer direct conditions over subqueries in RLS
4. **Separate Policies**: Create separate policies for different operations
5. **Test Performance**: Use `EXPLAIN ANALYZE` with RLS enabled

## Monitoring and Maintenance

### Key Metrics to Monitor

Monitor these database metrics regularly:

1. **Query Performance**: Track slow queries (>100ms)
2. **Index Usage**: Monitor index hit rates
3. **Table Growth**: Track table sizes over time
4. **Connection Pool**: Monitor connection usage
5. **Cache Hit Ratio**: Track query cache effectiveness

### Maintenance Tasks

Schedule these maintenance tasks:

| Task                  | Frequency | Purpose                                 |
| --------------------- | --------- | --------------------------------------- |
| `VACUUM ANALYZE`      | Weekly    | Reclaim space and update statistics     |
| Index rebuilding      | Monthly   | Optimize fragmented indexes             |
| Query plan analysis   | Bi-weekly | Identify optimization opportunities     |
| Database health check | Daily     | Run `generate_database_health_report()` |

## Scaling Strategies

As Avolve grows beyond 1000 users, consider these scaling strategies:

### Vertical Scaling

1. **Upgrade Supabase Plan**: Move to a higher tier as needed
2. **Increase Resources**: Add more CPU/RAM to the database instance
3. **Optimize Settings**: Tune PostgreSQL configuration parameters

### Horizontal Scaling

1. **Read Replicas**: Add read replicas for analytics queries
2. **Sharding**: Consider data sharding for very large datasets
3. **Caching Layer**: Implement Redis or similar for frequent queries

### Data Archiving

For long-term scalability, implement data archiving:

```sql
-- Example archiving function for old metrics
create or replace function archive_old_metrics(days_old int)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count int;
begin
  -- Move old metrics to archive table
  with old_metrics as (
    delete from public.metrics
    where created_at < now() - (days_old || ' days')::interval
    returning *
  )
  insert into public.archived_metrics
  select * from old_metrics;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
```

---

## Additional Resources

- [PostgreSQL Performance Optimization](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Performance Best Practices](https://supabase.com/docs/guides/database/postgres/performance)
- [Database Schema Documentation](./README.md)
- [SQL Best Practices](./sql-best-practices.md)
