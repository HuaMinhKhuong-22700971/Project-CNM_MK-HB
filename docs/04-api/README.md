# API Contract (Current)

Base URL: `http://localhost:4000/api`

## Health
- `GET /health`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)

## Users (Admin only)
- `GET /users`
- `GET /users/:id`
- `POST /users`

## Catalog (Public)
- `GET /catalog/categories`
- `GET /catalog/products`
- `GET /catalog/products/:id`

## Catalog Admin (Admin only)
- `POST /catalog/categories`
- `POST /catalog/products`
- `PATCH /catalog/products/:id`

## PC Builder
- `GET /pc-builder/options`
- `POST /pc-builder/check-compatibility`
- `GET /pc-builder/rules` (Admin/Technician)
- `POST /pc-builder/rules` (Admin/Technician)
- `PATCH /pc-builder/rules/:ruleId` (Admin/Technician)

## Cart (Authenticated)
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart/clear`

## Orders
- `POST /orders/checkout` (Authenticated)
- `GET /orders/my` (Authenticated)
- `GET /orders/:id` (Owner/Admin/Sales)
- `GET /orders` (Admin/Sales)
- `PATCH /orders/:id/status` (Admin/Sales)
- `POST /orders/:id/pay` (Admin/Sales, mock payment)

## Tickets
- `POST /tickets` (Authenticated)
- `GET /tickets/my` (Authenticated)
- `GET /tickets/:id` (Owner/Admin/Technician/Sales)
- `GET /tickets` (Admin/Technician/Sales)
- `PATCH /tickets/:id` (Admin/Technician/Sales)
