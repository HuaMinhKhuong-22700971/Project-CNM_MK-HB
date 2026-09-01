# ==============================================================================
# PC MALL & SMART PC BUILDER — 1-CLICK AUTOMATED BOOTSTRAP SCRIPT
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " 🚀 PC MALL SMART PC BUILDER — 1-CLICK BOOTSTRAP AUTOMATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Environment File Verification (.env)
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "--> Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "--> Warning: .env.example not found!" -ForegroundColor Red
    }
} else {
    Write-Host "--> .env file detected." -ForegroundColor Green
}

if (-not (Test-Path "services/api/.env")) {
    if (Test-Path ".env") {
        Copy-Item ".env" "services/api/.env"
    }
}

# 2. Check Node.js and npm
Write-Host "--> Checking Node.js environment..." -ForegroundColor Yellow
$nodeVersion = node -v
Write-Host "--> Node.js version: $nodeVersion" -ForegroundColor Green

# 3. Install Node.js Dependencies
Write-Host "--> Installing workspace npm packages..." -ForegroundColor Yellow
npm install

# 4. Generate Prisma Client
Write-Host "--> Generating Prisma Client for API..." -ForegroundColor Yellow
npm run prisma:generate -w services/api

# 5. Database Migration & Stock Seeding
Write-Host "--> Ensuring database stock & schema..." -ForegroundColor Yellow
try {
    npm run stock:ensure -w services/api
} catch {
    Write-Host "--> Note: Stock ensure skipped or database offline." -ForegroundColor DarkYellow
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " ✅ BOOTSTRAP COMPLETE! Starting Development Server..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# 6. Start Development Application
npm run dev
