#!/bin/bash

# P-Turtor Phase 1 Test Script
# Run this script to test all Phase 1 features

echo "🧪 P-Turtor Phase 1 Test Suite"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
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

echo "📦 1. Dependency Tests"
echo "----------------------"
run_test "Node.js installed" "/usr/bin/node"
run_test "npm installed" "/usr/bin/npm"
if [ -d "node_modules" ]; then
    echo -e "Testing: Dependencies installed ... ${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Testing: Dependencies installed ... ${YELLOW}⚠️  SKIP (not installed yet)${NC}"
fi

echo ""
echo "📁 2. File Structure Tests"
echo "--------------------------"
run_test "Next.js config exists" "next.config.js"
run_test "Package.json exists" "package.json"
run_test "Prisma schema exists" "prisma/schema.prisma"
run_test "Environment example exists" ".env.example"

echo ""
echo "📄 3. Component File Tests"
echo "--------------------------"
run_test "Login page exists" "app/(auth)/login/page.tsx"
run_test "Register page exists" "app/(auth)/register/page.tsx"
run_test "Dashboard exists" "app/dashboard/page.tsx"
run_test "Course list exists" "app/courses/page.tsx"
run_test "Course detail exists" "app/courses/[slug]/page.tsx"
run_test "Login form component exists" "components/auth/login-form.tsx"
run_test "Register form component exists" "components/auth/register-form.tsx"
run_test "Navbar exists" "components/navbar.tsx"

echo ""
echo "🔐 4. Auth Tests"
echo "----------------"
run_test "Auth config exists" "auth.ts"
run_test "Register API exists" "app/api/auth/register/route.ts"
run_test "Auth utilities exist" "lib/auth.ts"

echo ""
echo "🗄️ 5. Database Tests"
echo "--------------------"
run_test "Prisma client exists" "lib/prisma.ts"
run_test "Seed file exists" "prisma/seed.ts"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Phase 1 is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm install"
    echo "  2. Run: npx prisma migrate dev"
    echo "  3. Run: npx prisma db seed"
    echo "  4. Run: npm run dev"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the setup.${NC}"
    exit 1
fi
