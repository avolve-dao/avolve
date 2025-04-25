# Avolve Documentation

_Last updated: 2025-04-16_

> 💡 **Suggest an Improvement:** [Open an issue](https://github.com/avolve-dao/avolve.io/issues/new/choose) to help us make these docs even better!

# Welcome to Avolve Docs

🎉 **What’s New:**

- Refined onboarding for users/admins
- Visual ER diagrams and token structure
- Troubleshooting, FAQ, and support in every major doc
- Feedback badges everywhere

Copyright 2025 Avolve DAO. All rights reserved.

## Overview

Welcome to the Avolve platform documentation. This guide provides comprehensive information about the platform's architecture, development practices, and implementation details.

## How to Use This Documentation

- Start here if you're new to Avolve or want a high-level overview.
- Use the Table of Contents below to jump to guides, technical docs, and reference material.
- Each section links to more detailed documentation.
- For help, see the [Developer Guide](guides/developer-guide.md) or [User Guide](guides/user-guide.md).

## 🌟 Why Use Avolve?

Curious what makes Avolve unique for users and admins? [Read the Why Avolve page.](./why-avolve.md)

## Table of Contents

### Guides

- [Developer Guide](guides/developer-guide.md) - Complete guide for developers
- [Contributing Guide](guides/contributing.md) - How to contribute to the project
- [Quick Start Guide](guides/quick-start.md) - Get up and running quickly

### Technical Documentation

- [Database Documentation](database/schema.md) - Database schema and best practices
- [API Documentation](api/README.md) - API endpoints and usage
- [Navigation System](navigation-system.md) - Route structure and navigation
- [Experience Phases](EXPERIENCE-PHASES.md) - Experience system implementation
- [Token System](TOKEN-SYSTEM.md) - Token economy documentation

### Architecture

- [Architecture Overview](architecture.md) - System architecture and design
- [Security Guidelines](enhanced-authentication.md) - Security implementation
- [Performance Optimization](database/performance.md) - Performance best practices

### Additional Resources

- [UI Components](ui/README.md) - Component library documentation
- [Testing Guide](testing/README.md) - Testing strategies and practices
- [Deployment Guide](deployment/README.md) - Deployment procedures

## Directory Structure

```
docs/
├── api/              # API documentation
├── database/         # Database documentation
├── guides/           # Developer guides
├── ui/              # UI component docs
├── testing/         # Testing documentation
└── deployment/      # Deployment guides
```

## Contributing

Please read our [Contributing Guide](guides/contributing.md) for details on our code of conduct and the process for submitting pull requests.

## License

Copyright 2025 Avolve DAO. All rights reserved.

# Avolve Platform: Production-Ready Guide (2025)

## Overview
Avolve is a next-generation platform for superachievers and communities, designed for rapid onboarding, engagement, and delight. This guide covers best practices, usage patterns, and reference examples for developers and admins.

---

## 1. Database Utilities & Patterns

- **Use standardized DB utilities:**
  - All database operations should use `/lib/supabase/db-utils.ts` and `/lib/supabase/client.ts`.
  - Example:
    ```typescript
    import { executeQuery } from '@/lib/supabase/db-utils';
    const { data, error } = await executeQuery(() =>
      supabase.from('profiles').select('*').eq('id', userId)
    );
    ```
- **RLS & Security:**
  - All tables have Row Level Security (RLS) enabled.
  - Policies are granular for `anon` and `authenticated` roles.

---

## 2. Role-Based Access Control (RBAC)

- **RBAC utilities:**
  - Use `/lib/supabase/rbac.ts` for all role and permission checks.
  - Example:
    ```typescript
    import { hasRole } from '@/lib/supabase/rbac';
    const isAdmin = await hasRole(userId, 'admin');
    ```

---

## 3. Form Validation

- **Schema-based validation:**
  - Use Zod schemas in `/lib/utils/form-validation.ts` and `/lib/validators/`.
  - Example:
    ```typescript
    import { feedbackFormSchema } from '@/lib/validators/feedback';
    feedbackFormSchema.parse({ comment: 'Great!', rating: 5 });
    ```
- **Standardized Form Components:**
  - Use `/components/ui/form.tsx` for all forms.
  - Example:
    ```tsx
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
    ```

---

## 4. UI Components

- **Use standardized primitives:**
  - `PrimaryButton`, `CustomTooltip`, `FormField`, `ProgressIndicator`, etc.
  - Example:
    ```tsx
    <PrimaryButton loading={isLoading} onClick={handleClick}>Continue</PrimaryButton>
    <CustomTooltip content="Helpful info">Hover me</CustomTooltip>
    ```

---

## 5. Onboarding & Feature Flags

- **Onboarding:**
  - Use `OnboardingContainer`, `DashboardTour`, and `ProgressIndicator` for a delightful first-user experience.
- **Feature Flags:**
  - All new features are toggleable and tracked for analytics.

---

## 6. Testing & Automation

- **E2E & Integration Testing:**
  - Use Playwright or Cypress for E2E, Jest for unit/integration.
  - Example test:
    ```typescript
    // Jest
    it('should return user profile', async () => {
      const { data } = await executeQuery(() =>
        supabase.from('profiles').select('*').eq('id', userId)
      );
      expect(data).toBeDefined();
    });
    ```
- **CI/CD:**
  - All PRs run lint, type-check, and tests automatically.

---

## 7. Admin & User Docs

- **Admin onboarding:**
  - Invite users, manage features, view analytics via the admin dashboard.
- **User help:**
  - In-app guides, tooltips, and feedback forms are available for all users.

---

## 8. Mobile-Ready Architecture

- **Shared logic:**
  - All business logic and API integrations are centralized for web and mobile (React Native/Expo).

---

## 9. Backup, Rollback & Monitoring

- **Automated database backups** and tested rollback procedures.
- **Error logging** and performance monitoring are active in production.

---

## 10. Launch Checklist

- [x] All legacy DB utilities and validation logic removed
- [x] All forms/components use standardized utilities
- [x] Documentation is complete and up to date
- [x] E2E and integration tests cover all critical flows
- [x] RLS and RBAC policies are enforced and tested
- [x] Feature flags and analytics are in place
- [x] Mobile-ready architecture is validated
- [x] Automated backups and error monitoring are active

---

For questions or contributions, see the [CONTRIBUTING.md](./CONTRIBUTING.md) or contact the core team.
