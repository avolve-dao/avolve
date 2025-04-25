# Avolve: Regenerative Platform for Transformation

> Avolve is a next-generation, tokenized platform empowering individuals, collectives, and ecosystems to co-create a regenerative future through gamified engagement, transparent governance, and real-time data.

[![License: Avolve DAO](https://img.shields.io/badge/License-Avolve%20DAO-purple)](./LICENSE) [![Join the Community](https://img.shields.io/badge/Community-Discussions-blue)](https://github.com/avolve-dao/avolve.io/discussions)

---

## 🚀 Quick Start for New Users & Admins

1. **Clone the repository:**
   ```sh
   git clone https://github.com/avolve-dao/avolve.io.git
   cd avolve.io
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   ```
3. **Copy and configure environment variables:**
   ```sh
   cp .env.example .env.local
   # Fill in all required values in .env.local (see Environment Variables section below)
   ```
4. **Start the development server:**
   ```sh
   pnpm dev
   ```
5. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **First 5 things to do after joining:**
   - Complete your profile and intention setup
   - Make your first post in the Supercivilization Feed
   - Explore the Collective Progress Bar and track community actions
   - Try the feedback widget and leave a suggestion
   - Invite a friend or fellow admin to join the onboarding flow

---

## 🌟 Key Features (2025 Launch)

Avolve includes robust, accessible, and delightful features designed to magnetically attract, engage, and delight users:

### Invitation-Only Onboarding

- **Exclusive Access:** Invitation-only platform with unique invitation codes
- **Request System:** Waitlist and invitation request system for new users
- **Admin Controls:** Comprehensive invitation management for administrators
- **Analytics:** Track invitation usage, acceptance rates, and user acquisition

### Feature Flag System

- **Progressive Unlocks:** Gradual feature unlocking based on user engagement
- **Token Requirements:** Features unlockable with token achievements
- **Percentage Rollouts:** Controlled feature rollouts to specific user segments
- **Admin Dashboard:** Complete feature flag management for administrators

### Peer Recognition

- **Thank a Peer Modal:** Accessible modal with message, badge, and user search/autocomplete
- **Real-Time Recognition Feed:** Instant updates with Supabase Realtime
- **Celebratory Feedback:** Confetti animations and toast notifications for engagement

### Supercivilization Feed

- Purposeful community feed with prompted posts and micro-rewards
- Personal progress tracker and collective progress bar
- Fast first unlock and achievement system

### Onboarding Experience

- Quick identity/intention setup
- In-app tooltips, onboarding wizard, and dashboard tour
- Sidebar with locked/teased features for progression clarity

### Governance & Tokenomics

- Transparent, fractal governance system
- Positive-sum tokenomics with micro-rewards
- Real-time analytics and feedback loops

---

## 📋 Environment Variables

| Variable                        | Required | Purpose                                         | Where to Get/Set          |
| ------------------------------- | -------- | ----------------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Public Supabase project URL (frontend)          | Supabase Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Public anon key for Supabase (frontend)         | Supabase Project Settings |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Service role key for admin operations           | Supabase Project Settings |
| `SUPABASE_URL`                  | No       | Backend Supabase URL (if different from public) | Supabase Project Settings |
| `OPENAI_API_KEY`                | Optional | OpenAI API key for AI features                  | OpenAI Dashboard          |
| `NEXT_PUBLIC_SITE_URL`          | No       | Public site URL (for Vercel, etc)               | Deployment Platform       |

> **Important:** Never commit `.env.local` or real secrets to git. Only `.env.example` should be tracked.

---

## 🛠️ Development & Testing

### Running Locally

```sh
pnpm dev
```

### Building for Production

```sh
pnpm build
```

### Testing

Avolve uses a streamlined testing approach focused on Next.js, Vercel, and Supabase:

```sh
# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e         # End-to-End tests with Playwright
pnpm test:security    # Security tests
pnpm test:api         # API endpoint tests
pnpm test:accessibility # Accessibility tests
```

Our testing strategy includes:

- **Unit Tests**: Core business logic using Jest
- **Integration Tests**: API and component integration
- **E2E Tests**: User flows with Playwright
- **Security Tests**: RLS policies and middleware protections
- **Accessibility Tests**: WCAG compliance checks

> Note: Ensure Docker Desktop is running for local Supabase tests.

### Linting & Formatting

```sh
pnpm lint
pnpm exec prettier --write .
```

---

## 📂 Project Structure

Avolve is designed for maintainability, clarity, and DRY principles:

### Key Directories

- `/app`: Next.js application routes and pages
  - `/app/api`: API routes for invitations, onboarding, and feature flags
- `/components`: Reusable React components
  - `/components/invitation`: Invitation management components
  - `/components/feature-flags`: Feature flag components and gates
  - `/components/onboarding`: Onboarding flow components
  - `/components/providers`: Context providers including FeatureFlagProvider
- `/hooks`: Custom React hooks
  - `/hooks/useFeatureFlags.ts`: Hook for feature flag management
- `/lib`: Utility functions and services
- `/public`: Static assets
- `/styles`: Global styles and Tailwind config
- `/supabase`: Database migrations, schemas, and functions
  - `/supabase/migrations`: Database migrations including invitation and feature flag systems
- `/types`: TypeScript type definitions
  - `/types/database-extensions.ts`: Extended database types for RPC functions
- `/scripts`: Utility scripts including e2e testing
- `/docs`: Documentation including launch guide

### Database (Supabase)

- Managed via migrations in `/supabase/migrations` (follows Supabase best practices)
- RLS enabled with granular policies for all tables
- Types auto-generated in `/types/supabase.ts` and extended in `/types/database-extensions.ts`
- Edge functions in `/supabase/functions`

---

## 📚 Documentation

- [Launch Guide](docs/LAUNCH_GUIDE.md) - **NEW**: Comprehensive guide for platform launch
- [User Onboarding Guide](docs/guides/onboarding-user.md)
- [Admin Onboarding Guide](docs/guides/onboarding-admin.md)
- [Invitation System](docs/features/invitation-system.md)
- [Feature Flags](docs/features/feature-flags.md)
- [Database Schema](docs/database/README.md)
- [API Documentation](docs/api/README.md)
- [Security Guidelines](docs/security/README.md)

---

## 🚀 Launch Preparation

Before launching the platform to users, ensure you complete the [Launch Checklist](docs/LAUNCH_GUIDE.md#-launch-checklist):

1. Run end-to-end tests to verify all functionality
2. Check for any remaining TypeScript or lint errors
3. Review environment variables for production
4. Verify email delivery in production
5. Test analytics integration
6. Perform a final security review

Once the checklist is complete, you're ready to launch the platform and begin onboarding your first users!

---

## 🤝 Contributing & Support

- Open an [issue on GitHub](https://github.com/avolve-dao/avolve.io/issues)
- Email support: support@avolve.io
- Maintainer: @avolve-dao

---

## 📝 License

Avolve is licensed under the Avolve DAO License. See [LICENSE](./LICENSE) for details.

---

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Supabase (PostgreSQL + Functions)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Testing**: Jest, Playwright

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+
- Supabase CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/avolve-dao/avolve.io.git
   cd avolve
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required environment variables in `.env.local`.

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Testing Strategy

The Avolve platform uses a comprehensive testing approach:

### Unit Tests

Unit tests focus on individual components and functions:

```bash
pnpm test:unit
```

### Integration Tests

Integration tests verify that different parts of the system work together:

```bash
pnpm test:integration
```

### End-to-End Tests

E2E tests simulate real user interactions:

```bash
pnpm test:e2e
```

### Security Tests

Security tests verify that RLS policies and middleware protections are working:

```bash
pnpm test:security
```

### API Tests

API tests validate API endpoints:

```bash
pnpm test:api
```

### Accessibility Tests

Accessibility tests ensure the platform is usable by all:

```bash
pnpm test:accessibility
```

### Running All Tests

To run all tests:

```bash
pnpm test:all
```

## Database Migrations

### Creating a Migration

```bash
supabase migration new my_migration_name
```

### Applying Migrations

```bash
pnpm db:migrate
```

### Generating Types

```bash
pnpm db:types
```

## Onboarding Process

The Avolve platform uses an invitation-only onboarding process:

1. **Invitation**: Users receive an invitation code
2. **Registration**: Users create an account with the invitation code
3. **Identity Setup**: Users set up their profile and intentions
4. **First Unlock**: Users complete initial tasks to unlock their first feature
5. **Community Integration**: Users join the Supercivilization feed

## Launch Preparation

For preparing the platform for launch:

1. Ensure all tests pass: `pnpm test:all`
2. Run linting: `pnpm lint`
3. Format code: `pnpm format`
4. Build the application: `pnpm build`
5. Verify RLS policies are in place for all tables
6. Seed initial community activity

## Documentation

Additional documentation can be found in the `docs/` directory:

- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Mobile App Integration Plan](docs/MOBILE_APP_INTEGRATION_PLAN.md)

## License

Proprietary - All rights reserved
