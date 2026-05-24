# Two-Step Tenant Creation

Claude: implement the system-admin tenant creation UI as a two-step flow, then move this file to `requirements/frontend-handoff/done/` after implementation.

Use the admin client contract only from:
- `src/clients/shared/api/contracts/admin/`

## Permissions

All tenant management mutations below are system-admin only. If the current user is not system admin, do not show the create tenant flow.

## Step 1: Create Basic Tenant

Call `adminApi.tenantManagement.createTenant(input)`.

Endpoint:
- `POST /api/TenantManagement/tenants`

Request DTO:
- `src/Modules/TenantManagement/DTOs/Tenants/CreateTenantRequest.cs`

Request properties:
- `name: string` required, max 200
- `signature: string` required, max 100
- `domain?: string | null` optional, max 255; can be updated later
- `countryCode?: "VN"` currently supported
- `email: string` required tenant admin email, max 256
- `password: string` required tenant admin password

Backend behavior:
- Validates unique `signature`.
- Validates unique `domain` only when domain is provided.
- Creates or confirms the R2 bucket named by `signature`.
- Attaches custom CDN domain `cdn-<signature>.nekomin.com`.
- Stores `cdnBaseUrl = https://cdn-<signature>.nekomin.com`.
- Creates the tenant admin login account with role `TenantAdmin`.
- Returns `TenantResponse`.

Response properties:
- `id: number`
- `name: string`
- `signature: string`
- `domain: string | null`
- `cdnBaseUrl: string`
- `logoKey: string | null`
- `logoUrl: string | null`
- `adminEmail: string | null`
- `countryCode: "VN"`
- `isActive: boolean`
- `created: string`
- `lastModified: string`

## Step 2: Upload Logo

First upload the logo image through the existing content file upload flow and get the uploaded file key.

Then call `adminApi.tenantManagement.updateTenantLogo(id, { logoKey })`.

Endpoint:
- `PUT /api/TenantManagement/tenants/{id}/logo`

Request DTO:
- `src/Modules/TenantManagement/DTOs/Tenants/UpdateTenantLogoRequest.cs`

Request properties:
- `logoKey: string` required, max 1000

Response:
- Same `TenantResponse` shape as above.

## Update Domain Later

Use the existing `adminApi.tenantManagement.updateTenant(id, input)` flow when system admin updates the domain later.

`domain` is optional in the update request. When omitted, backend keeps the current domain. When provided, backend validates uniqueness.

Frontend should build the tenant admin URL from the tenant `signature` instead of reading `adminDashboardUrl` from the API. Use:

```ts
const adminDashboardUrl = `https://admin.nekomin.com/${tenant.signature}`;
```

---

## Completion Summary (2026-05-24)

Rewrote `src/clients/admin/src/pages/tenants/index.tsx`:

**Two-step Create wizard** (`CreateTenantWizard`)
- A single `Dialog` with an internal `step: 1 | 2` state machine.
- **Step 1** form: `name` (max 200), `signature` (max 100), `domain`
  (optional, max 255), `countryCode` (locked to the only currently
  supported value `VN` via `CREATE_COUNTRY_CODES`), tenant admin `email`
  (max 256, type=email), and `password` (type=password, autocomplete
  "new-password"). Submit calls
  `adminApi.tenantManagement.createTenant(input)`; the body is sent as
  `{ name, signature, domain: form.domain || null, countryCode, email,
  password }`.
  - Backend `ValidationError` is mapped onto the relevant field
    case-insensitively, so signature uniqueness, domain uniqueness and the
    R2 provisioning failure surface inline.
  - On success the dialog stores the returned tenant and advances to
    step 2 (it also invalidates the list so the tenant card appears
    immediately).
- **Step 2** logo upload: a `FileUploader` (category `"avatar"`,
  `multiple={false}`) takes a single image; on Save we derive the file key
  via `urlToMediaKey` and call
  `adminApi.tenantManagement.updateTenantLogo(id, { logoKey })`. A "Skip"
  button closes the dialog without uploading (the tenant exists either
  way; the user can re-open the Logo action later).

**`UpdateLogoDialog`**
- Per-card "Logo" action. Shows a thumbnail of the current logo and a
  `FileUploader` for the replacement. On save it derives the key the same
  way and calls `updateTenantLogo(id, { logoKey })`.

**`EditTenantDialog`**
- Dropped fields: `adminDashboardUrl` and `logoKey` (admin URL is now
  computed; logo is edited via the dedicated dialog).
- Remaining fields: `name`, `signature`, `domain` (optional — blank sent
  as `null` so backend keeps the current value per the handoff), `cdnBaseUrl`,
  `countryCode` (full `EDIT_COUNTRY_CODES` so US-era tenants stay
  editable).

**Card / computed admin URL**
- `tenantAdminUrl(t)` returns `https://admin.nekomin.com/${t.signature}`;
  the "Open" button uses this and ignores `tenant.adminDashboardUrl`
  entirely.
- Card shows logo, name, status, domain (or "No domain set" italic
  placeholder when null), admin email, CDN URL, country / signature.

**SystemAdmin gating**
- Reads `role` from `useIdentityStore`; `canManage = role ===
  "SystemAdmin"`.
- The "New tenant" button, the per-card management actions
  (Edit / Logo / Provision admin / Activate-Deactivate) and all dialogs
  are only rendered when `canManage` is true. Defense-in-depth on top of
  the existing nav-level gate from
  `system-admin-manage-tenant-menu.md`.
- "Open" stays visible for everyone so non-admins can still navigate to
  a tenant's dashboard if they happen to land on the page.

**Legacy support kept**
- `ProvisionAdminDialog` still ships for tenants whose `adminEmail` is
  null (pre-handoff tenants). The button is hidden once `adminEmail` is
  set, matching backend's one-admin-per-tenant rule.

`npm run lint` (admin): 0 problems. `tsc -b`: clean for changed files.
