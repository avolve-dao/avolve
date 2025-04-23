# Avolve: Regenerative Platform for Transformation

> Avolve is a next-generation, tokenized platform empowering individuals, collectives, and ecosystems to co-create a regenerative future through gamified engagement, transparent governance, and real-time data.

[![License: Avolve DAO](https://img.shields.io/badge/License-Avolve%20DAO-purple)](./LICENSE) [![Join the Community](https://img.shields.io/badge/Community-Discussions-blue)](https://github.com/avolve-dao/avolve.io/discussions)

---

## 🛠️ Configuration & Project Structure (2025 Launch)

Avolve is designed for maintainability, clarity, and DRY principles. Below is an overview of essential configuration files and best practices for a clean, production-ready setup.

### Essential Config Files

| File/Dir                       | Purpose / Notes                                   |
|--------------------------------|---------------------------------------------------|
| `.env.example`                 | Template for environment variables. Keep up-to-date and minimal. |
| `.gitignore`                   | Ignore sensitive or build files.                  |
| `.lintstagedrc.js`             | Pre-commit linting.                               |
| `eslint.config.js`             | Unified ESLint config (see note below).           |
| `next.config.mjs`              | Main Next.js config (ESM, supports user overrides).|
| `postcss.config.mjs`           | PostCSS config for Tailwind, etc.                 |
| `tailwind.config.js`           | Tailwind CSS config.                              |
| `tsconfig.json`                | Base TypeScript config.                           |
| `tsconfig.node.json`           | Node-specific TS config (extends base).           |
| `tsconfig.sim.json`            | Simulation/test TS config (extends base).         |
| `pnpm-lock.yaml`               | Lock file for pnpm (remove package-lock.json).    |
| `vitest.config.ts`             | Vitest (test runner) config.                      |
| `vercel.json`                  | Vercel deployment config.                         |
| `config/ai-state.json`         | Custom AI/app config (documented below).          |
| `supabase/config.toml`         | Supabase CLI config.                              |
| `supabase/migrations/`         | All DB migrations (source of truth).              |
| `supabase/schemas/`            | Modular SQL schemas (merge with /schema/ if needed). |
| `supabase/functions/`          | Edge/database functions.                          |
| `supabase/seed/`               | Seed data for onboarding/tests.                   |
| `types/`                       | TypeScript types (auto-gen and manual).           |

#### Notes:
- **Deprecated:** `.eslintrc.json` and `next.config.js` are stubs for compatibility. Use `eslint.config.js` and `next.config.mjs`.
- **Remove:** `package-lock.json` if using pnpm.
- **Merge:** `supabase/schema/` into `supabase/schemas/` if possible.
- **Document:** All custom configs (e.g. `config/ai-state.json`) in this README.

### Example: Custom AI Config

The file `config/ai-state.json` tracks the state of major product subsystems, their implementation status, and key code locations. This is used for onboarding, automated documentation, and AI assistant optimizations.

**Structure:**
- `version`: Config version
- `lastUpdated`: ISO8601 timestamp
- `codebaseState`: Object with keys for each subsystem (tokenSystem, journeySystem, etc.), each containing:
  - `status`: Implementation status (e.g., "complete")
  - `description`: Short description
  - `components`, `utilities`, `apiRoutes`: Arrays of objects with `name`, `status`, and `path`
- `featureFlags`: Feature toggles for major platform features
- `aiAssistantOptimizations`: Toggles for AI/automation enhancements (semantic anchors, type definitions, etc.)

**See:** [`config/ai-state.json`](./config/ai-state.json) for the current state and documentation of all major systems.

### DRY & Maintainable Practices
- **Single Source of Truth:** Only one config per tool (see above table).
- **Extends:** Use `extends` in TS configs for variants (e.g., node, sim).
- **Modular SQL:** Use `/supabase/schemas/` and reference in migrations for DRYness.
- **Onboarding:** Keep `.env.example` and this README up-to-date for new contributors.
- **Automation:** Use scripts in `/scripts/` for checks and setup.

### Example: Environment Variables
See `.env.example` for the minimal set of required variables. Document each in the table above for clarity.

### Example: ESLint
All lint rules are now in `eslint.config.js` (flat config, supports plugins and custom rules). `.eslintrc.json` is deprecated and left as a stub.

### Example: Next.js Config
All Next.js configuration is in `next.config.mjs` (ESM, supports user overrides). `next.config.js` is deprecated and left as a stub.

### Example: Supabase Schema
All DB schema and policy changes should be made in `/supabase/migrations/` and, if modular, in `/supabase/schemas/`. Document any custom logic in `/supabase/README.md`.

---

## ✨ Peer Recognition & Engagement Features (2025 Launch)

Avolve now includes robust, accessible, and delightful peer recognition and onboarding features designed to magnetically attract, engage, and delight users and admins:

- **Thank a Peer Modal:**
  - Accessible modal for sending recognitions with message, badge, and user search/autocomplete.
  - Confetti celebration and toast notifications on successful send.
  - Keyboard and screen reader accessible.
- **Real-Time Recognition Feed:**
  - See recognitions appear instantly (Supabase Realtime).
  - Full names and avatars shown for sender/recipient.
  - Secure: Only senders can delete their recognitions, with confirmation dialog and undo.
- **Accessibility & Delight:**
  - ARIA roles, keyboard navigation, and responsive design throughout onboarding and recognition flows.
  - Micro-animations, toasts, and celebratory feedback for every milestone.
- **Admin & User Onboarding:**
  - In-app tooltips, onboarding wizard, and dashboard tour for a welcoming first experience.
  - Documentation and codebase ready for 100–1000 users and admins.

**See also:**
- [`app/components/ThankPeerModal.tsx`](./app/components/ThankPeerModal.tsx)
- [`app/(authenticated)/dashboard/page.tsx`](./app/(authenticated)/dashboard/page.tsx)
- [`app/components/Toast.tsx`](./app/components/Toast.tsx)
- [`supabase/migrations/20250421222100_create_peer_recognition_table.sql`](./supabase/migrations/20250421222100_create_peer_recognition_table.sql)

---

## Onboarding Guides
- [User Onboarding Guide](docs/guides/onboarding-user.md)
- [Admin Onboarding Guide](docs/guides/onboarding-admin.md)

## Feedback & Support
- Open an [issue on GitHub](https://github.com/avolve-dao/avolve.io/issues)
- Or email the maintainer at: support@avolve.io

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```sh
   cp .env.example .env.local
   ```
2. Fill in all required values in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `REDIS_URL`: (Optional, but recommended for production caching)
   - `OPENAI_API_KEY`: (Optional, enables AI-powered features)

## Running Locally

```sh
npx next dev
```

## Building for Production

```sh
npx next build
```

## Notes
- If `REDIS_URL` is not set, the app will use in-memory cache (not recommended for production).
- If `OPENAI_API_KEY` is not set, AI endpoints will return 503.

## Feedback
If you encounter issues or have suggestions, please open an issue or contact the maintainer.

---

## Quickstart

1. **Clone the repo:**
   ```sh
   git clone https://github.com/avolve-dao/avolve.io.git
   cd avolve.io
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in:
     - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     - `REDIS_URL`, `OPENAI_API_KEY` (optional for AI features)
4. **Run locally:**
   ```sh
   pnpm dev
   ```

## Database & Supabase
- Managed via migrations in `/supabase/migrations` (Supabase CLI/MCP best practices).
- RLS enabled and granular policies for all tables.
- Types auto-generated in `/types/supabase.ts`.

## Testing
- Run all tests:
  ```sh
  pnpm test
  ```
- Ensure Docker Desktop is running for local Supabase tests.

## Linting & Formatting
- Lint all code:
  ```sh
  pnpm lint
  ```
- Format all code:
  ```sh
  pnpm exec prettier --write .
  ```

## Deployment
- Push to `main` for production deploys.
- Uses GitHub Actions for CI (lint/build/test).

## Environment Variables
| Name                    | Required | Description                  |
|-------------------------|----------|------------------------------|
| SUPABASE_URL            | Yes      | Supabase project URL         |
| SUPABASE_ANON_KEY       | Yes      | Supabase anon key            |
| SUPABASE_SERVICE_ROLE_KEY | Yes    | Supabase service role key    |
| REDIS_URL               | Optional | Redis connection string      |
| OPENAI_API_KEY          | Optional | OpenAI API key for AI        |

## Contributing
- For now, this is a solo project. PRs/branches optional.
- All code, migrations, and types should be versioned and documented.

## Contact
- Maintainer: @avolve-dao

---

## Fellowship Review: Production-Ready Status

- **All simulation, mock, and test code has been removed.**
- **Database is fully audited:** All production tables have `created_at`, `updated_at`, and indexes on foreign keys and key columns for analytics and performance.
- **Row Level Security (RLS):** Enforced on all tables, with granular policies for each role.
- **No hardcoded secrets:** All sensitive keys are managed via environment variables.
- **Documentation and codebase are prepared for the first 100-1000 users.**

For details, see:
- [`supabase/migrations/`](./supabase/migrations/) for audit and security migrations
- [`docs/security/README.md`](./docs/security/README.md) for security rationale
- [`docs/database/README.md`](./docs/database/README.md) for schema and audit fields
- [Onboarding Documentation](./docs/onboarding/README.md)
- [Database Documentation](./docs/database/README.md)

---

## Table of Contents
- [Avolve DAO: Transparent Research and Documentation Hub](#avolve-dao-transparent-research-and-documentation-hub)
- [Platform Overview](#platform-overview)
- [Token System and Mathematical Patterns](#token-system-and-mathematical-patterns)
- [User Journeys](#user-journeys)
- [Feature Unlocking and Gamification](#feature-unlocking-and-gamification)
- [Onboarding Flow](#onboarding-flow)
- [Security and Data Integrity](#security-and-data-integrity)
- [Featured Papers and Case Studies](#featured-papers-and-case-studies)
- [Supporting Data](#supporting-data)
- [Feedback, Suggestions, and Peer Review](#feedback-suggestions-and-peer-review)
- [Repo Navigation](#repo-navigation)

---

## Avolve DAO Repositories

Welcome to the Avolve DAO GitHub organization! Our mission is to empower individuals, collectives, and ecosystems to achieve transformation and co-create a regenerative future through the Avolve platform.

## Main Repository: [avolve.io](https://github.com/avolve-dao/avolve.io)

This is the primary codebase for the Avolve web application and platform. It contains all core features, onboarding flows, admin dashboards, and the robust token and value system that powers Avolve.

- **Production-ready Next.js app**
- **Supabase integration for authentication, data, and RBAC**
- **Delightful onboarding and user engagement features**
- **Admin and analytics dashboards**
- **Secure, scalable, and optimized for the first 100–1000 users and beyond**

## Discovery & Value Exploration Repositories

These repositories support the discovery and articulation of the core value pillars within the Avolve ecosystem. Each one is dedicated to a unique journey of transformation:

- [superachiever](https://github.com/avolve-dao/superachiever): For the individual journey of transformation, helping users create their personal and business success puzzles.
- [superachievers](https://github.com/avolve-dao/superachievers): For the collective journey, enabling groups to co-create superpuzzles and advance together.
- [supercivilization](https://github.com/avolve-dao/supercivilization): For the ecosystem journey, focusing on the evolution from degen to regen and building a supercivilization.

These repositories serve as collaborative spaces for research, content, and discovery related to the values, playbooks, and quests available within the Avolve platform.

## Learn More
- Explore the main platform at [avolve.io](https://avolve.io)
- Read more about the Avolve vision and value pillars in the project documentation
- Join us in co-creating the future of transformation!

---

> "Avolve is where superachievers, superachievers, and supercivilizations are born. Discover your journey, unlock your potential, and help build a regenerative world."

---

## Avolve DAO: Transparent Research and Documentation Hub

Avolve DAO is an evolving, open research and documentation hub dedicated to personal, collective, and ecosystem transformation. Our mission is to transparently share experiments, user journeys, governance lessons, and real-world impact—empowering all stakeholders to co-create the future of regenerative organizations.

### Purpose and Approach
- **Purpose:** To transform individuals, collectives, and ecosystems through open research, gamified engagement, and transparent governance.
- **Approach:** We document every major experiment, user story, and governance learning—sharing both successes and failures.
- **Impact:** Real-world case studies, anonymized data, and actionable insights drive continuous improvement and collective wisdom.

### Platform Overview
Avolve is a next-generation, tokenized platform designed to guide users and collectives from their current state to their highest potential. The platform is built around:
- **Magnetic Onboarding:** Personalized, gamified onboarding flows that celebrate every milestone.
- **Fractal Token System:** A 10-token architecture aligning incentives at individual, collective, and ecosystem levels.
- **Progressive Feature Unlocking:** Features become available as users and teams demonstrate engagement and impact.
- **Real-Time Engagement:** Live dashboards, notifications, and feedback loops.
- **Regenerative Governance:** Transparent, data-driven, and participatory decision-making.

### Token System and Mathematical Patterns
Avolve’s token system is inspired by mathematically significant patterns such as the golden ratio and the Fibonacci sequence. These patterns are used in the design and structure of the platform to promote balance, scalability, and aesthetic coherence:
- **GEN (Supercivilization):** Ecosystem journey (Zinc gradient)
- **SAP (Superachiever):** Individual journey (Stone gradient)
  - **PSP:** Personal Success Puzzle (Amber-Yellow)
  - **BSP:** Business Success Puzzle (Teal-Cyan)
  - **SMS:** Supermind Superpowers (Violet-Purple-Fuchsia-Pink)
- **SCQ (Superachievers):** Collective journey (Slate gradient)
  - **SPD:** Superpuzzle Developments (Red-Green-Blue)
  - **SHE:** Superhuman Enhancements (Rose-Red-Orange)
  - **SSA:** Supersociety Advancements (Lime-Green-Emerald)
  - **SBG:** Supergenius Breakthroughs (Sky-Blue-Indigo)

**Token Allocation:**
- 10% to GEN (Supercivilization)
- 40% to SAP (Superachiever)
- 50% to SCQ (Superachievers)

**Weekly Token Schedule:**
- Sunday: SPD | Monday: SHE | Tuesday: PSP | Wednesday: SSA | Thursday: BSP | Friday: SGB | Saturday: SMS

**Learn more:** [Token System Paper](./docs/TOKEN-SYSTEM.md)

### User Journeys
- **Superachiever (Individual):** Personal and business transformation quests.
- **Superachievers (Collective):** Team and collective co-creation.
- **Supercivilization (Ecosystem):** Impact at scale and regenerative governance.

Each journey features:
- **WCAG 2.2 AA** compliant design
- **Dark mode** with journey-themed gradients
- **Real-time engagement tracking**
- **Token-gated progressive features**
- **AI-enhanced interaction prompts**

### Feature Unlocking and Gamification
Features are progressively unlocked based on participation and metrics:
- **Teams:** Unlocked by progress milestones
- **Governance:** Unlocked after accumulating 100 GEN tokens
- **Marketplace:** Unlocked after engagement milestones
- **Token Utility:** Unlocked after completing component progress milestones

**Metrics Tracked:**
- DAU/MAU Ratio, Retention, ARPU, NPS, Engagement

### Onboarding Flow
Avolve delivers a magnetic onboarding experience:
- **Personalized Welcome:** Custom banner and checklist
- **Guided Actions:** Step-by-step onboarding checklist
- **Progress Tracking:** Live in `user_onboarding` table
- **Celebratory Milestones:** Confetti, tooltips, and badges

**Onboarding Table Schema:**
| Column           | Type        | Description                                     |
|------------------|-------------|-------------------------------------------------|
| id               | uuid        | Primary key                                     |
| user_id          | uuid        | References `auth.users(id)`                     |
| completed_steps  | text[]      | Array of completed onboarding step keys         |
| completed_at     | timestamptz | Timestamp when onboarding was fully completed   |
| created_at       | timestamptz | Row creation timestamp                          |
| updated_at       | timestamptz | Last update timestamp                           |

- **Row Level Security:** Only the user (and admins) can view or update their onboarding row.
- **Admin Controls:** Admins can view and manage onboarding progress for all users.

### Onboarding Automation, Recognition, and Admin Dashboard

### Automated Onboarding Reminders
- A Supabase Edge Function (`send_onboarding_reminders.ts`) automatically notifies users who are stuck in onboarding.
- Reminders are logged in the `user_notifications` table for full auditability.
- Admins can trigger reminders manually from the Admin Dashboard for any user.
- All reminder flows are secured by Row Level Security (RLS) and role checks.

### Recognition & Gratitude System
- Admins receive recognition (gratitude events) when they assist users in completing onboarding.
- Gratitude events are logged in the `gratitude_events` table and surfaced in the Admin Dashboard.

### Admin Dashboard Features
- **Gratitude Feed:** See recent recognitions for your admin support.
- **Stuck Onboarding Table:** View users who are stuck in onboarding, with last progress and last reminder sent.
- **Manual Reminder Buttons:** Send reminders directly to users from the dashboard.
- All dashboard features are modular, secure, and production-ready for launch.

### Security & Best Practices
- All onboarding and recognition flows are protected by RLS and RBAC.
- All new features are documented and maintainable, following Supabase and Next.js best practices.
- Codebase is optimized for a clean, welcoming, and robust initial launch experience.

For details on onboarding, recognition, and admin empowerment, see also:
- [`supabase/functions/send_onboarding_reminders.ts`](./supabase/functions/send_onboarding_reminders.ts)
- [`components/admin/GratitudeFeed.tsx`](./components/admin/GratitudeFeed.tsx)
- [`components/admin/StuckOnboardingTable.tsx`](./components/admin/StuckOnboardingTable.tsx)
- [`app/(authenticated)/admin/page.tsx`](./app/(authenticated)/admin/page.tsx)

### Security and Data Integrity
- **Row Level Security (RLS)** on all user data tables
- **Role-Based Access Control (RBAC)** for admin actions
- **Token gating** for advanced features
- **Audit Fields:** All tables have `created_at` and `updated_at` for traceability
- **Indexes:** All foreign keys and frequently queried columns are indexed for performance
- All data is live, real, and production-grade

**See:** [Database Docs](./docs/database.md)

### Node.js 22, Vercel, and Supabase Requirements

- Node.js 22.x is required for all development and production environments. See `package.json` for explicit version.
- All deployments use Vercel. Logs are accessible via the Vercel dashboard (see below).
- All database operations, authentication, and RBAC are managed via Supabase. Logs for queries and auth events are available in the Supabase dashboard.
- All audit fields (`created_at`, `updated_at`) are kept up-to-date with triggers (see latest migrations).

### Accessing Logs
- **Vercel:** Go to your Vercel dashboard → Project → Logs. Filter by `console.error`, `console.info`, or custom JSON keys for structured logs.
- **Supabase:** Go to your Supabase dashboard → Project → Logs. Filter by query, auth, or function logs as needed.

### Security

- **Secrets & Environment Variables**: All sensitive keys (Supabase, API keys, etc.) are stored in environment variables and never committed to the repo. Ensure your `.env*` files are never tracked by git (see `.gitignore`).
- **Reporting Vulnerabilities**: If you discover a security vulnerability, please report it privately to the maintainers. Do not open a public issue.
- **RLS & Database Security**: Row Level Security (RLS) is enabled on all tables. Policies are granular and reviewed regularly for least-privilege access.

### Featured Papers and Case Studies
- [GEN: Supercivilization](./papers/gen-supercivilization.md)
- [SAP: Superachiever](./papers/sap-superachiever.md)
- [SCQ: Superachievers](./papers/scq-superachievers.md)
- [PSP: Personal Success Puzzle](./papers/psp-personal-success.md)
- [BSP: Business Success Puzzle](./papers/bsp-business-success.md)
- [SMS: Supermind Superpowers](./papers/sms-supermind-superpowers.md)
- [SPD: Superpuzzle Developments](./papers/spd-superpuzzle-developments.md)
- [SHE: Superhuman Enhancements](./papers/she-superhuman-enhancements.md)
- [SSA: Supersociety Advancements](./papers/ssa-supersociety-advancements.md)
- [SBG: Supergenius Breakthroughs](./papers/sbg-supergenius-breakthroughs.md)
- See more in [`/papers`](./papers/README.md)

### Supporting Data
- [Onboarding 2025 Metrics](./data/onboarding-2025.json)
- [Governance Logs 2024](./data/governance-logs-2024.json)
- [Knowledge Graph](./data/knowledge-graph.jsonld)

### Feedback, Suggestions, and Peer Review
- [Open an issue](https://github.com/avolve-dao/avolve.io/issues/new/choose) for feedback, suggestions, or to propose new research.
- Join our [Community Discussions](https://github.com/avolve-dao/avolve.io/discussions) to help shape the future of Avolve DAO.

### Repo Navigation
- `/papers` — Token papers, experiments, and governance lessons
- `/docs` — Technical docs, tokenomics, architecture, and onboarding
- `/supabase` — Database schema, migrations, and security policies
- `/hooks`, `/components`, `/pages` — App source code

---

## License

This software and documentation are proprietary and confidential to Avolve DAO. All rights reserved. See [LICENSE](./LICENSE) for details.

*For more, see the [Avolve website](https://avolve.io) or reach out directly. Together, we can co-create a regenerative future!*
