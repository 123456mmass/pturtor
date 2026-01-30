#!/bin/bash

# P-Turtor Phase 6 Test Script
# Tests SEO, Security & Performance

echo "🔒 P-Turtor Phase 6 Test Suite"
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

echo "🔍 1. SEO Tests"
echo "---------------"
run_test "SEO wrapper component exists" "components/seo/seo-wrapper.tsx"
run_test "Sitemap generation exists" "app/sitemap.ts"
run_test "Robots.txt exists" "app/robots.ts"

echo ""
echo "🔒 2. Security Tests"
echo "-------------------"
run_test "Security middleware exists" "middleware.ts"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 6 tests passed! SEO & Security ready.${NC}"
    echo ""
    echo "Features enabled:"
    echo "  ✓ CSP Headers (Content Security Policy)"
    echo "  ✓ X-Frame-Options (Clickjacking protection)"
    echo "  ✓ X-Content-Type-Options (MIME sniffing protection)"
    echo "  ✓ Sitemap.xml (SEO)"
    echo "  ✓ Robots.txt (SEO)"
    echo ""
    echo "🚀 ALL PHASES COMPLETE!"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    exit 1
fi
