# Admin Deployment Guide

## Application root

```text
/admin
```

## Commands

Install dependencies:

```bash
cd admin
npm install
```

Run development server (port 3001):

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Required environment variables

Reference: `admin/.env.example`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API origin (e.g., `https://api.sentinelr.app`) |
| `NEXT_PUBLIC_APP_NAME` | Application display name |
| `NEXT_PUBLIC_WEB_APP_URL` | User-facing application URL |
| `NEXT_PUBLIC_ADMIN_APP_URL` | Admin application canonical URL |

## API base URL

The admin application calls the backend API directly using the configured `NEXT_PUBLIC_API_BASE_URL`. This URL must be CORS-configured to accept requests from the admin application's origin.

## CORS requirements

The backend must respond to preflight requests with:

- `Access-Control-Allow-Origin`: admin application origin
- `Access-Control-Allow-Credentials`: `true` (if using cookies)
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, x-access-token`
- `Access-Control-Allow-Methods`: `GET, POST, PATCH, PUT, DELETE, OPTIONS`

## Cookie configuration

If the admin application uses a different domain or subdomain (e.g., `admin.sentinelr.app`) than the backend:

- The backend must set cookies with `SameSite=None; Secure` for cross-origin access.
- The admin domain must be added to the backend's allowed origins.
- CSRF tokens or `SameSite` cookies with a backend proxy are recommended.

## Access restrictions

Recommended production configuration:

- Deploy admin on a separate subdomain (e.g., `admin.sentinelr.app`).
- Restrict admin access to VPN or IP allowlists where possible.
- Require multi-factor authentication for admin login.
- Set short session timeouts with inactivity-based expiry.
- Log and alert on failed admin authentication attempts.
- Use separate deployment pipelines from the user-facing application.

## Rollback considerations

- The admin application is statically built at deploy time.
- A rollback only requires deploying the previous application bundle.
- Backend API changes may require coordinated rollback.
- Admin sessions created against a newer session schema should be invalidated on backend rollback.

## Independent deployment

The admin application can be deployed independently of the user-facing application:

- No shared build step
- No shared environment variables beyond the API origin
- No shared source imports
- Different Next.js output directories
