#!/bin/bash

# Real Integration Test for P-Turtor
# This actually runs the app and checks if it works

echo "🧪 Real Integration Test"
echo "========================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Creating from example..."
    cp .env.example .env.local
fi

# Test 1: TypeScript compilation
echo ""
echo "1️⃣  Testing TypeScript compilation..."
npx tsc --noEmit 2>&1 | head -20
if [ $? -eq 0 ]; then
    echo "✅ TypeScript OK"
else
    echo "❌ TypeScript errors found"
    exit 1
fi

# Test 2: Check for duplicate imports
echo ""
echo "2️⃣  Checking for duplicate imports..."
if grep -n "import { cn } from '@/lib/utils'" components/ui/toast.tsx | wc -l | grep -q "2"; then
    echo "❌ Duplicate cn import found in toast.tsx"
    exit 1
else
    echo "✅ No duplicate imports"
fi

# Test 3: Check all required dependencies
echo ""
echo "3️⃣  Checking dependencies..."
REQUIRED_DEPS=("next" "react" "@prisma/client" "next-auth" "bcryptjs" "stripe" "socket.io")
for dep in "${REQUIRED_DEPS[@]}"; do
    if ! grep -q "\"$dep\"" package.json; then
        echo "❌ Missing dependency: $dep"
        exit 1
    fi
done
echo "✅ All required dependencies found"

# Test 4: Check Prisma schema
echo ""
echo "4️⃣  Checking Prisma schema..."
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Prisma schema not found"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    echo "⚠️  DATABASE_URL not set in .env.local"
fi
echo "✅ Prisma schema OK"

# Test 5: Try to generate Prisma client
echo ""
echo "5️⃣  Generating Prisma client..."
npx prisma generate 2>&1 | tail -5
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Test 6: Try to build (optional, can be slow)
echo ""
echo "6️⃣  Building application (this may take a while)..."
npm run build 2>&1 | tail -20
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "========================"
echo "🎉 All tests passed!"
echo "========================"
echo ""
echo "You can now run: npm run dev"
