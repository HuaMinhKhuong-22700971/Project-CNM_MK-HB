# Testing

## Environment

- Node.js 20+
- Docker Desktop or local MySQL 8
- API env file: `services/api/.env`
- Web env file is optional. If needed, create `apps/web/.env` with:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

The current Docker database config is:

- MySQL: `127.0.0.1:3307`
- Database: `cnm_mk_hb`
- Adminer: `http://localhost:8080`

## Start Services

PowerShell may block `npm.ps1`. On Windows, prefer `npm.cmd`.

```powershell
npm.cmd run db:up
npm.cmd run dev
```

Expected URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Health: `http://localhost:4000/api/health`

If `5173` is already in use, Vite will choose another port such as `5174`.

## Automated Checks

```powershell
npm.cmd test
npm.cmd run build -w apps/web
npm.cmd run build -w services/api
```

Notes:

- `npm.cmd test` currently runs placeholder test scripts only. There are no real unit tests yet.
- Web build runs `tsc --noEmit` and `vite build`.
- API build is currently a placeholder script.

## Smoke Tests

Run these after API and DB are online:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/health
Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/products
Invoke-WebRequest -UseBasicParsing http://localhost:4000/api/categories
node test-auth.js
node test-ai.js
npm.cmd run smoke:sales
```

Expected results:

- Health returns `{"status":"ok","service":"api",...}`.
- Products and categories return `success: true`.
- `test-auth.js` registers a temporary user, creates a PC build, then fetches it.
- `test-ai.js` returns a build suggestion. Without `OPENAI_API_KEY`, development mode uses demo data from the database.
- `npm.cmd run smoke:sales` logs in as `sales@example.com`, picks a pending order for `customer@example.com` or `ORDER_ID`, moves it through `PROCESSING -> SHIPPED -> DELIVERED`, then verifies the Customer endpoint reflects the same status and tracking code.

## Manual UAT Checklist

## Demo Accounts

The current local database has these seeded accounts:

| Role | Email | Password |
|---|---|---|
| Customer | `customer@example.com` | `123456` |
| Admin | `admin@example.com` | `123456` |
| Sales Staff | `sales@example.com` | `123456` |
| Tech Staff | `tech@example.com` | `123456` |

### Guest

- Open `/`.
- Search product from the header.
- Open `/products`, filter or view a product detail.
- Open `/compare` and compare products.
- Open `/pc-builder` and request a suggested build.
- Open `/ai-chat` and ask AI about PC components.
- Open `/cart` and verify guest cart behavior.

### Customer

- Register a new account at `/register`.
- Or login at `/login` with `customer@example.com` / `123456`.
- Open `/profile`, update profile fields, and add or select a shipping address.
- Open `/products/:slug` or `/products/1`, add a product to cart, then open `/cart`.
- In `/cart`, change quantity and remove an item if needed.
- Open `/checkout`, select shipping address, then checkout with COD.
- Repeat checkout with VNPAY Mock and verify it redirects to `/payment/mock?orderId=...`.
- Open `/orders` and verify the new order appears.
- Open `/orders/:id` and verify status, product lines, shipping address, and payment method.
- Open `/pc-builder`, save a build, refresh the page, and verify the saved build loads again.
- Create a support ticket at `/tickets/new`.
- Open `/tickets`, open the created ticket, and send a reply.
- Open `/ai-advisor` or `/ai-chat` and ask AI about PC components.
- Open `/warranties` and verify warranty lookup UI. A successful owned-warranty result requires a customer order to be moved to `COMPLETED` first by Sales/Admin, because warranties are generated when an order is completed.

### Admin

- Login with `admin@example.com` / `123456`.
- Open `/admin/dashboard`.
- Check product, SKU, attribute, compatibility, user, and system pages.
- Create or update a product/SKU using test data, then verify it appears on the public catalog.

### Sales Staff

- Login with `sales@example.com` / `123456`.
- Open `/staff/orders`.
- Verify the app redirects directly to `/staff/orders`.
- Find a pending order created by Customer.
- Move the order from `PENDING -> PROCESSING`.
- Create shipment / tracking and move the order to `SHIPPED`.
- Complete the order so it becomes `DELIVERED`.
- Login as Customer and verify `/orders/:id` reflects the same status and tracking code.

### Tech Staff

- Login with `tech@example.com` / `123456`.
- Open `/tech/tickets`.
- Update a ticket status or response and verify the customer ticket detail reflects it.

## Current Known Gaps

- Real unit/integration tests are not implemented yet.
- `docs/04-api/README.md` has older catalog and PC Builder paths; actual routes include `/api/products`, `/api/categories`, and `/api/pc-builder/:buildId`.
- Several backend modules mix `.ts` and `.js`; smoke tests should use the running API as the source of truth until the build pipeline is tightened.
