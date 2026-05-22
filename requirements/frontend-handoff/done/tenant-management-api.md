# Tenant Management API

Claude: implement a SystemAdmin-only tenant management page. Move this file to `requirements/frontend-handoff/done/` after implementation.

## Client

Use `src/clients/shared/api/contracts/tenantmanagement.ts`.

## APIs

Method: `tenantManagementClient.listTenants(query?)`

Endpoint: `GET /api/TenantManagement/tenants`

Auth: `AdminOnly` / SystemAdmin.

Query type: `ListTenantsQuery`

Properties:
- `PageNumber?: number`
- `PageSize?: number`
- `Search?: string | null`
- `IsActive?: boolean | null`

Response type: `ListTenantsResponse`

Method: `tenantManagementClient.getTenantById(id)`

Endpoint: `GET /api/TenantManagement/tenants/{id}`

Response type: `TenantResponse`

Method: `tenantManagementClient.createTenant(input)`

Endpoint: `POST /api/TenantManagement/tenants`

Request type: `CreateTenantRequest`

Properties:
- `name: string`
- `signature: string`
- `domain: string`
- `cdnBaseUrl?: string | null`
- `logoKey?: string | null`
- `adminDashboardUrl?: string | null`
- `countryCode?: "VN" | "US"`

Response type: `CreateTenantResponse`

Tenant response properties:
- `id: number`
- `name: string`
- `signature: string`
- `domain: string`
- `cdnBaseUrl: string`
- `logoKey: string | null`
- `logoUrl: string | null`
- `adminDashboardUrl: string`
- `countryCode: "VN" | "US"`
- `isActive: boolean`
- `created: string`
- `lastModified: string`

## UX

Show tenants in a list/grid with logo, name, domain, and active status. When the user clicks a tenant, redirect to `tenant.adminDashboardUrl`.

---

## Completion Summary (2026-05-19)

Implemented in the admin client:

- `src/components/containers/api-client-provider.tsx`: wired
  `TenantManagementClient` / `ITenantManagementClient` into the API client
  context and exported a `useTenantManagementClient()` hook.
- `src/pages/tenants/index.tsx`: new SystemAdmin tenant management page
  (protected by the existing `PrivateRoute`; the endpoints are additionally
  `AdminOnly`/SystemAdmin enforced server-side):
  - Responsive card grid showing logo (with initials fallback), name, domain,
    active/inactive badge, country code and signature, via
    `tenantManagementClient.listTenants(query)`.
  - Search box and an active-status filter (All / Active / Inactive) mapped to
    `Search` and `IsActive`.
  - Clicking a tenant card redirects to `tenant.adminDashboardUrl`
    (`window.location.href`); cards with no dashboard URL are disabled and show
    a toast if activated.
  - "New tenant" dialog calling `tenantManagementClient.createTenant(input)`
    with all `CreateTenantRequest` fields (name, signature, domain, optional
    cdnBaseUrl / logoKey / adminDashboardUrl, countryCode VN/US). Client-side
    required-field checks plus server `ValidationError` mapped back onto the
    relevant fields (case-insensitive key match). The list query is invalidated
    on success.
  - Explicit loading (skeletons), error, and empty states; mutation shows
    pending state and success/error toasts.
- `src/configs/routes.ts`: added `tenants: "/tenants"` and a
  `tenantDetail(id)` helper.
- `src/routes.tsx`: lazy route wired to the new page.
- `src/components/containers/app-layout.tsx`: added a top-level "Tenants" nav
  item.

Scope note: pagination uses Previous/Next driven by the returned page length
because the handoff only documents the tenant item shape and `items` on the
wrapper (no total-count / total-pages fields documented). `getTenantById` is
available on the wired client but not yet consumed — the handoff's UX is a
list + click-through to the external dashboard, so no in-app detail page was
added.

`npm run lint` (admin): 0 errors. `tsc` clean for the changed/added files
(pre-existing project-wide TS errors in unrelated files are out of scope).
