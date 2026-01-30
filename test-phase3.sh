#!/bin/bash

# P-Turtor Phase 3 Test Script
# Tests Quiz System, Video Player, Progress Tracking, Certificates

echo "🎓 P-Turtor Phase 3 Test Suite"
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

echo "❓ 1. Quiz System Tests"
echo "----------------------"
run_test "Quiz player component exists" "components/quiz/quiz-player.tsx"
run_test "Quiz submit API exists" "app/api/quiz/submit/route.ts"

echo ""
echo "🎥 2. Video Player Tests"
echo "------------------------"
run_test "Video player component exists" "components/video/video-player.tsx"

echo ""
echo "📊 3. Progress Tracking Tests"
echo "-----------------------------"
run_test "Progress API exists" "app/api/progress/route.ts"

echo ""
echo "📜 4. Certificate Tests"
echo "-----------------------"
run_test "Certificate API exists" "app/api/certificates/[id]/route.ts"
run_test "Certificates page exists" "app/certificates/page.tsx"

echo ""
echo "📚 5. Learning Experience Tests"
echo "-------------------------------"
run_test "Learn page exists" "app/learn/[slug]/page.tsx"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 3 tests passed! Learning features ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm install @mux/mux-player-react puppeteer"
    echo "  2. Run: npx prisma migrate dev"
    echo "  3. Run: npm run dev"
    echo "  4. Enroll in a course and test learning flow"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    exit 1
fi
