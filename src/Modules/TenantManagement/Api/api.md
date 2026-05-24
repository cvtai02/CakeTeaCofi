# Tenant Management Module API

## API Endpoints

Client contract: [TenantManagementClient](../../../clients/shared/api/clients/tenantmanagement.ts), [ITenantManagementClient](../../../clients/shared/api/contracts/tenantmanagement.ts)

### Tenants
- GET `api/TenantManagement/tenants` - AdminOnly; [ListTenantsRequest](../DTOs/Tenants/ListTenantsRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- GET `api/TenantManagement/tenants/summary` - AdminOnly; [SystemAdminDashboardSummaryResponse](../DTOs/Tenants/SystemAdminDashboardSummaryResponse.cs)
- GET `api/TenantManagement/tenants/{id}` - AdminOnly; [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- POST `api/TenantManagement/tenants` - AdminOnly; [CreateTenantRequest](../DTOs/Tenants/CreateTenantRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs). Creates tenant basic info and the tenant admin account. Validates unique signature/domain when domain is provided, creates or confirms the R2 bucket named by signature with FileStorage credentials, and sets CDN base URL to `https://cdn-<signature>.nekomin.com`. Custom domain setup is managed outside the app.
- PUT `api/TenantManagement/tenants/{id}` - AdminOnly; [UpdateTenantRequest](../DTOs/Tenants/UpdateTenantRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs). Domain is optional and can be added later.
- PUT `api/TenantManagement/tenants/{id}/logo` - AdminOnly; [UpdateTenantLogoRequest](../DTOs/Tenants/UpdateTenantLogoRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs). Updates the tenant logo key after the logo file is uploaded.
- POST `api/TenantManagement/tenants/{id}/admin-account` - AdminOnly; [CreateTenantAdminAccountRequest](../DTOs/Tenants/CreateTenantAdminAccountRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs). Creates the tenant admin login account with the `TenantAdmin` role.
- PUT `api/TenantManagement/tenants/{id}/admin-account` - AdminOnly; [UpdateTenantAdminAccountRequest](../DTOs/Tenants/UpdateTenantAdminAccountRequest.cs), [TenantAdminUserResponse](../DTOs/Tenants/TenantAdminUserResponse.cs). Updates provided tenant admin account fields: email, password, enabled state, and display name.
- GET `api/TenantManagement/tenants/{id}/admin-users` - AdminOnly; [TenantAdminUserResponse](../DTOs/Tenants/TenantAdminUserResponse.cs)
- POST `api/TenantManagement/tenants/{id}/admin-account/reset-password` - AdminOnly; [ResetTenantAdminPasswordRequest](../DTOs/Tenants/ResetTenantAdminPasswordRequest.cs), [TenantAdminUserResponse](../DTOs/Tenants/TenantAdminUserResponse.cs)
- PUT `api/TenantManagement/tenants/{id}/admin-account/email` - AdminOnly; [ChangeTenantAdminEmailRequest](../DTOs/Tenants/ChangeTenantAdminEmailRequest.cs), [TenantAdminUserResponse](../DTOs/Tenants/TenantAdminUserResponse.cs)
- PUT `api/TenantManagement/tenants/{id}/admin-account/enabled` - AdminOnly; [SetTenantAdminEnabledRequest](../DTOs/Tenants/SetTenantAdminEnabledRequest.cs), [TenantAdminUserResponse](../DTOs/Tenants/TenantAdminUserResponse.cs)
- GET `api/TenantManagement/tenants/{id}/provisioning-status` - AdminOnly; [TenantProvisioningStatusResponse](../DTOs/Tenants/TenantProvisioningStatusResponse.cs). Checks tenant setup flags and R2 bucket/custom-domain status.
- POST `api/TenantManagement/tenants/{id}/activate` - AdminOnly; [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- POST `api/TenantManagement/tenants/{id}/deactivate` - AdminOnly; [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- POST `api/TenantManagement/tenants/{id}/archive` - AdminOnly; [TenantResponse](../DTOs/Tenants/TenantResponse.cs). Soft-archives and deactivates the tenant.
- DELETE `api/TenantManagement/tenants/{id}` - AdminOnly. Hard-deletes an archived tenant record only. Does not delete module data or object storage.
- GET `api/TenantManagement/current` - public current tenant display metadata resolved from request host; [CurrentTenantResponse](../DTOs/Tenants/CurrentTenantResponse.cs)
