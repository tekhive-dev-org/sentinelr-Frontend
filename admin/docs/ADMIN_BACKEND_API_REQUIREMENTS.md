# Sentinelr Admin Backend API Specification

**Version:** 1.0.0-draft  
**Status:** Frontend-integrated specification — backend implementation pending  
**Audience:** Backend developers building the Sentinelr admin API  

> This document defines every API endpoint the admin frontend requires. It is derived from the completed admin implementation and should be treated as the backend build specification.

---

## Table of Contents

1. [Conventions](#conventions)
2. [Authentication & Session](#authentication--session)
3. [Admin Profile & Permissions](#admin-profile--permissions)
4. [Dashboard Overview](#dashboard-overview)
5. [User Management](#user-management)
6. [Device Management](#device-management)
7. [SOS Incident Management](#sos-incident-management)
8. [Subscription Management](#subscription-management)
9. [Analytics & Reporting](#analytics--reporting)
10. [Content Management](#content-management)
11. [Notification Campaigns](#notification-campaigns)
12. [Admin Team Management](#admin-team-management)
13. [Audit Logs](#audit-logs)
14. [Platform Settings](#platform-settings)
15. [Export Jobs](#export-jobs)
16. [System Health](#system-health)
17. [Realtime Events](#realtime-events)
18. [Permission Matrix](#permission-matrix)
19. [Audit Event Catalogue](#audit-event-catalogue)
20. [Priority Classification](#priority-classification)
21. [Existing Endpoint Migration](#existing-endpoint-migration)

---

## Conventions

### Response Envelope

Every endpoint returns:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "meta": {
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

`meta.pagination` is present only on paginated list endpoints.

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error",
  "error": {
    "code": "STABLE_ERROR_CODE",
    "details": []
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

### Stable Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `SESSION_EXPIRED` | 401 | No valid session |
| `INSUFFICIENT_PERMISSION` | 403 | Authenticated but lacks permission |
| `RESOURCE_NOT_FOUND` | 404 | Target does not exist |
| `VALIDATION_FAILED` | 422 | Field-level validation errors |
| `VERSION_CONFLICT` | 409 | Optimistic concurrency failure |
| `SELF_TARGET_DENIED` | 422 | Cannot modify own account |
| `LAST_SUPER_ADMIN` | 422 | Cannot remove last super_admin |
| `RATE_LIMITED` | 429 | Too many requests |
| `MAINTENANCE_MODE` | 503 | Platform in maintenance |

### Pagination

All list endpoints accept `?page=1&limit=20` and return `meta.pagination: { page, limit, total, totalPages }`. Max limit: 100. Default limit: 20.

### Sorting

All list endpoints accept `?sortBy=field&sortOrder=asc|desc`. Default: `createdAt desc`.

### Filtering

Filters are query parameters. Omitted filters match all values. Multiple values use comma separation: `?status=active,past_due`.

### Date/Time

All timestamps in ISO 8601 UTC: `2026-07-31T12:00:00.000Z`. Timezone-aware where applicable.

### Currency

All monetary values as integers in the smallest unit (cents/satoshis), with a separate `currency` field: `{ "amount": 1500, "currency": "USD" }` (represents $15.00).

### API Versioning

Header-based: `Accept-Version: 1`. Future versions may change response shapes.

### Rate Limiting

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Admin endpoints: 100 requests per 60s per admin session.

### Idempotency

All `POST`, `PATCH`, `PUT`, `DELETE` endpoints accept `Idempotency-Key` header. Duplicate keys return the original response within 24 hours.

### Optimistic Concurrency

Resources that support concurrent modification include a `version` field. Mutations must send `If-Match: {version}`. 409 on conflict.

### Audit Log

Every mutation produces an immutable audit record. Audit entries are created by the backend and never editable or deletable through any API.

### Sensitive Data

- Coordinates: never expose more than 2 decimal places in admin responses
- IP addresses: masked to first two octets
- Card numbers: maximum `last4`
- API keys/secrets: never returned by any endpoint
- Emergency contacts: phone numbers masked by default

### Realtime Events

Realtime events follow the format `resource.action` via Supabase broadcast or WebSocket. All events are backend-enforced (RLS required for Supabase channels).

---

## Authentication & Session

### P0 — Admin Login

```
POST /auth/login
Permission: none
Body: { "email": "string", "password": "string" }
Success: { "success": true, "data": { "token": "jwt...", "user": {...} }, "meta": {...} }
Errors: 401 INVALID_CREDENTIALS, 429 RATE_LIMITED
Audit: login event
```

Backend decision required: The admin and user-facing applications share the same `/auth/login` endpoint. If admin auth should be separated, a dedicated admin login endpoint or admin-only token scope is needed.

### P0 — Current Admin Session

```
GET /auth/logged-in-user
Permission: none (requires valid token)
Headers: Authorization: Bearer <token>, x-access-token: <token>
Success: { "success": true, "data": { "user": {...}, "roles": [...], "permissions": [...], "adminProfile": {...}, "session": {...} }, "meta": {...} }
Errors: 401 SESSION_EXPIRED
```

Response must include for admin users:

```json
{
  "user": { "id": "usr_...", "email": "...", "userName": "...", "status": "active" },
  "roles": ["support_admin"],
  "permissions": ["admin.access", "admin.dashboard.view", "admin.users.view"],
  "adminProfile": { "id": "adm_...", "status": "active", "department": "support" },
  "session": { "id": "ses_...", "version": "7", "issuedAt": "2026-07-31T12:00:00.000Z", "expiresAt": "2026-07-31T20:00:00.000Z" }
}
```

### P0 — Logout

```
POST /auth/logout
Permission: none (requires valid token)
Body: (none)
Success: { "success": true, "message": "Logged out" }
Audit: logout event
```

Must invalidate the server session. The frontend also clears local token storage.

### P1 — Token Refresh

```
POST /auth/refresh
Permission: none (requires valid token)
Body: (none)
Success: { "success": true, "data": { "token": "new_jwt..." } }
```

### P1 — Revoke All Sessions

```
POST /auth/revoke-all
Permission: admin.access
Body: (none)
Success: { "success": true, "message": "All sessions revoked" }
Audit: session.revoke event
```

---

## Admin Profile & Permissions

### P1 — Get Effective Permissions

```
GET /admin/profile/permissions
Permission: admin.access
Success: { "success": true, "data": { "permissions": [...] } }
```

Returns the authenticated admin's resolved permissions (explicit + role-derived + wildcard).

### P2 — Get All Available Roles

```
GET /admin/roles
Permission: admin.team.view
Success: { "success": true, "data": { "roles": [{ "key": "super_admin", "label": "Super Admin", "permissions": [...] }] } }
```

---

## Dashboard Overview

### P0 — Dashboard Statistics

```
GET /admin/dashboard/stats
Permission: admin.dashboard.view
Success: { "success": true, "data": { "totalUsers": 1250, "verifiedUsers": 1100, "blockedUsers": 15, "flaggedUsers": 50, "activeSOSIncidents": 3, "families": 340, "pairedDevices": 890, "activeSubscriptions": 200, "lastUpdated": "2026-07-31T12:00:00.000Z" } }
```

**Backend decision required:** The frontend currently calls four separate endpoints (`/admin/all`, `/admin/blocked`, `/admin/verified`, `/alerts`) to build these counts. A dedicated aggregate endpoint is preferred for consistency and performance.

### P1 — Dashboard Trends

```
GET /admin/dashboard/trends?range=30d
Permission: admin.dashboard.view
Query: range=7d|30d|90d|12m
Success: { "success": true, "data": { "newUsers": [{ "period": "2026-07-25", "value": 12, "comparison": 10 }], "activeUsers": [...], "subscriptionGrowth": [...], "deviceActivity": [...], "sosIncidents": [...] } }
```

Each trend array contains `{ period, value, comparison? }` where `comparison` is the previous period's value for delta calculation.

### P1 — Recent Registrations

```
GET /admin/dashboard/recent-users?limit=10
Permission: admin.dashboard.view
Success: { "success": true, "data": { "users": [...] } }
```

### P1 — Recent Admin Actions

```
GET /admin/audit?limit=5
Permission: admin.dashboard.view
Success: { "success": true, "data": { "entries": [...] } }
```

---

## User Management

### P0 — List Users

```
GET /admin/users?page=1&limit=20&search=&role=&verified=&blocked=&sortBy=createdAt&sortOrder=desc&registeredAfter=&lastActiveBefore=
Permission: admin.users.view
Success: { "success": true, "data": { "users": [...] }, "meta": { "pagination": {...} } }
```

Each user object: `{ id, userName, email, phone, role, verified, blocked, suspended, status, createdAt, lastActive }`.

**Existing endpoint:** `GET /admin/all` — this should be replaced by `GET /admin/users` with full pagination/search/filter/sort support. Keep `/admin/all` as a deprecated alias during migration.

### P0 — User Detail

```
GET /admin/users/{userId}
Permission: admin.users.view
Success: { "success": true, "data": { "user": { profile, status, families[], devices[], subscription, recentActivity[], sosIncidents[], geofences[], parentalControls, securityEvents[], adminNotes[], adminActions[] } } }
```

### P0 — Block/Unblock User

```
PATCH /admin/users/{userId}/block
Permission: admin.users.manage
Body: { "action": "block|unblock", "reason": "string" }
Errors: 422 SELF_TARGET_DENIED
Audit: user.block or user.unblock
```

**Existing endpoint:** `PATCH /admin/{userId}/block` — migrate to `/admin/users/{userId}/block` for consistency.

### P1 — Verify/Reject User

```
PATCH /admin/users/{userId}/verify
Permission: admin.users.manage
Body: { "verified": true, "reason?": "string" }
Audit: user.verify
```

### P1 — Suspend/Restore User

```
PATCH /admin/users/{userId}/suspend
Permission: admin.users.manage
Body: { "reason": "string", "durationDays": 30 }
Audit: user.suspend | user.restore

PATCH /admin/users/{userId}/restore
Permission: admin.users.manage
Body: (none)
Audit: user.restore
```

### P1 — Force Logout

```
POST /admin/users/{userId}/force-logout
Permission: admin.users.manage
Body: (none)
Audit: session.revoke
```

### P1 — Initiate Password Reset

```
POST /admin/users/{userId}/initiate-password-reset
Permission: admin.users.manage
Body: (none)
Audit: user.password_reset_initiated
```

### P1 — Admin Notes

```
POST /admin/users/{userId}/notes
Permission: admin.users.manage
Body: { "note": "string" }
Audit: user.note_added
```

### P1 — Change Account Type

```
PATCH /admin/users/{userId}/account-type
Permission: admin.users.manage
Body: { "accountType": "parent|child|guardian|educator", "reason": "string" }
Audit: user.account_type_changed
```

### P2 — Remove from Family

```
DELETE /admin/users/{userId}/family/{familyId}
Permission: admin.users.manage
Audit: user.removed_from_family
```

### P2 — Export User Data

```
POST /admin/users/{userId}/export
Permission: admin.users.manage
Audit: export.request
```

### P2 — Initiate Account Deletion

```
POST /admin/users/{userId}/delete
Permission: admin.users.manage
Body: { "reason": "string" }
Audit: user.delete
```

### P2 — User Counts (for stats)

```
GET /admin/users/counts
Permission: admin.users.view
Success: { "success": true, "data": { "total": 1250, "verified": 1100, "blocked": 15, "unverified": 135 } }
```

**Existing endpoints:** `GET /admin/verified?verified=true|false` and `GET /admin/blocked?blocked=true` — replace with this single aggregate endpoint.

---

## Device Management

### P1 — List Devices

```
GET /admin/devices?page=1&limit=20&search=&status=&platform=&pairingState=&sortBy=&sortOrder=
Permission: admin.devices.view
Success: { "success": true, "data": { "devices": [...] }, "meta": { "pagination": {...} } }
```

Each device: `{ id, name, platform, osVersion, appVersion, status, pairedAt, lastSeen, ownerName, ownerId, familyName, batteryLevel }`.  
Never expose: refresh tokens, raw coordinates, full IP addresses.

### P1 — Device Stats

```
GET /admin/devices/stats
Permission: admin.devices.view
Success: { "success": true, "data": { "total": 890, "online": 700, "offline": 150, "unpaired": 30, "inactive": 8, "revoked": 2 } }
```

### P1 — Device Detail

```
GET /admin/devices/{deviceId}
Permission: admin.devices.view
Success: { "success": true, "data": { "device": { profile, owner, family, connection, pairingHistory[], sosEvents[], geofenceEvents[] } } }
```

### P1 — Revoke/Unpair/Flag Device

```
PATCH /admin/devices/{deviceId}/revoke
Permission: admin.devices.manage
Body: { "reason": "string" }
Audit: device.revoke

PATCH /admin/devices/{deviceId}/unpair
Permission: admin.devices.manage
Body: { "reason": "string" }
Audit: device.unpair

PATCH /admin/devices/{deviceId}/flag
Permission: admin.devices.manage
Body: { "reason": "string" }
Audit: device.flag
```

### P2 — Device Notes, Re-auth, Logs

```
POST /admin/devices/{deviceId}/notes
POST /admin/devices/{deviceId}/request-reauth
GET /admin/devices/{deviceId}/logs?limit=50
```

---

## SOS Incident Management

### P0 — List Incidents

```
GET /admin/alerts?page=1&limit=20&status=&severity=&source=&search=&sortBy=createdAt&sortOrder=desc
Permission: admin.alerts.view
Success: { "success": true, "data": { "alerts": [...] }, "meta": { "pagination": {...} } }
```

### P0 — Incident Stats

```
GET /admin/alerts/stats
Permission: admin.alerts.view
Success: { "success": true, "data": { "active": 3, "acknowledged": 2, "escalated": 1, "resolved": 150, "falseAlarm": 12 } }
```

### P0 — Active Count (lightweight)

```
GET /admin/alerts?status=active,acknowledged,escalated&limit=1
Permission: admin.alerts.view
Used for sidebar badge. Only `meta.pagination.total` is read.
```

### P0 — Incident Detail

```
GET /admin/alerts/{alertId}
Permission: admin.alerts.view
Success: { "success": true, "data": { "alert": { incidentCode, type, severity, status, source, user, device, location, timeline[], relatedAlerts[], notes[], assignmentHistory[], statusHistory[], resolution, contacts } } }
```

Data protection: coordinates ≤ 2 decimal places, phone numbers masked.

### P1 — Incident Actions

```
PATCH /admin/alerts/{alertId}/acknowledge   (no body)
PATCH /admin/alerts/{alertId}/assign        { "assigneeId": "..." }
PATCH /admin/alerts/{alertId}/escalate      { "reason": "..." }
PATCH /admin/alerts/{alertId}/resolve       { "resolution": "...", "status": "resolved" }
PATCH /admin/alerts/{alertId}/reopen        { "reason": "..." }
PATCH /admin/alerts/{alertId}/false-alarm   { "reason": "..." }
PATCH /admin/alerts/{alertId}/contact-state { "contactState": "..." }
POST  /admin/alerts/{alertId}/notes         { "note": "..." }
All: Permission admin.alerts.manage | Audit: alert.{action}
```

---

## Subscription Management

### P1 — List Subscriptions

```
GET /admin/subscriptions?page=1&limit=20&search=&status=&plan=&billingPeriod=&provider=&sortBy=&sortOrder=
Permission: admin.subscriptions.view
Success: { "success": true, "data": { "subscriptions": [...] }, "meta": { "pagination": {...} } }
```

### P1 — Subscription Stats

```
GET /admin/subscriptions/stats
Permission: admin.subscriptions.view
Success: { "success": true, "data": { "total": 200, "active": 180, "trials": 10, "upcomingRenewals": 30, "pastDue": 3, "cancelled": 5, "expired": 2 } }
```

Revenue metrics only when authorized by backend finance API.

### P1 — Subscription Detail

```
GET /admin/subscriptions/{subscriptionId}
Permission: admin.subscriptions.view
Success: includes subscriber, plan, lifecycle, payments[], invoices[], limits, entitlements
```

Data protection: never expose full card numbers — max `last4`. Provider references masked.

### P1 — Subscription Actions

```
PATCH  /admin/subscriptions/{id}/change-plan        { "planId": "...", "reason": "..." }
PATCH  /admin/subscriptions/{id}/grant-trial         { "durationDays": 14, "reason": "..." }
PATCH  /admin/subscriptions/{id}/extend-trial        { "additionalDays": 7, "reason": "..." }
PATCH  /admin/subscriptions/{id}/cancel              { "immediate": true|false, "reason": "..." }
PATCH  /admin/subscriptions/{id}/reactivate          { "reason": "..." }
PATCH  /admin/subscriptions/{id}/manual-entitlement  { "entitlement": "...", "reason": "...", "expiryDate": "..." }
POST   /admin/subscriptions/{id}/offline-payment     { "amount": 1500, "currency": "USD", "providerReference": "...", "reason": "...", "paymentDate": "..." }
GET    /admin/subscriptions/{id}/invoices/{invId}/download
POST   /admin/subscriptions/{id}/invoices/{invId}/resend
All: Permission admin.subscriptions.manage | Audit: subscription.{action}
```

---

## Analytics & Reporting

### P2 — All Analytics Endpoints

All share query parameters: `?range=7d|30d|90d|12m&plan=&platform=&country=&accountType=`

```
GET /admin/analytics/overview
GET /admin/analytics/user-growth
GET /admin/analytics/active-users
GET /admin/analytics/device-adoption
GET /admin/analytics/family-growth
GET /admin/analytics/sos-trends
GET /admin/analytics/geofence-activity
GET /admin/analytics/parental-adoption
GET /admin/analytics/subscription-metrics
GET /admin/analytics/app-versions
GET /admin/analytics/platform-health
```

Permission: `admin.analytics.view`  
Response: `{ "success": true, "data": { "data": [{ "period": "...", "value": N, "comparison?": N }], "previousTotal?": N, "currentTotal?": N } }`  
Platform health: backend-provided only, never calculated client-side.

### P2 — Exports

```
GET  /admin/analytics/{category}/export/csv  { range, filters }
POST /admin/analytics/{category}/export/pdf  { range, filters }
Permission: admin.analytics.export
```

---

## Content Management

### P1 — Content CRUD

```
GET    /admin/content?page=&limit=&search=&type=&status=&audience=&sortBy=&sortOrder=
POST   /admin/content                    { "title", "type", "audience", "body" }
GET    /admin/content/{id}
PATCH  /admin/content/{id}               { partial fields }
POST   /admin/content/{id}/publish
POST   /admin/content/{id}/schedule      { "publishAt": "ISO date" }
POST   /admin/content/{id}/archive       { "reason": "..." }
GET    /admin/content/{id}/versions
GET    /admin/content/{id}/preview
```

Permissions: `admin.content.view` (read), `admin.content.manage` (create/edit), `admin.content.publish` (publish/schedule/archive).  
Content body: sanitized/structured only, no arbitrary HTML.

---

## Notification Campaigns

### P2 — Campaign CRUD + Send

```
GET    /admin/notifications?page=&limit=&search=&channel=&status=
POST   /admin/notifications              { "title", "channel", "audience", "body" }
GET    /admin/notifications/{id}
PATCH  /admin/notifications/{id}         { partial }
POST   /admin/notifications/{id}/send
POST   /admin/notifications/{id}/schedule  { "sendAt": "ISO date" }
POST   /admin/notifications/{id}/cancel    { "reason": "..." }
GET    /admin/notifications/{id}/delivery
POST   /admin/notifications/{id}/request-approval
POST   /admin/notifications/{id}/approve
POST   /admin/notifications/{id}/reject     { "reason": "..." }
```

Permissions: `admin.notifications.view`, `admin.notifications.manage`, `admin.notifications.send`.  
Delivery status must be backend-confirmed. "Send to all users" requires approval flow.

---

## Admin Team Management

### P1 — Admin CRUD

```
GET    /admin/team?page=&limit=&search=&role=&status=
POST   /admin/team/invite                { "email", "roles": [...], "message?": "..." }
GET    /admin/team/{id}
PATCH  /admin/team/{id}                  { partial }
POST   /admin/team/invitations/{id}/resend
DELETE /admin/team/invitations/{id}
```

Permission: `admin.team.view` (read), `admin.team.manage` (invite/update/assign).  
Self-protection: cannot deactivate/demote self. Cannot remove last super_admin.  
Step-up auth required for highly sensitive changes.

### P1 — Admin Actions

```
PATCH  /admin/team/{id}/activate
PATCH  /admin/team/{id}/deactivate       { "reason": "..." }
PATCH  /admin/team/{id}/roles            { "role": "...", "reason": "..." }
POST   /admin/team/{id}/revoke-sessions
GET    /admin/team/{id}/permissions
GET    /admin/team/{id}/activity?limit=20
```

---

## Audit Logs

### P0 — List Entries

```
GET /admin/audit?page=1&limit=30&search=&actor=&action=&resource=&outcome=&dateFrom=&dateTo=&sortBy=timestamp&sortOrder=desc
Permission: admin.audit.view
Success: { "success": true, "data": { "entries": [...] }, "meta": { "pagination": {...} } }
```

### P0 — Entry Detail

```
GET /admin/audit/{entryId}
Permission: admin.audit.view
```

### P1 — Stats + Export

```
GET  /admin/audit/stats
GET  /admin/audit/export?dateFrom=&dateTo=&format=csv
Permission: admin.audit.view
```

### Immutability

Audit entries are created by the backend only. No update or delete endpoints exist. The frontend has no edit/delete controls.

### Data Protection

- IP addresses: first two octets only
- No tokens, passwords, full payment details in summaries
- before/after diff: changed fields only

---

## Platform Settings

### P1 — Settings CRUD

```
GET   /admin/settings
GET   /admin/settings/{group}
PATCH /admin/settings/{group}/{key}      { "value": ..., "reason": "..." }
PATCH /admin/settings/{group}            { "settings": {...}, "reason": "..." }
GET   /admin/settings/{group}/{key}/history
```

Permission: `admin.settings.view` (read), `admin.settings.manage` (normal groups), super_admin/admin role (dangerous groups: sos, subscriptions, maintenance, features, retention, integrations).

### P0 — Maintenance Mode

```
PATCH /admin/settings/maintenance        { "enabled": true|false, "reason": "..." }
Permission: super_admin/admin role
Audit: setting.update
```

### P2 — Feature Flags

```
PATCH  /admin/settings/features/{flagKey}  { "enabled": true|false, "reason": "..." }
Permission: super_admin/admin role
```

Feature flags must be backend-controlled. Toggle must be confirmed by backend.

### P2 — Integrations

```
GET  /admin/settings/integrations/status
POST /admin/settings/integrations/{key}/test
```

Connection status only — never return secrets, tokens, or API keys.

---

## Export Jobs

### P2 — Export Job Lifecycle

```
POST /admin/exports                       { "type": "users|devices|alerts|audit", "filters": {...}, "format": "csv|pdf" }
GET  /admin/exports/{jobId}
GET  /admin/exports/{jobId}/download
```

Response: `{ "jobId": "...", "status": "queued|processing|completed|failed", "progress": 45, "downloadUrl?": "...", "expiresAt?": "..." }`.

---

## System Health

### P2 — Health Check

```
GET /admin/health
Permission: admin.access
Success: { "success": true, "data": { "status": "healthy", "uptime": 86400, "version": "1.0.0", "services": { "db": "connected", "cache": "connected", "queue": "healthy" } } }
```

---

## Realtime Events

### Event Format

```json
{
  "event": "resource.action",
  "payload": { ... },
  "timestamp": "2026-07-31T12:00:00.000Z",
  "actor": "admin_id"
}
```

### Required Events

| Event | Trigger |
|---|---|
| `alert.created` | New SOS incident |
| `alert.updated` | Incident status changed |
| `user.blocked` / `user.unblocked` | User block status change |
| `device.revoked` | Device session revoked |
| `subscription.changed` | Plan or status change |
| `maintenance.toggled` | Maintenance mode on/off |

All events must be backend-enforced. Client-side filtering is not authorization.

---

## Permission Matrix

| Permission | Scope |
|---|---|
| `admin.access` | Enter admin shell |
| `admin.dashboard.view` | Overview dashboard |
| `admin.users.view` / `.manage` | User directory + actions |
| `admin.alerts.view` / `.manage` | SOS incidents |
| `admin.content.view` / `.manage` / `.publish` | Content management |
| `admin.subscriptions.view` / `.manage` | Subscriptions |
| `admin.analytics.view` / `.export` | Analytics + exports |
| `admin.settings.view` / `.manage` | Platform settings |
| `admin.devices.view` / `.manage` | Device management |
| `admin.geofencing.view` | Geofence oversight |
| `admin.parental.view` | Parental controls |
| `admin.notifications.view` / `.manage` / `.send` | Notifications |
| `admin.support.view` | Support/feedback |
| `admin.team.view` / `.manage` | Admin team |
| `admin.audit.view` | Audit logs |

Role-to-permission defaults are maintained in the frontend for navigation purposes only. Backend must enforce permissions explicitly.

---

## Audit Event Catalogue

Every mutation must produce an audit entry with: `timestamp, actorId, actorName, action, resource, resourceId, outcome, reason, before?, after?, correlationId, ipAddress, userAgent`.

Required actions: `user.block`, `user.unblock`, `user.verify`, `user.suspend`, `user.restore`, `user.delete`, `device.revoke`, `device.unpair`, `alert.acknowledge`, `alert.resolve`, `alert.escalate`, `alert.reopen`, `alert.assign`, `subscription.change`, `subscription.cancel`, `subscription.reactivate`, `content.publish`, `content.archive`, `role.assign`, `role.revoke`, `admin.invite`, `admin.deactivate`, `setting.update`, `export.request`, `login`, `logout`, `session.revoke`.

---

## Priority Classification

| Priority | Definition | Modules |
|---|---|---|
| **P0** | First usable admin release | Auth, Dashboard stats, User list+detail+block, SOS list+detail+acknowledge, Maintenance mode, Audit list |
| **P1** | Complete operations | User actions, Device management, Subscription management, Content management, Team management, Settings, Export |
| **P2** | Advanced/future | Analytics, Notification campaigns, Feature flags, Integrations, System health |

---

## Existing Endpoint Migration

| Existing Endpoint | Current Use | Recommendation |
|---|---|---|
| `GET /admin/all` | User list (unpaginated) | Replace with `GET /admin/users` with full pagination/search/filter/sort |
| `GET /admin/blocked?blocked=true` | Blocked user count | Absorb into `GET /admin/users/counts` |
| `GET /admin/verified?verified=true|false` | Verified/unverified counts | Absorb into `GET /admin/users/counts` |
| `PATCH /admin/{userId}/block` | Block/unblock | Migrate to `PATCH /admin/users/{userId}/block` with reason field |

Keep old endpoints as deprecated aliases during migration. All new development should use the versioned `/admin/users/*` paths.

---

*End of specification. Every endpoint marked "Missing" requires backend implementation. "Backend decision required" items need architecture confirmation before implementation.*
