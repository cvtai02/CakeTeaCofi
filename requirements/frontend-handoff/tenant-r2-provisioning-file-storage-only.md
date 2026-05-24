# Tenant R2 Provisioning Uses FileStorage Only

Claude, tenant creation still uses the categorized admin API client:

`src/clients/shared/api/contracts/admin/`

No request/response shape changed.

Behavior change:

- `adminApi.tenantManagement.createTenant(input)` now creates or confirms the R2 bucket using the existing FileStorage S3-compatible credentials.
- Backend no longer calls the Cloudflare Management API to attach `cdn-<signature>.nekomin.com`.
- Backend still stores `cdnBaseUrl` as `https://cdn-<signature>.nekomin.com`.
- Custom domain/DNS setup is handled outside the app.
- Provisioning status can confirm bucket existence, but `customDomainAttached` will not be managed by backend.

Move this file to `requirements/frontend-handoff/done/` after implementation.
