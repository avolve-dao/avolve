# Onboarding Flow & Delightful Experience

## Overview
Avolve's onboarding is designed to magnetically attract, engage, and delight users and admins, ensuring high completion rates and satisfaction for the first 100–1000 users and beyond.

### Key Features
- Multi-step onboarding wizard (profile, interests, group, explore, celebrate)
- Backend API integration for real-time progress tracking
- Robust error handling and actionable feedback
- Resume onboarding prompt for interrupted users
- Admin dashboard for real-time onboarding status
- Accessibility and mobile responsiveness
- Secure, RLS-enforced onboarding data

## Onboarding Steps
1. **Profile:** Collect user name and update backend
2. **Interests:** Collect interests and update backend
3. **Group:** Select group and update backend
4. **Explore:** Introduce features, mark step complete
5. **Celebrate:** Show celebratory UI and completion

## API Endpoints
- `GET /api/user/profile` — Fetch user profile
- `POST /api/user/profile` — Update name, interests, or group
- `POST /api/onboarding/update-step` — Mark onboarding step complete
- `GET /api/onboarding/progress` — Get onboarding progress for user
- `GET /api/admin/onboarding-status` — Admin: onboarding status for all users

## Admin Experience
- `/admin/users`: Real-time onboarding status table
- See who is stuck, in progress, or completed
- Foundation for onboarding analytics and interventions

## Delightful Details
- Confetti and celebration on completion
- Resume onboarding prompt anywhere in app
- Microinteractions and personalized greetings

## Security
- All onboarding data is protected by RLS
- Policies ensure only users/admins access appropriate data

## Testing
- Automated E2E tests for onboarding and resume flows
- Robust error boundary coverage

## Developer Quickstart
1. Run `pnpm install`
2. Run `pnpm dev` to start the app
3. See `/onboarding` for the onboarding wizard
4. See `/admin/users` for admin onboarding dashboard

---
For more, see [../database/README.md](../database/README.md) and [../../README.md](../../README.md)
