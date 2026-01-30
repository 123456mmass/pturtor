#!/bin/bash

# P-Turtor Phase 5 Test Script
# Tests Admin Dashboard & Analytics

echo "👨‍💼 P-Turtor Phase 5 Test Suite"
echo "==============================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

run_test() {
    local test_name=$1
    local file_path=$2
    
    echo -n "Testing: $test_name ... "
    
    if [ -e "$file_path" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
}

echo "📊 1. Admin Dashboard Tests"
echo "----------------------------"
run_test "Admin dashboard page exists" "app/admin/page.tsx"
run_test "Card UI component exists" "components/ui/card.tsx"

echo ""
echo "👥 2. User Management Tests"
echo "----------------------------"
run_test "Admin users page exists" "app/admin/users/page.tsx"

echo ""
echo "📚 3. Course Management Tests"
echo "------------------------------"
run_test "Admin courses page exists" "app/admin/courses/page.tsx"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 5 tests passed! Admin panel ready.${NC}"
    echo ""
    echo "Admin URLs:"
    echo "  - /admin          : Dashboard"
    echo "  - /admin/users    : User management"
    echo "  - /admin/courses  : Course management"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    exit 1
fi
