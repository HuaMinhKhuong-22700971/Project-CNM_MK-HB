# Deployment

Production target for this project is a single VPS running Docker Compose:

- `nginx`: public reverse proxy on ports `80` and `443`
- `web`: Vite production preview container
- `api`: Node/Express API container
- `mysql`: MySQL 8 container with persistent volume

## 1. Server Prerequisites

Use Ubuntu 22.04/24.04, then install Docker:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Log out and SSH in again, then verify:

```bash
docker --version
docker compose version
```

## 2. Clone Source

```bash
git clone https://github.com/HuaMinhKhuong-22700971/Project-CNM_MK-HB.git
cd Project-CNM_MK-HB
```

## 3. Configure Production Environment

```bash
cp env.production.example .env
nano .env
```

Required values:

```env
MYSQL_ROOT_PASSWORD=replace_with_strong_root_password
MYSQL_DATABASE=cnm_mk_hb
MYSQL_USER=cnm_user
MYSQL_PASSWORD=replace_with_strong_db_password

JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_long_random_secret

FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api

PAYMENT_MOCK_MODE=false
SHIPPING_MOCK_MODE=false
SHIPPING_PROVIDER=manual
```

Do not commit `.env`.

Validate the file before starting production:

```bash
npm run prod:check-env
```

## 4. DNS

Point your domain to the VPS public IP:

```txt
A  yourdomain.com      <VPS_PUBLIC_IP>
A  www.yourdomain.com  <VPS_PUBLIC_IP>
```

The recommended production URL layout is:

- Web: `https://yourdomain.com`
- API: `https://yourdomain.com/api`

## 5. SSL Certificates

The production nginx config expects:

```txt
nginx/ssl/fullchain.pem
nginx/ssl/privkey.pem
```

You can create those with Let's Encrypt/Certbot on the VPS, then copy or mount
the certificates into `nginx/ssl`.

If you want to boot the stack before SSL is ready, use the temporary HTTP-only
nginx config:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.http.yml up -d --build
```

After SSL files exist, switch back to the HTTPS config:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 6. Start Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Check containers:

```bash
docker compose -f docker-compose.prod.yml ps
docker logs cnm_api_prod --tail 100
docker logs cnm_web_prod --tail 100
docker logs cnm_nginx_prod --tail 100
```

## 7. Import Database

If you have a SQL backup:

```bash
docker exec -i cnm_mysql_prod mysql -ucnm_user -p cnm_mk_hb < cnm_ecommerce_backup.sql
```

The MySQL port is bound to `127.0.0.1:3307` on the VPS for safer local-only
maintenance access.

## 8. Smoke Test

After deployment, test these flows:

1. Open `https://yourdomain.com`.
2. Login admin.
3. Login customer.
4. Browse products and place an order.
5. Approve QR Banking payment.
6. Move order through processing, shipping, delivered.
7. Customer confirms received order.
8. Check warranty activation.
9. Check admin monthly revenue report.
10. Check ticket and warranty workspaces.

## 9. Updating Production

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

Or use the helper script:

```bash
COMPOSE_FILES="-f docker-compose.prod.yml" sh scripts/production/deploy.sh
```

For the HTTP-only first boot:

```bash
COMPOSE_FILES="-f docker-compose.prod.yml -f docker-compose.prod.http.yml" sh scripts/production/deploy.sh
```

## 10. Backup

Create a database backup:

```bash
sh scripts/production/backup-db.sh
```

Restore a backup:

```bash
sh scripts/production/restore-db.sh backups/cnm_mk_hb-YYYYMMDD-HHMMSS.sql
```
