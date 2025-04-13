#!/bin/bash

# List of layout files to update
LAYOUTS=(
  "app/(superachiever)/(business)/layout.tsx"
  "app/(superachiever)/(personal)/layout.tsx"
  "app/(superachiever)/(supermind)/layout.tsx"
  "app/(superachievers)/(supergenius)/layout.tsx"
  "app/(superachievers)/(superhuman)/layout.tsx"
  "app/(superachievers)/(supersociety)/layout.tsx"
  "app/(superachievers)/layout.tsx"
  "app/(supercivilization)/layout.tsx"
)

# Loop through each layout file
for layout in "${LAYOUTS[@]}"; do
  echo "Updating $layout..."
  
  # Replace imports
  sed -i '' -e 's/import { MainNav } from "@\/components\/main-nav"/import { AppNavbar } from "@\/components\/app-navbar"/' "$layout"
  sed -i '' -e '/import { UserNav } from "@\/components\/user-nav"/d' "$layout"
  sed -i '' -e '/import { ThemeToggle } from "@\/components\/theme-toggle"/d' "$layout"
  
  # Replace header section with AppNavbar
  sed -i '' -e 's/<header class.*/<div class="sticky top-0 z-50 w-full">\n              <AppNavbar \/>\n            <\/div>/' "$layout"
  sed -i '' -e '/<div class="container flex h-16 items-center">/,/<\/header>/d' "$layout"
  
  # Wrap with SidebarProviderWrapper
  sed -i '' -e 's/<div class="flex min-h-screen flex-col md:flex-row">/<SidebarProviderWrapper defaultCollapsed={false}>\n        <div class="flex min-h-screen flex-col md:flex-row">/' "$layout"
  sed -i '' -e 's/<\/ThemeProvider>/<\/SidebarProviderWrapper>\n    <\/ThemeProvider>/' "$layout"
  
  # Fix sidebar nesting
  sed -i '' -e 's/<SidebarProviderWrapper defaultCollapsed={false}>\n            <AppSidebar/<AppSidebar/' "$layout"
  sed -i '' -e 's/<\/SidebarProviderWrapper>\n          <\/div>/<\/div>/' "$layout"
done

echo "All layouts updated successfully!"
