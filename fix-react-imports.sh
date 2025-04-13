#!/bin/bash

# Find all TypeScript and TSX files with the type-only React import
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "import type React from \"react\"" {} \; | while read -r file; do
  # Replace the type-only import with the namespace import
  sed -i '' 's/import type React from "react"/import * as React from "react"/g' "$file"
  echo "Fixed: $file"
done

echo "All React imports have been fixed!"
