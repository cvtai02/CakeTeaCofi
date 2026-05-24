# Admin Domain Tenant Context

Claude: implement tenant context for `admin.nekomin.com/<signature>`, then move this file to `requirements/frontend-handoff/done/` after implementation.

Use API client contracts only from:
- `src/clients/shared/api/contracts/admin/`

## Route Shape

System admin dashboard:
- `https://admin.nekomin.com`

Tenant admin dashboard:
- `https://admin.nekomin.com/<signature>`

Examples:
- `https://admin.nekomin.com/thanh`
- `https://admin.nekomin.com/techtool`

## REST API Tenant Context

For every tenant-scoped REST API call made while the route has a tenant signature, send:

```txt
X-Tenant-Signature: <signature>
```

System-admin-only APIs that operate across tenants can omit this header when the user is on the root system admin dashboard.

Backend behavior:
- If `X-Tenant-Signature` is present, backend resolves the active tenant by signature before host-domain resolution.
- If the signature does not exist or is inactive, backend returns `404 Tenant not found`.
- If the host is `admin.nekomin.com` and no signature is provided, backend uses a default compatibility tenant context so system-admin pages can still call system APIs.

## SignalR Tenant Context

For tenant-scoped hubs, add the signature as a query parameter because browser WebSocket flows may not reliably send custom headers:

```txt
?tenantSignature=<signature>
```

Apply this to tenant-scoped notification/order hub connections opened under `/<signature>`.

## Frontend Rule

Derive the current tenant signature from the first path segment on the admin app:

```ts
const signature = location.pathname.split("/").filter(Boolean)[0] ?? null;
```

When `signature` is null, treat the user as being on the system admin dashboard and do not attach tenant context to cross-tenant system-admin APIs.

---

## Completion Summary (2026-05-24)

**Helper** — `src/clients/admin/src/lib/tenant-context.ts`:

- `getCurrentTenantSignature()` reads `window.location.pathname`, takes the
  first non-empty segment, and returns it as the tenant signature — except
  when it matches a known top-level system-admin segment, in which case it
  returns `null`. The `KNOWN_SYSTEM_ADMIN_SEGMENTS` set covers every flat
  route currently mounted in `src/configs/routes.ts` (dashboard, products,
  categories, collections, content, customers, marketing, promotion,
  analytics, orders, settings, system, tenants, payments, signin, signup,
  inventory, promotions, reviews, 403). A file comment explains that this
  guard exists because the admin app's current routing is flat and the
  literal path-segment rule from this handoff would otherwise send
  `X-Tenant-Signature: tenants` from the tenant list page; once the
  routes are nested under `/<signature>/*`, the set can be emptied.

**REST** — `src/clients/admin/src/configs/appFetch.ts`:

- Imports `getCurrentTenantSignature` and, when it returns a non-null
  signature, adds an `X-Tenant-Signature` request header. `init?.headers`
  still wins, so individual call sites can override. Authorization,
  Content-Type and any tenant header propagate together through the
  shared `AdminApiClient` (which uses `openapi-fetch` over this same
  `appFetch`).

**SignalR** — `src/clients/admin/src/hooks/use-notification-hub.ts`:

- Replaced the constant `HUB_URL` with a `buildHubUrl()` call. When a
  tenant signature is derivable, the URL becomes
  `<HUB_URL_BASE>?tenantSignature=<signature>` (URL-encoded), matching
  the handoff's "browser WebSocket flows may not reliably send custom
  headers" caveat. When no signature is present (current system-admin
  routes), the URL stays unchanged so today's connection behavior is
  preserved.

**Behavior today vs. after route restructure**

- *Today (flat admin routes):* `getCurrentTenantSignature()` returns
  `null` for every existing page, so no `X-Tenant-Signature` header is
  sent and the SignalR URL is unchanged. Backend falls back to its
  `admin.nekomin.com` compatibility tenant context (per the handoff's
  "If the host is `admin.nekomin.com` and no signature is provided…"
  clause). No regression.
- *After the route restructure* (admin pages move under
  `admin.nekomin.com/<signature>/*`): once the `KNOWN_SYSTEM_ADMIN_SEGMENTS`
  set is emptied (or pruned to only the unscoped system-admin paths),
  every tenant-scoped page automatically attaches the header and SignalR
  query parameter.

**Lint/typecheck**: `tsc -b` and `npm run lint` clean for all
changed/added files.
