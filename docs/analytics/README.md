# Avolve Analytics Guide

This guide provides an overview of the analytics capabilities in the Avolve platform, helping administrators track user engagement, monitor platform performance, and make data-driven decisions.

**Last Updated:** April 23, 2025

## Table of Contents

1. [Analytics Overview](#analytics-overview)
2. [Key Metrics](#key-metrics)
3. [Analytics Dashboard](#analytics-dashboard)
4. [Metrics Collection](#metrics-collection)
5. [Custom Reports](#custom-reports)
6. [Privacy Considerations](#privacy-considerations)

## Analytics Overview

Avolve's analytics system is designed to provide meaningful insights while respecting user privacy. The system tracks:

- User engagement metrics
- Recognition patterns
- Token economy health
- Platform performance
- Onboarding effectiveness

All analytics data is stored in the `metrics` table and can be accessed through the admin dashboard or custom SQL queries.

## Key Metrics

### User Engagement

| Metric                    | Description                                     | SQL Query Example                                                                                                                         |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Daily Active Users (DAU)  | Count of unique users active in a day           | `SELECT COUNT(DISTINCT user_id) FROM metrics WHERE event = 'user_active' AND timestamp::date = CURRENT_DATE;`                             |
| Weekly Active Users (WAU) | Count of unique users active in the past 7 days | `SELECT COUNT(DISTINCT user_id) FROM metrics WHERE event = 'user_active' AND timestamp > CURRENT_DATE - INTERVAL '7 days';`               |
| Session Duration          | Average time users spend on the platform        | `SELECT AVG((metadata->>'duration')::float) FROM metrics WHERE event = 'session_ended' AND timestamp > CURRENT_DATE - INTERVAL '7 days';` |
| Retention Rate            | Percentage of users who return after N days     | Complex query - see [Retention Analysis](#retention-analysis)                                                                             |

### Recognition System

| Metric              | Description                                    | SQL Query Example                                                                                                                |
| ------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Recognitions Sent   | Total number of recognitions sent              | `SELECT COUNT(*) FROM peer_recognition WHERE created_at > CURRENT_DATE - INTERVAL '30 days';`                                    |
| Recognition Rate    | Average recognitions sent per active user      | `SELECT COUNT(*)::float / COUNT(DISTINCT sender_id) FROM peer_recognition WHERE created_at > CURRENT_DATE - INTERVAL '30 days';` |
| Recognition Network | Graph of recognition connections between users | Complex query - see [Network Analysis](#network-analysis)                                                                        |
| Most Active Senders | Users who send the most recognitions           | `SELECT sender_id, COUNT(*) FROM peer_recognition GROUP BY sender_id ORDER BY COUNT(*) DESC LIMIT 10;`                           |

### Token Economy

| Metric              | Description                                     | SQL Query Example                                                                |
| ------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| Token Distribution  | Distribution of tokens by type                  | `SELECT token_type, SUM(amount) FROM tokens GROUP BY token_type;`                |
| Token Velocity      | Rate at which tokens are being earned and spent | Complex query - see [Token Analysis](#token-analysis)                            |
| Token Concentration | Gini coefficient of token distribution          | Complex query - requires statistical functions                                   |
| Token Utility       | How tokens are being used across the platform   | `SELECT event, COUNT(*) FROM metrics WHERE event LIKE 'token_%' GROUP BY event;` |

### Platform Performance

| Metric               | Description                                | SQL Query Example                                                                                                                                                          |
| -------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API Response Time    | Average response time for API endpoints    | `SELECT AVG((metadata->>'duration')::float) FROM metrics WHERE event = 'api_request' AND timestamp > CURRENT_DATE - INTERVAL '1 day';`                                     |
| Error Rate           | Percentage of requests resulting in errors | `SELECT COUNT(*) FILTER (WHERE metadata->>'status' = 'error')::float / COUNT(*) FROM metrics WHERE event = 'api_request' AND timestamp > CURRENT_DATE - INTERVAL '1 day';` |
| Database Performance | Query execution times and resource usage   | `SELECT * FROM generate_database_health_report(24);`                                                                                                                       |

## Analytics Dashboard

The admin dashboard provides a visual interface for key metrics. Access it at `/admin` (requires admin privileges).

### Dashboard Sections

1. **Overview**: Summary of key metrics and trends
2. **User Engagement**: Detailed user activity metrics
3. **Recognition**: Recognition patterns and network visualization
4. **Token Economy**: Token distribution and flow analysis
5. **Performance**: Platform performance metrics
6. **Custom Reports**: User-defined reports and queries

### Dashboard Features

- **Date Range Selection**: Filter data by custom date ranges
- **Data Export**: Export data as CSV or JSON
- **Visualization Options**: Various chart types (line, bar, pie, network)
- **Real-time Updates**: Some metrics update in real-time
- **Alerts**: Set up alerts for anomalies or threshold crossings

## Metrics Collection

Avolve uses a structured approach to metrics collection:

### Metrics Table Schema

```sql
create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  user_id uuid references auth.users(id) on delete set null,
  timestamp timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### Common Event Types

| Event Type         | Description              | Example Metadata                                                               |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------ |
| `user_active`      | User performed an action | `{"page": "dashboard", "action": "view"}`                                      |
| `recognition_sent` | User sent a recognition  | `{"recipient_id": "uuid", "badge": "helper"}`                                  |
| `token_earned`     | User earned tokens       | `{"token_type": "SAP", "amount": 5, "source": "daily_challenge"}`              |
| `token_spent`      | User spent tokens        | `{"token_type": "SAP", "amount": 10, "target": "boost"}`                       |
| `api_request`      | API endpoint was called  | `{"endpoint": "/api/user/profiles", "duration": 45, "status": "success"}`      |
| `error`            | An error occurred        | `{"type": "api_error", "message": "Failed to fetch profiles", "stack": "..."}` |

### Logging Events

Use the following pattern to log events:

```typescript
// Client-side event logging
const logEvent = async (event: string, metadata: any = {}) => {
  try {
    await supabase.from('metrics').insert({
      event,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};

// Example usage
logEvent('feature_used', { feature: 'recognition_feed', action: 'filter' });
```

```typescript
// Server-side event logging (API route)
await supabase.from('metrics').insert({
  event: 'admin_action',
  user_id: user.id,
  metadata: { action: 'user_updated', target_id: userId },
});
```

## Custom Reports

Administrators can create custom reports using SQL queries:

### Retention Analysis

```sql
-- 7-day retention analysis
WITH new_users AS (
  SELECT
    id,
    created_at::date as join_date
  FROM profiles
  WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
),
active_days AS (
  SELECT
    user_id,
    timestamp::date as active_date
  FROM metrics
  WHERE event = 'user_active'
  AND timestamp > CURRENT_DATE - INTERVAL '37 days'
  GROUP BY user_id, timestamp::date
)
SELECT
  join_date,
  COUNT(DISTINCT new_users.id) as new_users,
  COUNT(DISTINCT CASE WHEN active_date = join_date + INTERVAL '7 days'
                      THEN new_users.id END) as retained_users,
  COUNT(DISTINCT CASE WHEN active_date = join_date + INTERVAL '7 days'
                      THEN new_users.id END)::float /
    COUNT(DISTINCT new_users.id) as retention_rate
FROM new_users
LEFT JOIN active_days ON new_users.id = active_days.user_id
GROUP BY join_date
ORDER BY join_date DESC;
```

### Network Analysis

```sql
-- Recognition network analysis
WITH recognition_counts AS (
  SELECT
    sender_id,
    recipient_id,
    COUNT(*) as recognition_count
  FROM peer_recognition
  WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
  GROUP BY sender_id, recipient_id
),
user_info AS (
  SELECT
    id,
    full_name
  FROM profiles
)
SELECT
  s.full_name as sender_name,
  r.full_name as recipient_name,
  rc.recognition_count
FROM recognition_counts rc
JOIN user_info s ON rc.sender_id = s.id
JOIN user_info r ON rc.recipient_id = r.id
ORDER BY rc.recognition_count DESC;
```

### Token Analysis

```sql
-- Token velocity analysis
WITH token_events AS (
  SELECT
    date_trunc('day', timestamp) as day,
    metadata->>'token_type' as token_type,
    SUM(CASE WHEN event = 'token_earned' THEN (metadata->>'amount')::numeric ELSE 0 END) as earned,
    SUM(CASE WHEN event = 'token_spent' THEN (metadata->>'amount')::numeric ELSE 0 END) as spent
  FROM metrics
  WHERE (event = 'token_earned' OR event = 'token_spent')
  AND timestamp > CURRENT_DATE - INTERVAL '30 days'
  GROUP BY day, token_type
)
SELECT
  day,
  token_type,
  earned,
  spent,
  earned + spent as velocity
FROM token_events
ORDER BY day DESC, token_type;
```

## Privacy Considerations

When working with analytics data, always consider these privacy principles:

1. **Data Minimization**: Only collect what's necessary
2. **Anonymization**: Remove PII when possible
3. **Aggregation**: Prefer aggregated metrics over individual data
4. **Retention Limits**: Implement data retention policies
5. **Access Control**: Limit access to sensitive analytics

### Example: Anonymized Reports

```sql
-- Anonymized user engagement report
SELECT
  date_trunc('day', timestamp) as day,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_actions,
  COUNT(*) / COUNT(DISTINCT user_id) as actions_per_user
FROM metrics
WHERE event = 'user_active'
AND timestamp > CURRENT_DATE - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Additional Resources

- [Database Optimization Guide](../database/optimization.md)
- [Security Documentation](../security/README.md)
- [PostgreSQL Analytics Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization-tips)
