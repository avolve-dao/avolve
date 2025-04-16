# 🚀 Avolve Platform

> *"Transform yourself, transform the world."*

Welcome to the Avolve platform repository! This project is designed to help individuals and communities evolve through a comprehensive token-based ecosystem that supports personal and collective transformation, built on sacred geometry principles and Tesla's 3-6-9 patterns.

## ✨ Overview

Avolve is built around three main value pillars:

1. **Superachiever** 🏆 - For the individual journey of transformation (SAP token)
2. **Superachievers** 👥 - For collective journey of transformation (SCQ token)
3. **Supercivilization** 🌍 - For the ecosystem journey of transformation (GEN token)

Our platform provides tools, resources, and community support to help users evolve in all aspects of their lives, from personal success to business growth and beyond.

## 🌟 2025 Transformation Features

Avolve's platform empowers personal and collective transformation through three key journeys:

### 🏆 Superachiever Journey (`/superachiever`)
Transform your personal journey through:
- Real-time posts with token rewards (1-5 GEN per post)
- AI-driven prompts for meaningful sharing
- Engagement tracking with milestone rewards (10 SAP at 50% engagement)
- Progressive unlocking based on participation

### 👥 Superachievers Journey (`/superachievers`)
Amplify collective transformation through:
- Real-time chat in Regen Circles
- Community reputation system
- Collaborative goal tracking

### 🌍 Supercivilization Journey (`/supercivilization`)
Contribute to ecosystem transformation through:
- Impact metrics and visualizations
- Token-based governance participation
- Regenerative economy dashboard
- Global transformation tracking

Each journey features:
- WCAG 2.2 AA compliant design
- Dark mode with journey-themed gradients
- Real-time engagement tracking
- Token-gated progressive features
- AI-enhanced interaction prompts

### 🪙 Token System

GEN is the primary token of the Avolve ecosystem, representing the Supercivilization pillar. When users contribute financially, their fiat is allocated as follows:
- 10% to GEN (Supercivilization)
- 40% to SAP (Superachiever)
- 50% to SCQ (Superachievers)

#### Daily Token Claims

The platform follows a weekly schedule for token claims, with each day dedicated to a specific token:

- **Sunday**: SPD (Superpuzzle Developments) - Red-Green-Blue gradient
- **Monday**: SHE (Superhuman Enhancements) - Rose-Red-Orange gradient
- **Tuesday**: PSP (Personal Success Puzzle) - Amber-Yellow gradient
- **Wednesday**: SSA (Supersociety Advancements) - Lime-Green-Emerald gradient
- **Thursday**: BSP (Business Success Puzzle) - Teal-Cyan gradient
- **Friday**: SGB (Supergenius Breakthroughs) - Sky-Blue-Indigo gradient
- **Saturday**: SMS (Supermind Superpowers) - Violet-Purple-Fuchsia-Pink gradient

#### Metrics-Driven Gamification

The platform uses key metrics to drive engagement and measure success:
- **DAU/MAU Ratio**: Daily Active Users / Monthly Active Users (target: >0.3)
- **Retention**: Percentage of users returning after 1, 7, and 30 days
- **ARPU**: Average Revenue Per User
- **NPS**: Net Promoter Score
- **Engagement**: Time spent, actions taken, and content consumed

### 🔓 Feature Unlocking Process

Features are progressively unlocked based on user participation and metrics improvements:

- **Teams**: Unlocked after reaching progress milestones [UPDATED: Teams are now unlocked by progress milestones.]
- **Governance**: Unlocked after accumulating 100 GEN tokens
- **Marketplace**: Unlocked after achieving engagement milestones [UPDATED: Marketplace unlocks based on new engagement metrics.]
- **Token Utility**: Unlocked after completing component progress milestones [UPDATED: Token utility unlocks based on new component progress.]

Our platform provides tools, resources, and community support to help users evolve in all aspects of their lives, from personal success to business growth and beyond.

## 🧭 Onboarding Flow & User Delight

Avolve delivers a magnetic onboarding experience to ensure every new user feels welcomed, guided, and celebrated from day one.

### Onboarding Steps
- **Personalized Welcome**: Users are greeted with a custom banner and checklist upon first login.
- **Guided Actions**: The onboarding checklist walks users through essential actions (profile setup, first token claim, joining a Regen Circle, etc.).
- **Progress Tracking**: Onboarding progress is tracked in the `user_onboarding` table (see schema below).
- **Celebratory Milestones**: Completing onboarding triggers delightful UI (confetti, tooltips, and more).

#### Onboarding Table Schema (`public.user_onboarding`)
| Column           | Type      | Description                                     |
|------------------|-----------|-------------------------------------------------|
| id               | uuid      | Primary key                                     |
| user_id          | uuid      | References `auth.users(id)`                     |
| completed_steps  | text[]    | Array of completed onboarding step keys         |
| completed_at     | timestamptz | Timestamp when onboarding was fully completed |
| created_at       | timestamptz | Row creation timestamp                        |
| updated_at       | timestamptz | Last update timestamp                         |

- **Row Level Security**: Only the user (and admins) can view or update their onboarding row.
- **Admin Controls**: Admins can view and manage onboarding progress for all users.

## 🛡️ Security, RLS, and RBAC
- **Row Level Security**: Enforced on all user data tables, including onboarding, tokens, and profiles.
- **Role-Based Access Control**: Admin dashboard and sensitive actions are restricted to users with the `admin` role.
- **Token Gating**: Access to certain features is gated by token ownership and participation.

## 🗄️ Database Design & Live Data Flow

All admin and user-facing features in Avolve use live, real-world data from the production Supabase database. There is no use of mock, sample, or demo data anywhere in the codebase.

#### Core Tables (Live Data Only)
- `profiles`: user profile and phase data
- `token_types`: available token types
- `tokens`: minted tokens (by type)
- `token_ownership`: which user owns which tokens and their balances

#### Security & RLS Policies
- Row Level Security is enabled on all tables
- Only authenticated users can select from `token_ownership`
- Only admins can insert/update/delete in `token_ownership`
- All admin actions (create/mint/transfer tokens, promote phases) are RBAC enforced

#### Data Flow
- All admin and onboarding UI components fetch and mutate data directly via Supabase queries
- No hardcoded or simulated data is used in any user-facing or admin feature
- All analytics, onboarding, and admin flows are live and production-grade

#### Migration Example
See `/supabase/migrations/20250416213258_create_token_ownership_table.sql` for the latest schema changes for live token management.

Learn more in our [Database documentation](./docs/database.md).

## 🧬 Sacred Geometry & Token Hierarchy

Avolve’s schema, user experience, and gamification system are architected using sacred geometry principles and a fractal token hierarchy:

- **GEN (Supercivilization)**: Ecosystem journey (Zinc gradient)
- **SAP (Superachiever)**: Individual journey (Stone gradient)
  - **PSP**: Personal Success Puzzle (Amber-Yellow)
  - **BSP**: Business Success Puzzle (Teal-Cyan)
  - **SMS**: Supermind Superpowers (Violet-Purple-Fuchsia-Pink)
- **SCQ (Superachievers)**: Collective journey (Slate gradient)
  - **SPD**: Superpuzzle Developments (Red-Green-Blue)
  - **SHE**: Superhuman Enhancements (Rose-Red-Orange)
  - **SSA**: Supersociety Advancements (Lime-Green-Emerald)
  - **SBG**: Supergenius Breakthroughs (Sky-Blue-Indigo)

See [docs/database/er_diagram_sacred_geometry.mmd](./docs/database/er_diagram_sacred_geometry.mmd) and [docs/database/schema.md](./docs/database/schema.md#sacred-geometry-inspired-er-diagram) for a visual and technical overview.

### 🎨 Daily & Weekly Token Claims

- **Sunday**: SPD (Superpuzzle Developments)
- **Monday**: SHE (Superhuman Enhancements)
- **Tuesday**: PSP (Personal Success Puzzle)
- **Wednesday**: SSA (Supersociety Advancements)
- **Thursday**: BSP (Business Success Puzzle)
- **Friday**: SGB (Supergenius Breakthroughs)
- **Saturday**: SMS (Supermind Superpowers)

This system magnetically attracts engagement, balancing individual and collective journeys.

## 🧮 Sacred Geometry & Tesla's 3-6-9 Patterns

Avolve incorporates sacred geometry principles and Tesla's 3-6-9 patterns as fundamental design elements across both visual interfaces and system architecture. This approach creates mathematical harmony throughout the platform.

### Why Sacred Geometry?

Sacred geometry principles provide mathematical harmony and balance to our system, offering several key advantages:

1. **Natural Proportions**: The golden ratio (1.618) and Fibonacci sequence create naturally pleasing relationships between elements, making the system intuitively understandable to users.

2. **Scalable Structure**: These mathematical principles allow for infinite scalability while maintaining proportional relationships, ensuring the system can grow without becoming imbalanced.

3. **Psychological Resonance**: Humans naturally recognize and respond positively to these proportions, creating a subconscious sense of harmony when interacting with the platform.

4. **Universal Patterns**: These mathematical relationships appear throughout nature and across cultures, making them universally relatable regardless of a user's background.

### Why Tesla's 3-6-9 Patterns?

Nikola Tesla famously said, "If you only knew the magnificence of the 3, 6, and 9, then you would have the key to the universe." This pattern provides a complementary framework that enhances our system:

1. **Cyclical Completion**: The 3-6-9 pattern represents creation (3), harmony (6), and completion (9), mirroring the natural cycles of growth and development in our platform.

2. **Digital Root Harmony**: Using vortex mathematics and digital roots creates a system where values maintain their essential properties regardless of scale.

3. **Energy Flow Optimization**: Tesla believed these numbers represented the key to understanding energy flow in the universe. Our system uses this principle to optimize the flow of value through the platform.

4. **Pattern Recognition**: The repeating patterns in the 3-6-9 system make it easier for users to recognize and predict behaviors and relationships.

Learn more in our [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md) documentation.

## 🏛️ DAO Ownership & Schema Governance

This project, its codebase, and all database schema/migrations are owned, controlled, and managed by the **Avolve DAO**. Currently, the DAO is stewarded by its founder, Joshua Seymour, who acts as the benevolent dictator to ensure rapid progress and alignment with the Avolve vision. The explicit goal is for the DAO to mature into a fully decentralized, community-governed organization that collectively manages all assets, code, and decision-making.

- **DAO Governance:** Schema and code changes are submitted as Pull Requests and require DAO review/approval. As the DAO matures, governance will transition to on-chain voting and collective decision-making.
- **Transparency:** All migrations, schema docs, and Supabase configuration are public and version-controlled.
- **Best Practices:** Every migration enables Row Level Security (RLS), policies, and is fully documented.
- **How to Propose Changes:** See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on submitting proposals and schema changes for DAO review.

For a complete, up-to-date reference of all tables, columns, and relationships, see [docs/database/schema.md](./docs/database/schema.md).

## 🧑‍💻 Developer & Contributor Onboarding

- **Type Safety**: All backend logic uses auto-generated types from the Supabase schema ([src/types/database.ts](./src/types/database.ts)).
- **Enum Enforcement**: Core tables and business logic use enums for `token_type`, `metric_type`, and `user_role` ([see migration](./supabase/migrations/20250415222000_create_enums.sql)).
- **RLS & Security**: Every table uses Row Level Security (RLS) with granular policies ([see schema docs](./docs/database/schema.md)).
- **Testing**: Automated integration tests validate RLS and enum constraints ([tests/integration/rls-enum-logic.test.ts](./tests/integration/rls-enum-logic.test.ts)).

## 🏁 Quickstart for Users, Admins, and AI

1. **Users**: Sign up, claim daily tokens, and progress through your personal and collective journeys.
2. **Admins**: Use the admin dashboard to manage tokens, metrics, and user roles. All actions are logged and governed by DAO policies.
3. **AI/Developers**: Reference the ER diagram and unified types for rapid, safe feature development. All schema changes are managed via migrations and PRs.

## 🛠️ Tech Stack

Avolve is built with modern technologies to ensure a robust, scalable, and delightful user experience:

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Package Manager**: pnpm
- **Service Layer**: Custom service architecture for business logic
- **Design System**: Sacred geometry principles and Tesla's 3-6-9 patterns

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/avolve-dao/avolve.git
cd avolve
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Start the development server**

```bash
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 🏗️ Project Structure

```
avolve/
├── app/                  # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Dashboard routes
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── sacred/           # Sacred geometry components
├── lib/                  # Utility functions and hooks
│   ├── supabase/         # Supabase client and utilities
│   ├── auth/             # Authentication utilities
│   ├── rbac/             # Role-based access control
│   ├── token/            # Token-based access control
│   └── sacred-geometry.ts # Sacred geometry utilities
├── public/               # Static assets
├── styles/               # Global styles
│   └── sacred-geometry.css # Sacred geometry styles
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
    └── sacred-geometry-design-system.md # Sacred geometry documentation
```

## 💎 Key Features

### 🧩 Sacred Geometry Design System

Our platform features a comprehensive design system based on sacred geometry principles and Tesla's 3-6-9 patterns:

- Implements golden ratio (1.618) and Fibonacci sequence for natural proportions
- Uses Tesla's 3-6-9 pattern for cyclical completion and energy flow
- Applies vortex mathematics for digital root calculations
- Creates mathematically harmonious UI components and layouts
- Ensures pixel-perfect sizing and spacing throughout the application

Learn more in our [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md) documentation.

### 🪙 Token-Based Access Control

Our platform features a sophisticated token-based access control system that integrates with traditional RBAC. This system:

- Implements a hierarchical token structure aligned with our value pillars
- Organizes tokens into three main categories: GEN (Supercivilization), SAP (Superachiever), and SCQ (Superachievers)
- Enables daily token claims based on the day of the week
- Provides granular access control based on token ownership
- Enables token transfers, rewards, and transactions
- Supports gamification and progressive unlocking of features based on metrics improvements

Learn more in our [Token System documentation](./docs/token-system.md) and [Regenerative Gamification documentation](./docs/regenerative-gamification.md).

### 🔒 Security

Avolve prioritizes security at every level:

- Comprehensive authentication flows
- Role-based access control
- Row-level security in the database
- Secure API endpoints
- Regular security audits

Learn more in our [Security documentation](./docs/security.md).

### 📝 Audit Logging

All important actions in the system are logged for accountability and transparency:

- Comprehensive audit trails
- User action tracking
- Token transaction history
- Security event logging

Learn more in our [Audit Logging documentation](./docs/audit-logging.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation
- [Getting Started](./docs/quick-start.md)
- [Architecture Overview](./docs/architecture.md)
- [API Reference](./docs/api/README.md)
  - [Consent API](./docs/api/consent.md)
  - [Token API](./docs/api/token.md)
- [Database](./docs/database/README.md)
  - [Schema Reference](./docs/database/schema.md)
- [Security](./docs/security/README.md)
  - [Authentication](./docs/security/authentication.md)
  - [Authorization](./docs/security/rbac.md)
  - [Token Access](./docs/security/token-access.md)

### DAO Governance
- [DAO Governance Guide](./docs/dao/governance.md)
- [How to Propose Schema Changes](./docs/dao/schema-changes.md)

### Design & Implementation
- [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md)
- [UI Style Guide](./docs/ui/style-guide.md)
- [Token System](./docs/token-system.md)
- [Regenerative Gamification](./docs/regenerative-gamification.md)

### Development
- [Developer Guide](./docs/guides/developer-guide.md)
- [Implementation Guide](./docs/guides/implementation.md)
- [Testing Strategy](./docs/testing/README.md)
- [Best Practices](./docs/best-practices.md)

### User Documentation
- [User Guide](./docs/guides/user-guide.md)
- [Values](./docs/values.md)

## 🧪 Testing

Run the test suite with:

```bash
pnpm test
```

For end-to-end tests:

```bash
pnpm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Intellectual Property & Ownership

All code, documentation, assets, and database schema/migrations in this repository are the exclusive property of the **Avolve DAO**. Unauthorized use, distribution, or reproduction is strictly prohibited. All contributors agree that their contributions become the property of Avolve DAO and are subject to the DAO’s governance and licensing terms.

## 📄 License

This project is proprietary software owned by Avolve DAO. All rights reserved.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

## 📞 Support

For support or inquiries, contact admin@avolve.io.

---

## 🎉 Launch & Feedback
- The platform is ready for the first 100–1000 users.
- Feedback channels and monitoring are set up for continuous improvement.
