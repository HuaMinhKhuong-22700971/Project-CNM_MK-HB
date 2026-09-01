#!/usr/bin/env bash
# ==============================================================================
# PC MALL & SMART PC BUILDER — 1-CLICK AUTOMATED BOOTSTRAP SCRIPT (BASH)
# ==============================================================================

set -e

echo "============================================================"
echo " 🚀 PC MALL SMART PC BUILDER — 1-CLICK BOOTSTRAP AUTOMATION"
echo "============================================================"

# 1. Check .env file
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "--> Creating .env file from .env.example..."
    cp .env.example .env
  else
    echo "--> Warning: .env.example not found!"
  fi
else
  echo "--> .env file detected."
fi

if [ ! -f "services/api/.env" ] && [ -f ".env" ]; then
  cp .env services/api/.env
fi

# 2. Check Node.js
echo "--> Node.js version: $(node -v)"

# 3. Install NPM Packages
echo "--> Installing workspace npm packages..."
npm install

# 4. Generate Prisma Client
echo "--> Generating Prisma Client..."
npm run prisma:generate -w services/api

# 5. Database Stock Ensure
echo "--> Ensuring database stock & schema..."
npm run stock:ensure -w services/api || echo "--> Note: Stock ensure skipped or database offline."

echo "============================================================"
echo " ✅ BOOTSTRAP COMPLETE! Starting Development Server..."
echo "============================================================"

npm run dev
