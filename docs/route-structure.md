# Route Structure and Folder Mapping (2025)

## Main Route Groups
- (auth): Authentication flows (login, signup, password reset, etc.)
- (unauthenticated): Public, onboarding, and welcome flows
- (authenticated): General authenticated user features
- (superachiever): Individual journey
- (superachievers): Collective journey
- (supercivilization): Ecosystem journey

## Folder Mapping
- onboarding/ and welcome/ → (unauthenticated)/onboarding/, (unauthenticated)/welcome/
- profile/, subscription/, teams/, tokens/, participation/ → (authenticated)/...
- admin/, dashboard/, developer-portal/ → (authenticated)/... or (admin)/... (if RBAC distinct)
- api/, actions/, components/ remain top-level (see below)

## Special Cases
- api/: Universal backend endpoints for all route groups. Remains top-level for clarity and universal access.
- actions/, components/: Shared utilities/UI. Remain top-level for reusability.

## Navigation & Breadcrumbs
- Navigation and breadcrumbs should always reflect the user's journey context.

## Criteria for Folder Placement
- Place features under (authenticated) unless they are journey-specific or require a distinct admin group.
- Use (super) only for cross-cutting/experimental features.

---

This structure ensures clarity, future-proofing, and alignment with Avolve's core journeys and values.
