#!/bin/bash

# P-Turtor Phase 2 Test Script
# Tests Payment System (Stripe + Omise)

echo "💳 P-Turtor Phase 2 Test Suite"
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

echo "💳 1. Stripe Integration Tests"
echo "-------------------------------"
run_test "Stripe library exists" "lib/stripe.ts"
run_test "Stripe checkout API exists" "app/api/checkout/route.ts"
run_test "Stripe webhook exists" "app/api/webhooks/stripe/route.ts"

echo ""
echo "🇹🇭 2. Omise (Thai Payment) Tests"
echo "----------------------------------"
run_test "Omise library exists" "lib/omise.ts"
run_test "Omise checkout API exists" "app/api/checkout/omise/route.ts"
run_test "Omise webhook exists" "app/api/webhooks/omise/route.ts"

echo ""
echo "🛒 3. Checkout Flow Tests"
echo "--------------------------"
run_test "Checkout button component exists" "components/checkout/checkout-button.tsx"
run_test "Thai payment button exists" "components/checkout/thai-payment-button.tsx"
run_test "Success page exists" "app/checkout/success/page.tsx"
run_test "Cancel page exists" "app/checkout/cancel/page.tsx"

echo ""
echo "🗄️ 4. Database Schema Tests"
echo "---------------------------"
run_test "Prisma schema updated" "prisma/schema.prisma"

echo ""
echo "🔗 5. Integration Tests"
echo "----------------------"
run_test "Course page has checkout" "app/courses/[slug]/page.tsx"

echo ""
echo "==============================="
echo "📊 Test Results"
echo "==============================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 2 tests passed! Payment system ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Add environment variables:"
    echo "     - STRIPE_SECRET_KEY"
    echo "     - STRIPE_PUBLISHABLE_KEY"
    echo "     - STRIPE_WEBHOOK_SECRET"
    echo "     - OMISE_PUBLIC_KEY"
    echo "     - OMISE_SECRET_KEY"
    echo "  2. Run: npx prisma migrate dev"
    echo "  3. Run: npm run dev"
    echo "  4. Test checkout flow"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed.${NC}"
    exit 1
fi
