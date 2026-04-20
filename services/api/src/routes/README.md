# API Endpoints

## Health
- GET `/api/health`

## Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (Bearer token)

## Users (Admin)
- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/users`

## Catalog
- GET `/api/catalog/categories`
- GET `/api/catalog/products`
- GET `/api/catalog/products/:id`

## Catalog Admin
- POST `/api/catalog/categories`
- POST `/api/catalog/products`
- PATCH `/api/catalog/products/:id`

## PC Builder
- GET `/api/pc-builder/options`
- POST `/api/pc-builder/check-compatibility`
- GET `/api/pc-builder/rules` (Admin/Technician)
- POST `/api/pc-builder/rules` (Admin/Technician)
- PATCH `/api/pc-builder/rules/:ruleId` (Admin/Technician)

## Cart
- GET `/api/cart` (Authenticated)
- POST `/api/cart/items` (Authenticated)
- PATCH `/api/cart/items/:itemId` (Authenticated)
- DELETE `/api/cart/items/:itemId` (Authenticated)
- DELETE `/api/cart/clear` (Authenticated)

## Orders
- POST `/api/orders/checkout` (Authenticated)
- GET `/api/orders/my` (Authenticated)
- GET `/api/orders/:id` (Owner/Admin/Sales)
- GET `/api/orders` (Admin/Sales)
- PATCH `/api/orders/:id/status` (Admin/Sales)
- POST `/api/orders/:id/pay` (Admin/Sales)

## Tickets
- POST `/api/tickets` (Authenticated)
- GET `/api/tickets/my` (Authenticated)
- GET `/api/tickets/:id` (Owner/Admin/Technician/Sales)
- GET `/api/tickets` (Admin/Technician/Sales)
- PATCH `/api/tickets/:id` (Admin/Technician/Sales)
