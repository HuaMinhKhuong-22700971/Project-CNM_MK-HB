# CNM_MK-HB Monorepo

## Stack
- Backend: Node.js, Express, TypeScript, Prisma, JWT
- Frontend: React, Vite, TypeScript, Tailwind (to add in next step)
- Database: MySQL (Docker)

## Structure
- apps/web: frontend app
- services/api: backend service
- packages/shared: shared constants/types
- infra: docker, nginx, postman collections
- docs: requirements, architecture, ERD, API, UI, testing, deployment

## Quick start
1. Install deps: `npm install`
2. Start MySQL: `npm run db:up`
3. Copy env: `Copy-Item .env.example .env`
4. Generate prisma client:
   - `npm run prisma:generate -w services/api`
   - `npm run prisma:migrate:dev -w services/api`
5. Run dev servers: `npm run dev`

Frontend: http://localhost:5173
Backend: http://localhost:4000/api/health
