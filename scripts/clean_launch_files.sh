#!/bin/bash
# Clean up test/demo files for launch
# Run from the project root: bash scripts/clean_launch_files.sh

set -e

# Remove test files
rm -f lib/feature-flags/feature-flags.test.tsx
rm -f lib/token/token-claim.test.ts
rm -f tests/onboarding/onboarding-flow.test.ts
rm -f tests/api/community-milestones.test.ts
rm -f scripts/load_test.js

# Remove onboarding/testing/migration docs not needed for MVP
test -f docs/admin-onboarding.md && rm docs/admin-onboarding.md
test -f docs/dao/onboarding.md && rm docs/dao/onboarding.md
test -d docs/onboarding && rm -rf docs/onboarding
test -d docs/testing && rm -rf docs/testing
test -d docs/migrations && rm -rf docs/migrations

# Remove scenario files if not needed for launch
rm -f scenarios/abuse-whale.json scenarios/normal-growth.json scenarios/viral-growth.json

echo "✅ Launch clean-up complete. Review your repo and commit the changes!"
