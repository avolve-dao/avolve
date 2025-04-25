# Avolve API Reference

This document provides a high-level overview of the Avolve API endpoints and usage.

---

## Authentication

- All endpoints require a valid Supabase JWT unless marked as public.

## Main Endpoints

- `/api/auth` — Login, registration, password reset
- `/api/profile` — User profile CRUD
- `/api/token` — Token balance, claim, and transfer
- `/api/challenges` — List and participate in challenges
- `/api/analytics` — Admin analytics endpoints

## Example Usage

```typescript
fetch('/api/token', {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

For full details, see the OpenAPI spec or contact the dev team.
