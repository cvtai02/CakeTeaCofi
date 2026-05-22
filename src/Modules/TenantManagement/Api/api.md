# Tenant Management Module API

## API Endpoints

Client contract: [TenantManagementClient](../../../clients/shared/api/clients/tenantmanagement.ts), [ITenantManagementClient](../../../clients/shared/api/contracts/tenantmanagement.ts)

### Tenants
- GET `api/TenantManagement/tenants` - AdminOnly; [ListTenantsRequest](../DTOs/Tenants/ListTenantsRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- GET `api/TenantManagement/tenants/{id}` - AdminOnly; [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
- POST `api/TenantManagement/tenants` - AdminOnly; [CreateTenantRequest](../DTOs/Tenants/CreateTenantRequest.cs), [TenantResponse](../DTOs/Tenants/TenantResponse.cs)
