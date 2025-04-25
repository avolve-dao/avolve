# 🗄️ Proposing Schema Changes to the Avolve DAO

_Last updated: 2025-04-15_

## Purpose

This guide explains how to propose, review, and implement changes to the Avolve database schema in a way that is transparent, auditable, and aligned with DAO best practices.

## Principles

- **DAO Ownership:** All schema changes are governed by the Avolve DAO.
- **Best Practices:** Every change must use migrations, enable RLS, and be fully documented.
- **Transparency:** All proposals and changes are tracked in GitHub and reviewed by the DAO.

## Step-by-Step Process

1. **Fork the Repository**
   - Create your own fork of the Avolve codebase.
2. **Create a Migration**
   - Add a new migration in `supabase/migrations/` using the required naming convention (see below).
   - Follow all SQL and documentation best practices.
3. **Update Documentation**
   - Update `docs/database/schema.md` to reflect your changes.
   - If needed, update other relevant docs.
4. **Open a Pull Request**
   - Submit your migration and doc changes as a PR.
   - Include a summary, rationale, and any relevant discussion points.
5. **DAO Review & Approval**
   - PRs are reviewed by the current steward (Joshua Seymour) and/or DAO members.
   - Once the DAO matures, PRs will require community voting.
6. **Merge & Deploy**
   - Approved PRs are merged and deployed.
   - CI/CD will check for schema drift and type safety.

## Migration Naming Convention

- Name migrations as `YYYYMMDDHHmmss_short_description.sql` (UTC time).
- Example: `20250416035000_create_metrics_table.sql`

## Migration Best Practices

- Enable RLS and policies for every table.
- Use lower case and copious comments.
- Include a header comment with purpose, author, and timestamp.

## Resources

- [DAO Governance Guide](./governance.md)
- [Database Schema Reference](../database/schema.md)

## Common Mistakes to Avoid

- Forgetting to enable RLS and policies for new tables
- Using uppercase or inconsistent naming in migrations
- Missing or incomplete migration header comments
- Not updating documentation after a schema change
- Submitting PRs without a rationale or impact summary

For questions or support, contact admin@avolve.io.
