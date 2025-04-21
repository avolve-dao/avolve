#!/bin/bash
# Clean up unnecessary .md documentation files for launch
# Run from the project root: bash scripts/clean_docs.sh

set -e

# Remove 'To be completed' or placeholder docs
rm -f docs/ui/README.md

# Remove docs not referenced in main README or onboarding
# (add more as needed based on manual review)

# Example: Remove old/duplicate onboarding docs
rm -f docs/admin-onboarding.md
rm -f docs/dao/onboarding.md

# Example: Remove any other obsolete or unreferenced .md files here
# (extend this list as you finalize the new docs structure)

# Print summary

echo "✅ Documentation clean-up complete. Review your /docs and README for accuracy!"
