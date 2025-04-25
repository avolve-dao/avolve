#!/bin/bash
# Test runner script for Avolve platform
# Updated: April 2025

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Avolve Platform Test Suite${NC}"

# Function to run a test and report status
run_test() {
  local test_name=$1
  local test_command=$2
  
  echo -e "\n${YELLOW}Running $test_name tests...${NC}"
  
  if eval $test_command; then
    echo -e "${GREEN}✓ $test_name tests passed${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_name tests failed${NC}"
    return 1
  }
}

# Check if specific test type is requested
if [ "$1" ]; then
  TEST_TYPE=$1
else
  TEST_TYPE="all"
fi

# Track failures
FAILURES=0

# Unit Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "unit" ]]; then
  run_test "Unit" "NODE_OPTIONS=--experimental-vm-modules pnpm test:unit" || ((FAILURES++))
fi

# Integration Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "integration" ]]; then
  run_test "Integration" "NODE_OPTIONS=--experimental-vm-modules pnpm test:integration" || ((FAILURES++))
fi

# E2E Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "e2e" ]]; then
  run_test "E2E" "pnpm test:e2e" || ((FAILURES++))
fi

# Security Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "security" ]]; then
  run_test "Security" "NODE_OPTIONS=--experimental-vm-modules pnpm test:security" || ((FAILURES++))
fi

# API Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "api" ]]; then
  run_test "API" "NODE_OPTIONS=--experimental-vm-modules pnpm test:api" || ((FAILURES++))
fi

# Accessibility Tests
if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "accessibility" ]]; then
  run_test "Accessibility" "pnpm test:accessibility" || ((FAILURES++))
fi

# Report summary
echo -e "\n${YELLOW}Test Summary:${NC}"
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}$FAILURES test suites failed.${NC}"
  exit 1
fi
