#!/bin/bash
# Final clean-up script for Avolve production launch
# Deletes files/folders not needed for production, double-checks .gitignore, and prepares for a clean build/test

set -e

# Remove environment files that should not be tracked
rm -f .env .env.local

# Remove test/demo/legacy files
rm -f test-database.js test-integration.js test-refactored-system.js test.css eslint-report.txt v0-user-next.config.js resolved-config.json

# Remove unused config (keep only one PostCSS config)
if [ -f postcss.config.mjs ]; then
  rm -f postcss.config.js
else
  rm -f postcss.config.mjs
fi

# Remove dist-sim if not needed for production
rm -rf dist-sim

# Remove/Archive data and results directories if not needed
rm -rf data results

# Remove legacy or test scripts
rm -rf tests

# DO NOT REMOVE papers/ directory; it is required for launch and reference
# rm -rf papers

# Remove packages if not actively used
rm -rf packages

# Remove any update/fix scripts if not needed
rm -f update-dependencies.sh update_all_layouts.sh update_layouts.sh fix-react-imports.sh

# Double-check .gitignore for sensitive files
if ! grep -q '^.env$' .gitignore; then
  echo '.env' >> .gitignore
fi
if ! grep -q '^.env.local$' .gitignore; then
  echo '.env.local' >> .gitignore
fi

# Print summary

echo "✅ Final cleanup complete. Ready for a clean build and test!"
