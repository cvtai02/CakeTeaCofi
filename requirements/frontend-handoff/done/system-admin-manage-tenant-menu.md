# System Admin Manage Tenant Menu

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Requirement

If the current authenticated user role is `SystemAdmin`, show a `Manage Tenant` item in the admin app sidebar menu.

## Role Source

Use the existing identity client:

- `AdminApiClient.identity.getCurrentUser()`
- Contract: `src/clients/shared/api/contracts/identity.ts`
- Backend endpoint: `GET /me`
- Response DTO shape comes from `src/Modules/Identity/Api/MinimalApi.cs`

Expected response properties:

```ts
{
  email: string
  role: string
  name: string
}
```

## Behavior

- Show `Manage Tenant` only when `user.role === "SystemAdmin"`.
- Hide it for `TenantAdmin`, `TenantStaff`, customers, and unauthenticated states.
- Clicking `Manage Tenant` should navigate to the system admin tenant dashboard at `/`.
- This menu item should not appear inside tenant-only sidebar states unless the current role is still `SystemAdmin`.

## Notes

The root route `/` is the system admin dashboard that lists tenants. Tenant admin dashboard remains under `/<tenant-signature>`.

---

## Completion Summary (2026-05-19)

Implemented in `src/clients/admin/src/components/containers/app-layout.tsx`:

- `NavItem` gained an optional `requireRole?: "SystemAdmin"` field. The
  previously-unconditional "Tenants" nav entry was renamed to
  **"Manage Tenant"** (matching the handoff wording) and gated with
  `requireRole: "SystemAdmin"`.
- `AppLayout` reads `role` from `useIdentityStore()` (already populated by
  the existing login flow via `identityClient.getCurrentUser()`) and
  filters `navItems` so `requireRole`-tagged items render only when the
  current role matches. The item is hidden for `TenantAdmin`,
  `TenantStaff`, customers, and unauthenticated states (empty `role`).
- Clicking "Manage Tenant" navigates to `ROUTES.tenants` (`/tenants`),
  which is the tenant-list page added in the earlier tenant-management
  cycle.

### Deviation note

The handoff says clicking should navigate to `/` (root) on the assumption
that "the root route `/` is the system admin dashboard that lists tenants".
In the current single-app admin, `/` redirects to `/dashboard` and the
tenant list lives at `/tenants` (added in
`requirements/frontend-handoff/done/tenant-management-api.md`). I wired the
nav item to `/tenants` so it actually lands on the tenant list. If the
intent is to restructure routes so `/` becomes the SystemAdmin dashboard
(and tenant-admin lives under `/<tenant-signature>`), that is a separate
routing redesign that should land as its own handoff covering route
shape, multi-tenant subdomain/path strategy, and migration of the
existing pages.

`npm run lint` (admin): 0 errors. `tsc -b`: clean for changed files.
