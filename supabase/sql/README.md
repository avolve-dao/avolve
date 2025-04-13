# Avolve Platform Database Schema

This directory contains SQL scripts for setting up the Avolve platform database using Supabase. The database schema is designed to support the three main pillars of the Avolve platform:

1. **Superachiever** - Individual journey of transformation
2. **Superachievers** - Collective journey of transformation
3. **Supercivilization** - Ecosystem journey for transformation

## Database Structure

The database follows a hierarchical structure:

- **Pillars**: The main categories (Superachiever, Superachievers, Supercivilization)
- **Sections**: Sub-categories within pillars (e.g., Personal Success Puzzle)
- **Components**: Specific elements within sections (e.g., Health & Energy)

User progress is tracked at multiple levels:

- **User Journeys**: Track which pillars a user is on
- **User Section Progress**: Track progress through sections
- **User Component Progress**: Track progress through components with current/desired states

## SQL Scripts

The following SQL scripts are available:

1. `create-avolve-schema.sql` - Creates the core database structure
2. `seed-avolve-data.sql` - Populates the database with initial data
3. `create-avolve-functions.sql` - Creates PostgreSQL functions for managing user progress

## Implementation with MCP

Since you have the Supabase MCP server set up, you can use Windsurf to execute these SQL scripts directly against your Supabase database.

### Steps to Implement

1. Open Windsurf
2. Ask Cascade to "Execute the SQL in this file: /Users/avolve/CascadeProjects/avolve/scripts/create-avolve-schema.sql"
3. After the schema is created, ask Cascade to "Execute the SQL in this file: /Users/avolve/CascadeProjects/avolve/scripts/seed-avolve-data.sql"
4. Finally, ask Cascade to "Execute the SQL in this file: /Users/avolve/CascadeProjects/avolve/scripts/create-avolve-functions.sql"

## Database Functions

The following PostgreSQL functions are available for managing user progress:

- `start_user_journey(user_id, pillar_slug)` - Start a user journey for a specific pillar
- `update_component_progress(user_id, component_slug, status, current_state, desired_state, action_plan, results)` - Update progress on a component
- `get_user_progress_summary(user_id)` - Get a summary of user progress across all pillars

## Security

The database schema implements Row Level Security (RLS) policies to ensure:

- Pillars, sections, and components are viewable by everyone
- User progress data is only viewable and editable by the user who owns it

## Next Steps

After implementing the database schema, you can:

1. Connect the frontend components to the Supabase backend
2. Implement user authentication and profile management
3. Create API endpoints for tracking user progress
4. Develop the UI for each pillar, section, and component

## Best Practices

All PostgreSQL functions follow these best practices:

- Use `SECURITY INVOKER` to run with the permissions of the calling user
- Set `search_path = ''` to avoid unexpected behavior
- Use fully qualified names for all database objects
- Include proper error handling and validation
- Add comments for documentation
