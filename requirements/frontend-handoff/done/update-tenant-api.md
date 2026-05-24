# Update Tenant API

Use the shared tenant management contract in `src/clients/shared/api/contracts/tenantmanagement.ts`.

## Endpoint

- Method: `PUT`
- Route: `/api/TenantManagement/tenants/{id}`
- Auth: system admin only through the existing `AdminOnly` policy.
- Shared client method: `tenantManagementClient.updateTenant(id, input)`.

## Request

The `id` route value is the tenant id.

Request body:

```ts
{
  name: string;
  signature: string;
  domain: string;
  cdnBaseUrl?: string | null;
  logoKey?: string | null;
  adminDashboardUrl?: string | null;
  countryCode?: "VN" | "US";
}
```

`name`, `signature`, and `domain` are required. Empty optional URL/key values can be sent as `null`.

When `cdnBaseUrl` is omitted or blank, backend uses `https://cdn.{domain}`. When `adminDashboardUrl` is omitted or blank, backend uses `https://{domain}/admin`.

## Response

`200 OK` returns:

```ts
{
  id: number;
  name: string;
  signature: string;
  domain: string;
  cdnBaseUrl: string;
  logoKey?: string | null;
  logoUrl?: string | null;
  adminDashboardUrl: string;
  countryCode: "VN" | "US";
  isActive: boolean;
  created: string;
  lastModified: string;
}
```

`404 Not Found` when the tenant id does not exist.

Validation rejects missing required fields, invalid country code, and signature/domain collisions with another tenant.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

---

## Completion Summary (2026-05-19)

Implemented in the admin client:

- `src/pages/tenants/index.tsx`: refactored the create-tenant dialog into a
  reusable `TenantFormDialog` that handles both `create` and `edit` modes. Each
  tenant card now has an "Edit" button that opens the dialog pre-populated from
  the `TenantResponse` and calls
  `tenantManagementClient.updateTenant(id, body)`.
- Empty optional URL/key fields are sent as `null` (matching the handoff's
  "Empty optional URL/key values can be sent as `null`" rule).
- 400 `ValidationError` responses are mapped onto the relevant form fields
  case-insensitively; non-validation errors surface as toasts. The list query
  is invalidated on success.

`npm run lint` (admin): 0 errors; `tsc -b` clean for changed files.
