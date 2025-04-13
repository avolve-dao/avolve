#!/bin/bash

# Script to update all npm dependencies to latest versions

echo "Updating all dependencies to latest versions..."
npm install -g npm
npm update --save

echo "Dependencies updated. Now running npm audit fix..."
npm audit fix --force

echo "Dependency update and vulnerability fix complete."
