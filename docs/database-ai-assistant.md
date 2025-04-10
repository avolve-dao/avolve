# Supabase AI Assistant Usage Guide for Avolve Platform (2025)

## Overview

This document outlines how to use the Supabase AI Assistant for database management and optimization in the Avolve platform. The AI Assistant is a powerful tool that helps with schema validation, query optimization, and general database management tasks, supporting the platform's progression from Degen to Regen through the token system and experience phases.

## Getting Started

To access the Supabase AI Assistant, navigate to your Supabase project dashboard and click on the "AI Assistant" tab in the sidebar.

## Advanced Analytics Implementation

### Regen Analytics View

The `regen_analytics_mv` materialized view provides comprehensive analytics on user progression from Degen to Regen based on token usage, event participation, and platform engagement.

```sql
-- Refresh the regen analytics view
REFRESH MATERIALIZED VIEW public.regen_analytics_mv;

-- Access regen analytics data with security controls
SELECT * FROM public.get_regen_analytics(user_id_param := '00000000-0000-0000-0000-000000000000');

-- Optimize the regen analytics view
SELECT supabase.ai.optimize('regen_analytics_mv');
```

### Token Transaction Analytics

The `token_transaction_analytics_mv` materialized view analyzes token flows, patterns, and metrics across the platform.

```sql
-- Refresh the token transaction analytics view
REFRESH MATERIALIZED VIEW public.token_transaction_analytics_mv;

-- Access token transaction analytics with security controls
SELECT * FROM public.get_token_transaction_analytics(
  token_symbol_param := 'GEN',
  start_date_param := '2025-01-01',
  end_date_param := '2025-04-10'
);

-- Optimize the token transaction analytics view
SELECT supabase.ai.optimize('token_transaction_analytics_mv');
```

## Real-Time Engagement Features

### Real-Time Subscriptions

The platform utilizes Supabase's real-time features to provide instant updates on user progression and token transactions.

```javascript
// Subscribe to user phase transitions
const phaseTransitions = supabase
  .channel('regen-progress')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'user_phase_transitions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('User progressed from', payload.new.from_phase, 'to', payload.new.to_phase);
      updateUserJourney(payload.new);
    }
  )
  .subscribe();

// Subscribe to token transactions
const tokenUpdates = supabase
  .channel('token-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'transactions',
      filter: `to_user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Token transaction:', payload.new);
      updateTokenBalance(payload.new);
    }
  )
  .subscribe();
```

### Asynchronous Token Processing

The platform uses a queue system for processing high-volume token transactions to ensure scalability for 100-1000 users.

```sql
-- Enqueue a token transaction
SELECT public.enqueue_token_transaction(
  from_user_id_param := auth.uid(),
  to_user_id_param := recipient_id,
  token_id_param := token_id,
  amount_param := 10,
  transaction_type_param := 'transfer',
  reason_param := 'Community contribution reward'
);

-- Process the transaction queue (called by cron job)
SELECT public.process_token_transaction_queue(batch_size := 200);
```

## Scheduled Tasks and Automation

The Avolve platform uses scheduled tasks to maintain database health, process analytics, and handle token transactions.

### Analytics Refresh Cron Job

A daily analytics refresh runs at 3:00 AM to:
1. Refresh the regen analytics materialized view
2. Refresh the token transaction analytics materialized view
3. Process pending transactions in the queue

```sql
-- Manually trigger analytics refresh
SELECT public.refresh_analytics_views();
```

### Transaction Queue Processing

A cron job runs every 5 minutes to process pending token transactions:

```sql
-- Manually process the transaction queue
SELECT public.process_token_transaction_queue(200);
```

### Database Optimization

A weekly optimization job runs every Sunday at 2:00 AM to:
1. Vacuum analyze tables to update statistics
2. Refresh materialized views
3. Log optimization details

```sql
-- Manually trigger database optimization
SELECT public.optimize_database();
```

## Performance Optimizations

### Indexes

The platform includes optimized indexes for all key tables to ensure fast queries:

```sql
-- User balances indexes
CREATE INDEX idx_user_balances_user_id ON public.user_balances(user_id);
CREATE INDEX idx_user_balances_token_id ON public.user_balances(token_id);

-- Transactions indexes
CREATE INDEX idx_transactions_from_user_id ON public.transactions(from_user_id);
CREATE INDEX idx_transactions_to_user_id ON public.transactions(to_user_id);
CREATE INDEX idx_transactions_token_id ON public.transactions(token_id);

-- Experience phase indexes
CREATE INDEX idx_user_phase_transitions_user_id ON public.user_phase_transitions(user_id);
CREATE INDEX idx_user_phase_transitions_to_phase ON public.user_phase_transitions(to_phase);
```

### Row-Level Security (RLS)

All tables and functions implement proper Row-Level Security policies to ensure data privacy and security:

```sql
-- Example RLS policy for token transaction queue
CREATE POLICY "Users can view their own transactions in queue"
  ON public.token_transaction_queue
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
```

## Best Practices for 2025

1. **Use Materialized Views with Functions**: For analytics data, use materialized views with secure access functions rather than direct view access.

2. **Implement Asynchronous Processing**: Use queue tables and cron jobs for high-volume operations to ensure system responsiveness.

3. **Enable Real-Time Subscriptions**: Leverage Supabase's real-time features for instant updates on important user events.

4. **Optimize Query Performance**: Regularly analyze and optimize query performance using the AI Assistant.

5. **Implement Proper Security**: Use Row-Level Security (RLS) policies and security invoker functions to protect user data.

6. **Monitor Database Health**: Use scheduled tasks to monitor database health and optimize performance.

7. **Document AI Usage**: Keep this documentation updated with all AI Assistant usage and schema changes.

## Troubleshooting

If you encounter issues with the AI Assistant or database performance:

1. Ensure your Supabase project is on the latest version
2. Check that you have the necessary permissions
3. For complex queries or schema changes, break them down into smaller parts for better AI analysis
4. Review the analytics_refresh_log and database_health tables for error details

## Security Considerations

The AI Assistant has read access to your database schema but does not store your data. All interactions are ephemeral and follow Supabase's security protocols.

When using the AI Assistant for sensitive operations:
- Avoid including sensitive data in your queries
- Review all suggested changes before applying them
- Use the AI Assistant in development environments before production

## Additional Resources

- [Supabase AI Documentation](https://supabase.com/docs/guides/ai)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Real-Time](https://supabase.com/docs/guides/realtime)
