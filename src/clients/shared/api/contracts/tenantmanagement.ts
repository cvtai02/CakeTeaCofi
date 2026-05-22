import type {
  CreateTenantRequest,
  CreateTenantResponse,
  ListTenantsQuery,
  ListTenantsResponse,
  TenantResponse,
} from "../types/tenantmanagement";

export * from "../types/tenantmanagement";

export interface ITenantManagementClient {
  // Contract method: listTenants. SystemAdmin-only tenant list with logo and admin dashboard URL.
  // Query: src/Modules/TenantManagement/DTOs/Tenants/ListTenantsRequest.cs
  // Item response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  listTenants(query?: ListTenantsQuery): Promise<ListTenantsResponse>;

  // Contract method: getTenantById. SystemAdmin-only tenant detail.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  getTenantById(id: number): Promise<TenantResponse>;

  // Contract method: createTenant. SystemAdmin-only tenant creation.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/CreateTenantRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  createTenant(input: CreateTenantRequest): Promise<CreateTenantResponse>;
}
