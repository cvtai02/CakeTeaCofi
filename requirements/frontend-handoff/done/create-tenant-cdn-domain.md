# Create Tenant CDN Domain

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Backend Behavior

`POST /api/TenantManagement/tenants` now provisions storage during tenant creation:

1. Validates unique `signature`.
2. Validates unique `domain`.
3. Creates or confirms an R2 bucket named exactly by normalized `signature`.
4. Attaches R2 custom domain `cdn-<signature>.nekomin.com`.
5. Saves tenant `cdnBaseUrl` as `https://cdn-<signature>.nekomin.com`.

## Frontend Notes

Use the categorized admin contract:

```ts
import type { IAdminApiClient } from "@modular-monolith/clients-shared/api/contracts/admin";
```

Call:

```ts
api.tenantManagement.createTenant(input)
```

The create tenant form may still send `cdnBaseUrl` if the existing DTO includes it, but backend create currently computes and stores CDN from `signature`. Treat returned `tenant.cdnBaseUrl` as the source of truth.

## Validation

If signature already exists, backend returns validation error on `signature`.

If domain already exists, backend returns validation error on `domain`.

If R2 bucket/custom-domain provisioning fails, backend returns validation error on `signature` with the infrastructure message.

---

## Completion Summary (2026-05-19)

Updated `src/clients/admin/src/pages/tenants/index.tsx`:

- **Create mode (`TenantFormDialog` mode === "create")**: the
  `cdnBaseUrl` input is hidden. The form state still carries an empty
  `cdnBaseUrl` and `formToWireBody` sends it as `null`, which backend
  ignores during create. A short hint under the Signature field tells the
  operator that an R2 bucket will be provisioned at the signature and the
  CDN URL will become `https://cdn-<signature>.nekomin.com`, and that
  provisioning failures surface here as a signature error (matches the
  handoff's "validation error on `signature` with the infrastructure
  message" wording).
- **Edit mode**: the `cdnBaseUrl` input stays editable (the existing
  `updateTenant` DTO accepts it). Added an explanatory hint that the
  field is auto-provisioned on create and that editing here updates the
  persisted value.
- **Tenant card**: now surfaces `tenant.cdnBaseUrl` when present (small
  `CloudIcon` row beneath the admin-email line), making the
  server-computed CDN visible as the source of truth.
- Existing case-insensitive `ValidationError` mapping already routes
  backend errors on `signature` / `domain` (including
  uniqueness-collision and infrastructure-provisioning failure messages)
  to the corresponding form fields.

`npm run lint` (admin): 0 problems. `tsc -b`: clean for changed files.
