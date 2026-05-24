# System Admin Operations APIs

Claude: implement the system-admin tenant operations UI, then move this file to `requirements/frontend-handoff/done/` after implementation.

Use admin API client contracts only from:
- `src/clients/shared/api/contracts/admin/`

## Dashboard Summary

Call `adminApi.tenantManagement.getSystemAdminDashboardSummary()`.

Endpoint:
- `GET /api/TenantManagement/tenants/summary`

Response properties:
- `totalTenants: number`
- `activeTenants: number`
- `inactiveTenants: number`
- `archivedTenants: number`
- `tenantsMissingLogo: number`
- `tenantsMissingDomain: number`
- `tenantsMissingAdminAccount: number`
- `recentTenants: TenantResponse[]`

## Tenant Admin Users

Call `adminApi.tenantManagement.listTenantAdminUsers(tenantId)`.

Endpoint:
- `GET /api/TenantManagement/tenants/{id}/admin-users`

Response item properties:
- `tenantId: number`
- `tenantSignature: string`
- `identityUserId: string`
- `email: string | null`
- `userName: string | null`
- `displayName: string | null`
- `emailConfirmed: boolean`
- `enabled: boolean`
- `lockoutEnd: string | null`

## Manage Tenant Admin Account

Reset password:
- `adminApi.tenantManagement.resetTenantAdminPassword(tenantId, { newPassword })`
- `POST /api/TenantManagement/tenants/{id}/admin-account/reset-password`
- Request: `newPassword: string`

Change email:
- `adminApi.tenantManagement.changeTenantAdminEmail(tenantId, { email })`
- `PUT /api/TenantManagement/tenants/{id}/admin-account/email`
- Request: `email: string`

Enable/disable:
- `adminApi.tenantManagement.setTenantAdminEnabled(tenantId, { enabled })`
- `PUT /api/TenantManagement/tenants/{id}/admin-account/enabled`
- Request: `enabled: boolean`

All three return `TenantAdminUserResponse`.

## Provisioning Status

Call `adminApi.tenantManagement.getTenantProvisioningStatus(tenantId)`.

Endpoint:
- `GET /api/TenantManagement/tenants/{id}/provisioning-status`

Response properties:
- `tenantId: number`
- `name: string`
- `signature: string`
- `domain: string | null`
- `cdnBaseUrl: string`
- `bucketName: string`
- `customDomain: string`
- `hasDomain: boolean`
- `hasLogo: boolean`
- `hasAdminAccount: boolean`
- `bucketExists: boolean`
- `customDomainAttached: boolean`
- `customDomainStatus: string | null`
- `checkedAt: string`

## R2 Status And Retry

Read bucket status:
- `adminApi.system.getR2BucketStatus(bucketName, { customDomain })`
- `GET /api/internal/r2-buckets/{bucketName}/status?customDomain=<domain>`

Retry custom domain attach:
- `adminApi.system.retryR2CustomDomain(bucketName, { customDomain })`
- `POST /api/internal/r2-buckets/{bucketName}/custom-domain/retry`

Status response properties:
- `bucketName: string`
- `bucketExists: boolean`
- `customDomain: string | null`
- `customDomainAttached: boolean`
- `customDomainEnabled: boolean | null`
- `customDomainStatus: string | null`
- `checkedAt: string`

## Archive Tenant

Call `adminApi.tenantManagement.archiveTenant(tenantId)`.

Endpoint:
- `POST /api/TenantManagement/tenants/{id}/archive`

Behavior:
- Soft archives the tenant.
- Also deactivates the tenant.
- Default tenant list excludes archived tenants.
- To show archived tenants, call `listTenants({ includeArchived: true })`.
