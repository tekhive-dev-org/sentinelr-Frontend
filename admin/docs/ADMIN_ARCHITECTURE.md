# Sentinelr Admin Architecture

## Repository structure

```text
Sentinelr/
  admin/         ← Internal admin application (this directory)
  web/           ← User-facing Sentinelr application
  mobile/        ← Mobile applications
```

`/admin` and `/web` are independently installable, buildable, and deployable applications. They communicate with the same backend, but each uses only its own source code and dependencies. Neither imports files from the other.

## Folder structure

```text
admin/
  components/
    layout/       ← Shared admin layouts (sidebar, header, etc.)
    shared/       ← Cross-feature reusable components (guards, states)
    ui/           ← Generic UI primitives (loaders, badges, etc.)
  config/         ← Application configuration and environment access
  constants/      ← Roles, permissions, routes, and static definitions
  context/        ← React context providers (auth)
  docs/           ← Admin-specific documentation
  hooks/          ← Shared React hooks
  mocks/          ← Development mock data (API-unavailable only)
  pages/          ← Next.js Pages Router pages
  public/         ← Static assets
  services/       ← API service layer
  styles/         ← Global styles and Tailwind entry
  utils/          ← Pure utility functions
```

## Authentication flow

1. Admin navigates to `/login`.
2. AuthContext checks `localStorage` for an existing token.
3. If a token exists, it is validated against `GET /auth/logged-in-user`.
4. A successful validation returns the admin profile, canonical roles, and effective permissions. `isSessionVerified` is set to `true`.
5. A stored `adminUser` entry in `localStorage` preserves basic identity state during network failures but never grants verified access, admin status, or any permission.
6. After login, the context validates the returned token and does not consider the session established until `/auth/logged-in-user` succeeds.
7. Logout clears all local state and redirects to `/login`.
8. Backend 401 responses trigger session expiry via a custom DOM event, clearing state and redirecting.

## Authorization flow

1. AdminRouteGuard wraps every admin page.
2. It calls `useAuthorization`, which reads the verified session from AuthContext.
3. `useAuthorization` checks explicit permissions, role-derived permissions, and wildcard access.
4. If a required permission is missing, the guard renders an unauthorized state or redirects.
5. The guard prevents admin content from rendering while auth is unresolved.
6. Unauthenticated access redirects to `/login` with a return path.
7. Session-verification failures show a retryable lock screen.
8. Backend enforcement of every permission is mandatory and independent of frontend guards.

## Permission system

Permissions are defined in `constants/permissions.js`. The `ADMIN_ROLE_PERMISSIONS` map defines role-to-permission defaults. The frontend uses these defaults for navigation and screen visibility only.

Backend responses carry the canonical permission set. Frontend calculation is a compatibility convenience, not a security control.

## Service architecture

Each admin domain should have its own service module:

- `services/sessionService.js` — Session and auth operations
- `services/adminUsersService.js` — User directory and management
- `services/adminAlertsService.js` — Alert queue and incident management
- `services/adminSubscriptionsService.js` — Subscriptions and billing
- `services/adminAnalyticsService.js` — Analytics and exports
- `services/adminContentService.js` — Content management
- `services/adminSettingsService.js` — Platform settings

Each service uses a shared API client that:

- Adds auth headers from context or localStorage
- Returns typed data or throws ApiError
- Dispatches session-expiry events on 401
- Does not cache sensitive admin responses in localStorage
- Never returns stale data after authorization failures

## Styling conventions

- CSS Modules with Tailwind utilities through `@apply`.
- Component-specific styles in `ComponentName.module.css`.
- Global styles in `styles/globals.css`.
- MUI icons for iconography only.
- No inline `style` props.
- No long Tailwind class strings directly in JSX.
- Design tokens inherited from the Sentinelr brand palette.

## Mock-data policy

Mocks live in `admin/mocks/` and are imported only through an explicitly configured service adapter. Mock data must not silently replace a failed real API request. When the backend service is unavailable, the frontend shows an explicit unavailable state rather than simulated data.

## Error-handling strategy

- ApiError class with status, code, and details fields.
- 401: invalidate session, redirect to `/login` with returnTo.
- 403: preserve session, show permission-denied state or redirect.
- 5xx/network: show retryable service-unavailable states.
- AuthContext provides `sessionError` for verification failures.
- AdminRouteGuard orchestrates authentication and authorization states.
- UnauthorizedState provides consistent lock screens with retry.

## Relationship between /web, /admin, and the backend

```text
┌──────────┐     ┌──────────┐
│  /web    │────▶│ Backend  │
│ (users)  │     │  APIs    │
└──────────┘     └──────────┘
                      ▲
┌──────────┐          │
│ /admin   │──────────┘
└──────────┘
```

- Both applications call the same backend APIs.
- The backend must enforce admin permissions on every admin endpoint.
- The admin application does not import from `/web` and must not share client-side state with it.
- Separate domain/deployment is recommended for CSRF and cookie isolation.
