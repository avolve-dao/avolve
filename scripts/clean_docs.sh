#!/bin/bash
# Clean up unnecessary .md documentation files for launch
# Run from the project root: bash scripts/clean_docs.sh

set -e

# Remove 'To be completed' or placeholder docs
rm -f docs/ui/README.md

# Remove docs not referenced in main README or onboarding
# (add more as needed based on manual review)

# Remove duplicate onboarding/admin guides
rm -f ../../docs/guides/onboarding-admin.md ../../docs/guides/onboarding-user.md
# Remove placeholder/legacy files
rm -f ../../docs/PRE_LAUNCH_CHECKLIST.md
# Remove any .md files in docs/ not referenced in ../../README.md or ONBOARDING_CHECKLIST.md

# Print summary

echo "✅ Documentation clean-up complete. Review your /docs and README for accuracy!"
