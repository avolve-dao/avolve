# Onboarding Troubleshooting Guide

## Common Issues & Solutions

### 1. Onboarding Wizard Not Loading
- **Check:** Network tab for failed API calls (`/api/user/profile`, `/api/onboarding/update-step`).
- **Solution:** Ensure Supabase keys are correct and database is migrated.

### 2. Resume Prompt Not Appearing
- **Check:** User onboarding progress in `user_onboarding` table.
- **Solution:** Ensure incomplete steps; check `/api/onboarding/progress` returns expected data.

### 3. Admin Dashboard Not Showing Users
- **Check:** `/api/admin/onboarding-status` endpoint and RLS policies.
- **Solution:** Admin must have correct role; verify RLS and Supabase policies.

### 4. Confetti or Animations Not Working
- **Check:** Browser console for errors; ensure `canvas-confetti` is installed.
- **Solution:** Reinstall dependencies and rebuild.

### 5. Accessibility Issues
- **Check:** Use keyboard navigation and screen readers.
- **Solution:** Ensure all buttons/fields have ARIA labels and are focusable.

## How to Get Help
- Open an issue in the repo with details and screenshots/logs.
- Tag your issue with `onboarding` for fastest response.

---
For more, see [README.md](./README.md) and [../database/README.md](../database/README.md)
