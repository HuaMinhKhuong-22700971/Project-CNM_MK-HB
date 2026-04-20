# CNM_MK-HB Monorepo

## Stack
- Backend: Node.js, Express, TypeScript, Prisma, JWT
- Frontend: React, Vite, TypeScript
- Database: MySQL (Docker)

## Structure
- apps/web: frontend app
- services/api: backend service
- packages/shared: shared constants/types
- infra: docker, nginx, postman collections
- docs: requirements, architecture, ERD, API, UI, testing, deployment

## Quick start
1. Install deps:
   - `npm.cmd install --cache .npm-cache --ignore-scripts`
2. Start DB:
   - `docker compose -f infra/docker/docker-compose.yml up -d`
3. Copy env:
   - `Copy-Item .env.example .env`
   - `Copy-Item services/api/.env.example services/api/.env`
4. Prisma:
   - `npm.cmd run prisma:generate -w services/api`
   - `npm.cmd run prisma:migrate:dev -w services/api -- --name init`
   - `npm.cmd run seed -w services/api`
5. Run apps:
   - API: `npm.cmd run dev:api`
   - Web: `npm.cmd run dev:web`

Frontend: http://localhost:5173
Backend health: http://localhost:4000/api/health
Adminer: http://localhost:8080

## Demo credentials
- Admin: `admin@cnm.local` / `Admin@123`
- Technician: `tech1@cnm.local` / `Tech@123`

## Implemented modules
- Auth: register/login/me
- Users: admin list/create
- Catalog: public list/detail/filter + admin CRUD basic
- Cart: add/update/remove/clear/view
- Orders: checkout from cart, my orders, admin/sales update status, mock payment
- PC Builder: options, compatibility check, compatibility-rule management
- Tickets: customer create/list, technician/admin/sales processing

## Troubleshooting (EPERM spawn)
If `npm run dev:api` or `npm run dev:web` fails with `spawn EPERM` from `esbuild`, use stable run commands:

1. Build backend once:
   - `npm.cmd run build -w services/api`
2. Start backend (no watch):
   - `npm.cmd run start:api`
3. Build frontend once (if needed):
   - `npm.cmd run build -w apps/web`
4. Serve frontend static:
   - `npm.cmd run start:web:static`

Then open:
- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api/health`