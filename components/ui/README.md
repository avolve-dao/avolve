# Shadcn/ui-Only Policy for UI Components

**This directory contains the only permitted UI primitives for the Avolve platform.**

## 🚨 Policy

- All UI components used in the project (Button, Card, Tabs, Badge, Avatar, Input, Textarea, etc.) **must** be imported from this directory.
- Do **not** add or use any other UI libraries (NextUI, MUI, Chakra, etc.) without explicit, written permission from the project owner.
- If you find a legacy or custom UI component, refactor it to use Shadcn/ui for consistency.

## Rationale

- Ensures a modern, maintainable, and delightful user/admin experience.
- Prevents UI fragmentation, bloat, and inconsistent design.

## How to Add New UI Components

- Follow the Shadcn/ui pattern and add new primitives here if you need them.
- Update this README if the policy changes.

---

**Questions?** Ask in the main repo or contact the project owner before introducing any new UI dependencies.
