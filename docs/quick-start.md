# Avolve Platform Quick Start Guide

This quick reference guide provides a concise overview of the Avolve platform's user flow and token schedule.

## Table of Contents

- [User Flow](#user-flow)
- [Token Schedule](#token-schedule)
- [Launch Ready](#launch-ready)
- [Launch Checklist](#launch-checklist)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Documentation Index](#documentation-index)

## User Flow

The Avolve platform user journey consists of three main phases:

### 1. Discovery

- **Invitation Code**: Receive and enter a valid invitation code
- **Landing Page**: Learn about the three value pillars:
  - Superachiever (Individual journey)
  - Superachievers (Collective journey)
  - Supercivilization (Ecosystem journey)

### 2. Onboarding

- **The Prime Law Agreement**: Review and accept the platform's foundational principles
  1. No person shall initiate force against another's self, property, or contracts
  2. No exceptions shall exist for any person or group regarding this law
  3. No person or group shall prevent others from enforcing this law
- **Profile Setup**: Create your user profile
- **Journey Selection**: Choose your primary focus areas

### 3. Scaffolding

- **Daily Challenges**: Complete daily challenges to earn tokens
- **Streak Building**: Maintain streaks for bonus multipliers
- **Feature Unlocks**: Access new features as you progress

## Token Schedule

The Avolve platform implements a daily token claim system where specific tokens are available on designated days of the week:

| Day | Token | Full Name | Gradient |
|-----|-------|-----------|----------|
| Sunday | SPD | Superpuzzle Developments | Red-Green-Blue |
| Monday | SHE | Superhuman Enhancements | Rose-Red-Orange |
| Tuesday | PSP | Personal Success Puzzle | Amber-Yellow |
| Wednesday | SSA | Supersociety Advancements | Lime-Green-Emerald |
| Thursday | BSP | Business Success Puzzle | Teal-Cyan |
| Friday | SGB | Supergenius Breakthroughs | Sky-Blue-Indigo |
| Saturday | SMS | Supermind Superpowers | Violet-Purple-Fuchsia-Pink |

### Token Hierarchy

```
GEN (Supercivilization) - Top-level ecosystem token
├── SAP (Superachiever) - Individual journey tokens
│   ├── PSP (Personal Success Puzzle) - Tuesday
│   ├── BSP (Business Success Puzzle) - Thursday
│   └── SMS (Supermind Superpowers) - Saturday
└── SCQ (Superachievers) - Collective journey tokens
    ├── SPD (Superpuzzle Developments) - Sunday
    ├── SHE (Superhuman Enhancements) - Monday
    ├── SSA (Supersociety Advancements) - Wednesday
    └── SGB (Supergenius Breakthroughs) - Friday
```

### Tesla's 3-6-9 Streak Bonus System

The platform implements Nikola Tesla's 3-6-9 principle for streak bonuses:

- **3-Day Streak**: 1.3x token multiplier
- **6-Day Streak**: 1.6x token multiplier
- **9-Day Streak**: 1.9x token multiplier
- **12-Day Streak**: 2.2x token multiplier (continues pattern)

## Launch Ready

The Avolve platform is designed for a seamless launch experience. Follow these steps to get your instance up and running quickly:

### Launch in Minutes

Get your Avolve platform live and collecting valuable user feedback in just minutes:

```bash
# Build and deploy in one command
vercel --prod

# Verify deployment and check SSA functionality
curl -I https://your-domain.vercel.app/api/health

# Monitor user satisfaction in real-time
supabase db query "SELECT avg(worth_it::int) as satisfaction_rate FROM user_feedback WHERE created_at > now() - interval '24 hours'"
```

Key deployment metrics to monitor:
- **SSA Completion Rate**: Target >80% (visible in dashboard)
- **User Satisfaction**: Target >85% "Worth It" responses
- **Time-to-Value**: Target <30 seconds from login to first token claim

The streamlined deployment process leverages Vercel's global edge network for optimal performance and Supabase's real-time capabilities for instant feedback collection.

### Database Setup

Ensure your database is properly configured with the latest schema:

```bash
# Apply all migrations to your Supabase instance
supabase migration up

# Verify migrations applied correctly
supabase db lint
```

This will apply all the necessary tables, functions, and RLS policies required for the platform to operate.

### Real-Time Testing

Test the real-time functionality locally before deployment:

```bash
# Start the development server
npm run dev

# In a separate terminal, use the test script to simulate events
npm run test:realtime
```

The test script will simulate event completions and chat messages, allowing you to verify that the real-time subscriptions are working correctly.

### Vercel Deployment

Deploy your Avolve instance to Vercel for global edge distribution:

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

Make sure your environment variables are properly configured in the Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_TELEMETRY_DISABLED`: Set to `1` to disable Next.js telemetry (optional)

### Post-Deployment Verification

After deployment, verify that all systems are functioning correctly:

1. **Authentication Flow**: Test the sign-up and login processes
2. **Real-Time Features**: Verify that leaderboards update in real-time
3. **Event Completions**: Complete an event and check that tokens are awarded
4. **Chat Functionality**: Test the event chat system
5. **Edge Functions**: Verify that tracking API calls are processed quickly

### Monitoring Setup

Set up monitoring to ensure optimal performance:

```bash
# Install monitoring tools
npm install @vercel/analytics

# Add to your app
# In pages/_app.js or app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

// Add the component to your layout
<Analytics />
```

This will provide insights into user behavior, performance metrics, and potential issues.

## Launch Checklist

Use this checklist to ensure your Avolve platform is fully ready for launch day:

### Pre-Launch Database Preparation

```bash
# Seed the weekly_events table with engaging content
psql -U postgres -h localhost -p 54322 -d postgres -f supabase/seed/weekly_events_2025.sql

# Verify events were created successfully
supabase db query "SELECT * FROM public.weekly_events WHERE start_date >= CURRENT_DATE ORDER BY start_date LIMIT 10"

# Run database health check
supabase db query "SELECT * FROM public.run_database_maintenance()"
```

Ensure that you have at least 4 weeks of events pre-populated in the `weekly_events` table to provide a consistent experience for new users.

### Deployment Process

```bash
# Build the application with production optimizations
npm run build

# Deploy to Vercel production environment
vercel --prod

# Verify edge functions are deployed correctly
vercel functions ls
```

After deployment, verify these critical paths are working:
- `/dashboard` - Check that the Regen Score widget loads correctly
- `/api/feedback` - Test submitting feedback from the UI
- Real-time subscriptions - Verify leaderboard updates

### Post-Launch Monitoring

```bash
# Monitor journey analytics in real-time
supabase db query "SELECT * FROM public.journey_analytics ORDER BY updated_at DESC LIMIT 20"

# Check user feedback submissions
supabase db query "SELECT category, rating, submitted_at FROM public.user_feedback ORDER BY submitted_at DESC LIMIT 10"

# Monitor real-time connections
vercel logs --function api/realtime --follow
```

Set up alerts for these critical metrics:
- User registration rate (target: >100/day)
- Event completion rate (target: >60%)
- Average feedback rating (target: >4.2/5)
- API response times (target: <100ms)

## Troubleshooting Guide

### Common Issues and Solutions

#### Real-Time Not Working

**Symptoms**: Leaderboard not updating, notifications not appearing, or chat messages not showing in real-time.

**Solutions**:
1. Check subscription status:
   ```bash
   # Verify the publication includes the necessary tables
   supabase db query "SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'"
   ```

2. Verify client subscription:
   ```tsx
   // Debug subscription with onPostgresChanges callback
   const channel = supabase
     .channel('debug-channel')
     .on('postgres_changes', { event: '*', schema: 'public' }, 
       (payload) => {
         console.log('Change received!', payload)
       })
     .subscribe((status) => {
       console.log('Subscription status:', status)
     })
   ```

3. Check for CORS issues in browser console

#### Database Migrations Failing

**Symptoms**: Error messages when applying migrations or database inconsistencies.

**Solutions**:
1. Check migration history:
   ```bash
   supabase migration list
   ```

2. Fix conflicts by creating a repair migration:
   ```bash
   # Create a repair migration
   supabase migration new fix_schema_inconsistency
   
   # Edit the migration file to fix the issue
   # Then apply it
   supabase migration up
   ```

3. Verify schema integrity:
   ```bash
   supabase db lint
   ```

#### Edge Functions Timing Out

**Symptoms**: API requests taking too long or timing out.

**Solutions**:
1. Check function logs:
   ```bash
   vercel logs --function api/feedback
   ```

2. Optimize database queries:
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
   ```

3. Implement caching for expensive operations:
   ```tsx
   // Use SWR for client-side caching
   import useSWR from 'swr'
   
   function Profile() {
     const { data, error } = useSWR('/api/user', fetcher, { 
       revalidateOnFocus: false,
       dedupingInterval: 60000 
     })
     
     // ...
   }
   ```

#### Authentication Issues

**Symptoms**: Users unable to log in or access protected routes.

**Solutions**:
1. Check auth settings in Supabase dashboard
2. Verify JWT configuration:
   ```bash
   supabase jwt secret
   ```
3. Test auth flow with the Supabase CLI:
   ```bash
   supabase functions serve auth --no-verify-jwt
   ```

Remember that most issues can be diagnosed by checking logs in both Vercel and Supabase dashboards. For critical launch day support, the Avolve team is available via the emergency Slack channel #launch-support-2025.

## Documentation Index

For more detailed information, refer to these documentation resources:

- [User Guide](./user-guide.md) - Comprehensive guide for platform users
- [API Documentation](./api.md) - Technical API reference
- [Architecture Overview](./architecture.md) - System design and components
- [Contributing Guide](./contributing.md) - Guide for developers
- [Database Schema](./database-schema.md) - Database structure and relationships
- [Security](./security.md) - Security features and best practices

---

*For questions or support, contact the Avolve team at support@avolve.io*
