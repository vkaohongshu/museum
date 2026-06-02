# Life Museum

Life Museum is a personal digital life museum for articles, moments, albums, memory capsules and long-term memory keeping. It is not an admin system or CMS.

## Local Development

```bash
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

MySQL and MinIO run through Docker Compose. You do not need to install MySQL locally.

The default Studio administrator is created from `.env`:

```bash
ADMIN_EMAIL=admin@life.local
ADMIN_PASSWORD=change-me
JWT_SECRET=change-me-to-a-long-random-string
```

## Production

Build the frontend with `npm run build -w @life-museum/web` and deploy `apps/web/dist` to your web host. Set `VITE_API_BASE_URL` to the backend API origin when the frontend is not served behind the same `/api` proxy.

Build and run the backend with:

```bash
npm run build -w @life-museum/server
npm run start -w @life-museum/server
```

Configure MySQL through `DATABASE_URL` or the `MYSQL_*` variables. Configure object storage through `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` and `S3_PUBLIC_BASE_URL`. MinIO works locally; Cloudflare R2 or another S3-compatible store can be used in production.

In production, set:

```bash
NODE_ENV=production
WEB_ORIGIN=https://your-web-origin.example
API_BASE_URL=https://your-api-origin.example
JWT_SECRET=a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-before-seed
```

Run `npm run db:migrate` and `npm run db:seed` after provisioning the database.

## Backups

The Studio backup page at `/admin/backups` supports:

- JSON export: `/api/admin/backup/json`
- Markdown export: `/api/admin/backup/markdown`
- Image manifest export: `/api/admin/backup/images-manifest`

Images are not bundled directly. The image manifest records image URLs, module ownership, descriptions and creation time so object storage can be backed up separately.
