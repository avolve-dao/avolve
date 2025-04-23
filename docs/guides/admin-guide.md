# Admin Guide

## Overview
This guide empowers admins and moderators to manage, secure, and optimize the Avolve platform. It covers all RBAC-protected features, analytics, moderation, content management, security best practices, and onboarding operations.

---

## 1. Admin Dashboard
- Access via `/app/(authenticated)/admin`
- View platform analytics, user stats, and system health

## 2. User & Role Management
- Add, remove, or update users and roles
- Assign admin/moderator privileges
- Audit logs for sensitive actions
- All RBAC logic is enforced via Supabase policies and middleware

## 3. Content & Moderation
- Manage user-generated content (UGC)
- Approve, reject, or flag submissions
- Tools for community moderation and feedback

## 4. Security & Compliance
- Security headers and CSP
- Rate limiting on sensitive routes
- RLS (Row Level Security) on all tables
- Regular audits and logging

## 5. Analytics & Reporting
- Platform analytics dashboard
- Export reports for usage, growth, and engagement

## 6. Onboarding Operations
- See [onboarding-user.md](./onboarding-user.md) for the user onboarding flow and troubleshooting.
- See [onboarding-admin.md](./onboarding-admin.md) for admin onboarding monitoring, intervention, and delegation best practices.
- Use the Admin Dashboard to monitor onboarding progress and intervene/support as needed.

## Onboarding Dashboard

The onboarding dashboard provides a comprehensive, accessible overview of all users' onboarding progress. Admins can:

- **Filter** users by onboarding step, role, and completion status.
- **Sort** users by any column (email, name, role, date joined, current step, completed steps, completed at).
- **Send onboarding reminders** directly from the dashboard (see the Actions column).
- **Keyboard navigation**: All filters, table headers, and action buttons are accessible via keyboard. Use Tab/Shift+Tab to move between controls and Enter to activate.
- **Screen reader support**: All controls and table headers have descriptive ARIA labels and roles. Status changes are announced for assistive technologies.
- **Tooltips and inline help**: Filters and actions provide tooltips for clarity.

### Accessibility Standards

- Visible focus indicators on all interactive elements.
- ARIA roles and labels for all controls and table headers.
- Live region announcements for errors and status updates.
- High color contrast for text and controls.

### Actions

- **Send Reminder**: Click the button in the Actions column to send a reminder to a user who is stuck or slow in onboarding. Success/failure feedback is provided inline.
- (Planned) **Assign Support**: Future versions will allow assigning an admin or support member to assist a user.
- (Planned) **Mark as Complete**: Admins will be able to manually mark onboarding as complete for a user if needed.

For more information on onboarding steps and best practices, see [Onboarding Operations Guide](./onboarding-admin.md).

---

## Best Practices
- Use strong, unique passwords and enable 2FA (if available)
- Review audit logs regularly
- Follow least-privilege principle for role assignments
- Keep documentation up to date

---

## Troubleshooting
- If you lose access, contact another admin or support
- For RBAC or policy issues, see [../database-schema.md](../database-schema.md)

---

## How to Contribute
See [../contributing.md](../contributing.md) for guidelines on improving admin tools or documentation.
