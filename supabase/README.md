# Avolve Database Structure

This directory contains the database structure for the Avolve platform, implemented using Supabase PostgreSQL following the declarative schema approach with sacred geometry principles and Tesla's 3-6-9 patterns integrated throughout.

## Directory Structure

- `/schemas/` - Declarative schema files organized by domain
  - `/public/` - Public schema definitions
    - `tables.sql` - Table definitions
    - `policies.sql` - RLS policies
    - `functions.sql` - Main functions file (imports modules)
    - `/functions/` - Function modules
      - `role_functions.sql` - Role management functions
      - `token_functions.sql` - Token operations and access control
      - `sacred_geometry_functions.sql` - Functions for sacred geometry calculations
      - `gamification_functions.sql` - Achievements and progress tracking [UPDATED: Only progress tracking remains.]
  - `schema.sql` - Main schema file
- `/migrations/` - Migration files to be applied to the database
  - `20240906123045_enhance_tokenomics_with_sacred_geometry.sql` - Sacred geometry enhancements
  - `20240906123046_seed_token_hierarchy.sql` - Token hierarchy based on sacred principles
  - `20240906123047_create_token_utility_functions.sql` - Sacred geometry utility functions
- `/seed/` - Seed data for development

## Schema Organization

The database schema follows Supabase's declarative schema approach, which provides:

1. **Clear separation of concerns** - Tables, policies, and functions are defined in separate files
2. **Easier maintenance and collaboration** - Changes can be made to specific components without affecting others
3. **Better version control** - Changes are more atomic and easier to review
4. **Simplified deployment** - Schema can be applied in a consistent order
5. **Improved documentation** - Code is self-documenting with comments and structure

## Sacred Geometry Integration: Rationale and Value

Our database schema incorporates sacred geometry principles and Tesla's 3-6-9 patterns for several important reasons:

### Why Mathematical Harmony Matters in Database Design

1. **Natural Balance**: Sacred geometry principles create naturally balanced relationships between database entities, leading to more intuitive data structures and relationships.

2. **Scalable Architecture**: The fractal nature of these mathematical patterns ensures the database can scale infinitely while maintaining its proportional relationships.

3. **Simplified Decision-Making**: Rather than making arbitrary decisions about token values and relationships, we follow mathematical principles that have stood the test of time.

4. **Optimized Data Flow**: Tesla's 3-6-9 patterns optimize the flow of data and value through the system, similar to how Tesla believed these numbers optimized energy flow.

5. **Enhanced Pattern Recognition**: These mathematical patterns make it easier to recognize trends and relationships in the data.

### Key Sacred Geometry Database Features

1. **Token Level Hierarchy (3-6-9)**: Tokens are organized into three levels (3, 6, 9) representing creation, harmony, and completion.

2. **Digital Root Calculations**: Tokens have digital roots calculated using vortex mathematics, categorizing them into families.

3. **Golden Ratio Exchange Rates**: Token exchange rates follow the golden ratio (1.618), creating naturally balanced economic relationships.

4. **Fibonacci-Based Rewards**: Token rewards follow the Fibonacci sequence for natural progression.

5. **Tesla Multipliers**: Special multipliers for tokens with digital roots of 3, 6, or 9.

## Core Tables

- **roles** - Defines user and admin roles with their permissions
- **user_roles** - Assigns roles to users with optional expiration
- **tokens** - Defines all token types in the platform with sacred geometry attributes
  - `token_level` - Level in the hierarchy (3, 6, or 9)
  - `digital_root` - Calculated using vortex mathematics
  - `is_tesla_369` - Whether the token belongs to Tesla's special numbers
  - `fibonacci_weight` - Weight based on the Fibonacci sequence
  - `golden_ratio_multiplier` - Multiplier based on the golden ratio
  - `token_family` - Family based on digital root (family_369, family_147, family_258)
- **user_tokens** - Tracks token ownership for each user
- **token_transactions** - Records token transfers and rewards
- **token_exchange_rates** - Defines exchange rates between tokens based on sacred ratios
- **pillars** - The three main content pillars of the platform
- **sections** - Subdivisions within each pillar
- **components** - Individual content pieces within sections
- **user_progress** - Tracks user progress through content
- **user_activity_logs** - Records user actions for analytics and gamification

## Migration Files

The migrations are applied in the following order:

1. `20240406154125_add_user_and_admin_roles.sql` - Implements role-based access control
2. `20240406154500_implement_declarative_schema.sql` - Reorganizes database structure
3. `20240906123045_enhance_tokenomics_with_sacred_geometry.sql` - Adds sacred geometry attributes to tokens
4. `20240906123046_seed_token_hierarchy.sql` - Seeds the token hierarchy based on 3-6-9 patterns
5. `20240906123047_create_token_utility_functions.sql` - Adds utility functions for sacred geometry calculations

## Benefits of Sacred Geometry in Database Design

### For Users
1. **Intuitive Token Values**: Token values and relationships feel natural and balanced
2. **Predictable Rewards**: Rewards follow natural mathematical progressions
3. **Meaningful Patterns**: Users can recognize patterns in token relationships
4. **Fair Economics**: The system feels fair due to its mathematical foundation
5. **Enhanced Engagement**: The mathematical harmony creates a more engaging experience

### For Administrators
1. **Self-Balancing Economics**: The token economy naturally balances itself
2. **Reduced Complexity**: Despite sophisticated mathematics, the system is simpler to manage
3. **Scalable Architecture**: The system can grow infinitely while maintaining its proportions
4. **Simplified Decision-Making**: Many decisions are guided by mathematical principles
5. **Universal Appeal**: The principles resonate across cultural and educational backgrounds

### For Developers
1. **Elegant Data Structures**: The mathematics encourages elegant, efficient data structures
2. **Predictable Patterns**: Token relationships follow predictable patterns
3. **Testable Relationships**: Mathematical relationships are easier to test
4. **Natural Hierarchies**: The system creates natural hierarchies in the data
5. **Future-Proof Design**: These timeless mathematical principles won't become outdated

## Applying Migrations

To apply migrations to your Supabase project:

1. Make sure you have the Supabase CLI installed
2. Run `supabase link --project-ref <your-project-ref>`
3. Run `supabase db push` to apply all migrations

## Security

All tables have Row Level Security (RLS) policies enabled to ensure data privacy and security. The security model follows these principles:

1. **Least Privilege** - Users only have access to what they need
2. **Defense in Depth** - Multiple security layers (tokens, roles, RLS)
3. **Declarative Policies** - Security rules defined as declarative policies
4. **Automatic Role Assignment** - New users automatically get the Subscriber role

All functions follow these best practices:
- Using `security invoker` to run with caller's permissions
- Setting `search_path = ''` to prevent search path attacks
- Using fully qualified names for all database objects

## User & Admin Roles

The platform implements the following roles:

### User Roles
- **Subscriber** - Basic access to platform content
- **Participant** - Can participate in community activities
- **Contributor** - Can contribute content to the platform

### Admin Roles
- **Associate** - Helping with platform operations
- **Builder** - Building platform features
- **Partner** - Funding and strategic direction

## Key Database Functions

The following key functions are available:

### Role Functions
- `get_user_roles()` - Returns all roles assigned to the current user
- `has_role(role_name)` - Checks if the current user has a specific role
- `is_admin()` - Checks if the current user has admin privileges
- `assign_role(user_id, role_name)` - Assigns a role to a user (admin only)
- `remove_role(user_id, role_name)` - Removes a role from a user (admin only)

### Token Functions
- `get_token_hierarchy()` - Returns the hierarchical structure of all tokens
- `get_user_tokens(user_id)` - Returns all tokens owned by a user
- `has_token_access(token_symbol, user_id)` - Checks if a user has access to content requiring a specific token
- `has_pillar_access(pillar_id, user_id)` - Checks if a user has access to a specific pillar
- `has_section_access(section_id, user_id)` - Checks if a user has access to a specific section
- `has_component_access(component_id, user_id)` - Checks if a user has access to a specific component

### Sacred Geometry Functions
- `get_digital_root(num)` - Calculates the digital root of a number using vortex mathematics
- `is_tesla_369_number(num)` - Checks if a number belongs to Tesla's 3-6-9 pattern
- `get_token_family(num)` - Returns the token family based on digital root
- `calculate_token_value(token_id, reference_token_id)` - Calculates token value based on sacred geometry principles

### Gamification Functions
- `complete_content(content_id)` - Marks content as completed and grants any associated rewards
- `get_all_pillars_progress(user_id)` - Returns progress statistics for all pillars
- `track_user_activity(activity_type, entity_type, entity_id, metadata)` - Records user activity for analytics and gamification
- `get_user_experience_phase()` - Determines which phase a user is in based on their progress
- `get_next_recommended_actions()` - Suggests personalized next steps based on user progress
- `reward_user_activity(user_id, activity_type, activity_details)` - Rewards user activity with tokens based on Tesla multipliers

## TypeScript Integration

Generate TypeScript types for the database schema using:

```bash
supabase gen types typescript --project-id <your-project-id> --schema public > lib/types/supabase.ts
```

## Conclusion

Our database schema integrates sacred geometry principles and Tesla's 3-6-9 patterns to create a mathematically harmonious foundation for the Avolve platform. This approach not only creates a more balanced and intuitive system but also simplifies decision-making, enhances scalability, and creates a more engaging user experience. By following these timeless mathematical principles, we create a database structure that is both technically sound and philosophically aligned with Avolve's mission of personal and collective transformation.
