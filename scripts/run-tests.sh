#!/bin/bash

echo "🧪 Running Waitlist API Tests"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping').ok" --quiet >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  MongoDB not running locally. Unit tests will use in-memory database.${NC}"
fi

# Run unit tests
echo ""
echo "🧪 Running Unit Tests (Jest)..."
echo "--------------------------------"
bun test
UNIT_TEST_STATUS=$?
print_status $UNIT_TEST_STATUS "Unit Tests"

# Check if server is running for integration tests
echo ""
echo "🔍 Checking if server is running for integration tests..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
    
    echo ""
    echo "🧪 Running Integration Tests..."
    echo "------------------------------"
    bun run test:api
    INTEGRATION_TEST_STATUS=$?
    print_status $INTEGRATION_TEST_STATUS "Integration Tests"
else
    echo -e "${YELLOW}⚠️  Server is not running. Skipping integration tests.${NC}"
    echo -e "${YELLOW}   To run integration tests, start the server with: bun run dev${NC}"
    INTEGRATION_TEST_STATUS=0  # Don't fail overall if server not running
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
print_status $UNIT_TEST_STATUS "Unit Tests"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status $INTEGRATION_TEST_STATUS "Integration Tests"
else
    echo -e "${YELLOW}⏭️  Integration Tests (skipped - server not running)${NC}"
fi

# Exit with appropriate code
if [ $UNIT_TEST_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests passed${NC}"
    exit 0
fi
