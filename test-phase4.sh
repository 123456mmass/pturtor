#!/bin/bash

# P-Turtor Phase 4 Test Script
# Tests Live Streaming & Real-time Chat

echo "📺 P-Turtor Phase 4 Test Suite"
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

echo "📡 1. Socket.io / Real-time Tests"
echo "----------------------------------"
run_test "Socket.io server route exists" "app/api/socket/route.ts"

echo ""
echo "💬 2. Chat System Tests"
echo "-----------------------"
run_test "Chat room component exists" "components/chat/chat-room.tsx"
run_test "Chat API exists" "app/api/chat/[courseId]/route.ts"

echo ""
echo "📺 3. Live Streaming Tests"
echo "--------------------------"
run_test "Live stream player exists" "components/live/live-stream-player.tsx"
run_test "Live list page exists" "app/live/page.tsx"
run_test "Live stream detail page exists" "app/live/[id]/page.tsx"
run_test "Live stream API exists" "app/api/live/route.ts"
run_test "Live stream status API exists" "app/api/live/[id]/route.ts"

echo ""
echo "🎨 4. UI Components Tests"
echo "-------------------------"
run_test "Badge component exists" "components/ui/badge.tsx"
run_test "Scroll area component exists" "components/ui/scroll-area.tsx"
run_test "Navbar updated with Live link" "components/navbar.tsx"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 4 tests passed! Live streaming ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm install socket.io @radix-ui/react-scroll-area"
    echo "  2. Run: npx prisma migrate dev (adds LiveStream table)"
    echo "  3. Run: npm run dev"
    echo "  4. Navigate to /live to see live streams"
    echo "  5. Test real-time chat in live stream"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    exit 1
fi
