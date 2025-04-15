# Admin Guide

## Overview
This guide empowers admins and moderators to manage, secure, and optimize the Avolve platform. It covers all RBAC-protected features, analytics, moderation, content management, and security best practices.

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
