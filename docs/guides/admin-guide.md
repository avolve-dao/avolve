# Avolve Admin Guide (2025 Launch Edition)

## Overview

This guide empowers admins and moderators to manage, secure, and optimize the Avolve platform. It covers all RBAC-protected features, analytics, moderation, content management, security best practices, and onboarding operations.

---

## 1. Admin Dashboard

- Access via `/app/(authenticated)/admin`
- View platform analytics, user stats, and system health
- Track invites sent, accepted, and completed onboarding in the admin dashboard.
- Use quick actions to welcome, nudge, or celebrate new users.
- Dashboard displays recent posts, achievements, and feedback submissions.
- Use filters to review feature requests and user feedback.

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
- All dashboard controls, filters, and tables comply with WCAG 2.2 AA standards.
- Keyboard navigation is fully supported (Tab, Shift+Tab, Enter, Space, Esc).
- ARIA roles and labels are present for all interactive elements, tables, and modals.
- Color contrast meets or exceeds recommended ratios for text and controls.
- All admin actions are operable via keyboard and screen reader.
- Responsive design ensures usability on desktop, tablet, and mobile devices.

### Actions

- **Send Reminder**: Click the button in the Actions column to send a reminder to a user who is stuck or slow in onboarding. Success/failure feedback is provided inline.
- (Planned) **Assign Support**: Future versions will allow assigning an admin or support member to assist a user.
- (Planned) **Mark as Complete**: Admins will be able to manually mark onboarding as complete for a user if needed.
- Welcome new users with a single click.
- Send nudges to users who stall during onboarding.
- Review and approve feature requests from the community.

For more information on onboarding steps and best practices, see [Onboarding Operations Guide](./onboarding-admin.md).

---

## Launch Best Practices for Admins

- **Welcome every new user:** Use the quick action button to send a personalized welcome or encouragement.
- **Monitor onboarding funnel:** Watch for drop-offs and proactively nudge or support users who stall.
- **Celebrate milestones:** Recognize first posts, achievements, and collective unlocks in the feed and dashboard.
- **Respond to feedback:** Review submissions daily and close the loop with users when you ship or act on suggestions.
- **Leverage analytics:** Use the dashboard to spot trends, growth, and opportunities for improvement.
- **Prioritize accessibility:** Ensure all admin and user actions are inclusive and barrier-free.
- **Keep documentation up to date:** Update this guide as new features, flows, or best practices emerge.

---

## Quick Reference

- **Dashboard:** `/app/(authenticated)/admin`
- **User Onboarding Flow:** [onboarding-user.md](./onboarding-user.md)
- **Admin Onboarding Operations:** [onboarding-admin.md](./onboarding-admin.md)
- **Feature Requests & Feedback:** Review and triage in the dashboard or via `/app/(authenticated)/admin/feedback`

---

## Best Practices

- Respond quickly to feedback to keep the community engaged.
- Use analytics to spot drop-off points and iterate rapidly.
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

---

**Avolve's admin experience is designed for speed, clarity, and delight—empowering you to build, moderate, and celebrate a thriving community from day one.**
