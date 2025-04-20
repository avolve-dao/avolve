# Avolve: Regenerative Platform for Transformation

> Avolve is a next-generation, tokenized platform empowering individuals, collectives, and ecosystems to co-create a regenerative future through gamified engagement, transparent governance, and real-time data.

[![License: Avolve DAO](https://img.shields.io/badge/License-Avolve%20DAO-purple)](./LICENSE) [![Join the Community](https://img.shields.io/badge/Community-Discussions-blue)](https://github.com/avolve-dao/avolve.io/discussions)

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

## ⚠️ UI Library Policy: Shadcn/ui Only

> **Important:** This project uses [Shadcn/ui](https://ui.shadcn.com/) as the **exclusive** UI component library. Do not add, use, or install any other UI libraries (including NextUI, MUI, Chakra, etc.) without explicit, written permission from the project owner.
>
> - All UI primitives (Button, Card, Tabs, Badge, Avatar, Input, Textarea, etc.) must come from `/components/ui` (Shadcn/ui).
> - If you find a legacy or custom UI component, refactor it to use Shadcn/ui for consistency.
> - This policy ensures a modern, maintainable, and delightful user/admin experience.

---

## One-Pager

### Purpose
Avolve empowers individuals, collectives, and ecosystems to co-create a regenerative future through transparent research, gamified engagement, and fractal governance.

### Problem
Most people and organizations are stuck in zero-sum, extractive systems (“Anticivilization”), leading to burnout, disengagement, and systemic stagnation. Current platforms focus on features, not transformation, and fail to align incentives or foster genuine collaboration.

### Solution
Avolve is a positive-sum, tokenized platform that transforms the journey from “Degen” to “Regen.” By combining gamified onboarding, real-time feedback, a multi-token system, and transparent governance, Avolve unlocks personal, collective, and ecosystem evolution. The 10-token structure aligns incentives and participation at every level.

### Why Now?
The convergence of Web3, real-time data, and regenerative economics makes it possible to build platforms that reward positive-sum behavior. The world is seeking new models for collaboration, belonging, and impact—Avolve meets this need with a proven, ready-to-launch product.

### Market Potential
Avolve targets individuals, DAOs, collectives, and organizations seeking transformation, engagement, and regenerative impact. The market for regenerative platforms and digital communities is growing rapidly, with new markets emerging for tokenized governance and collective intelligence.

### Competition / Alternatives
Alternatives include traditional social networks, legacy DAO platforms, and gamified learning tools. Avolve’s unique combination of real-time feedback, tokenized governance, and regenerative economics sets it apart. The fractal, multi-token model is unmatched by competitors.

### Business Model
Avolve thrives through a mix of platform fees, token economics, premium features, and ecosystem partnerships. The model is designed for sustainability, growth, and reinvestment into the community.

### Team
Founded by Joshua Seymour and the Avolve DAO, the team brings expertise in product, governance, design, and community building. Contributors span multiple disciplines and geographies.

### Financials
Available upon request.

### Vision
In five years, Avolve will be the leading platform for regenerative transformation, powering a global network of Superachievers, Superachievers, and Supercivilizations—demonstrating that positive-sum systems can outcompete extractive models at scale.

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
