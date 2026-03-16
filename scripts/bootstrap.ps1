# Bootstrap script

Write-Host "1) npm install"
Write-Host "2) npm run db:up"
Write-Host "3) Copy-Item .env.example .env"
Write-Host "4) npm run prisma:generate -w services/api"
Write-Host "5) npm run prisma:migrate:dev -w services/api"
Write-Host "6) npm run dev"
