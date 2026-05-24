import type {
  CreateTenantAdminAccountRequest,
  CreateTenantAdminAccountResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  CurrentTenantResponse,
  ArchiveTenantResponse,
  ChangeTenantAdminEmailRequest,
  ListTenantsQuery,
  ListTenantsResponse,
  ListTenantAdminUsersResponse,
  ResetTenantAdminPasswordRequest,
  SetTenantAdminEnabledRequest,
  SystemAdminDashboardSummaryResponse,
  TenantAdminUserResponse,
  TenantProvisioningStatusResponse,
  TenantResponse,
  SetTenantActiveStateResponse,
  UpdateTenantAdminAccountRequest,
  UpdateTenantAdminAccountResponse,
  UpdateTenantLogoRequest,
  UpdateTenantLogoResponse,
  UpdateTenantRequest,
  UpdateTenantResponse,
} from "../types/tenantmanagement";

export * from "../types/tenantmanagement";

export interface ITenantManagementClient {
  // Contract method: listTenants. SystemAdmin-only tenant list with logo and admin dashboard URL.
  // Query: src/Modules/TenantManagement/DTOs/Tenants/ListTenantsRequest.cs
  // Item response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  listTenants(query?: ListTenantsQuery): Promise<ListTenantsResponse>;

  // Contract method: getSystemAdminDashboardSummary. SystemAdmin-only tenant dashboard counters.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/SystemAdminDashboardSummaryResponse.cs
  getSystemAdminDashboardSummary(): Promise<SystemAdminDashboardSummaryResponse>;

  // Contract method: getTenantById. SystemAdmin-only tenant detail.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  getTenantById(id: number): Promise<TenantResponse>;

  // Contract method: createTenant. SystemAdmin-only tenant basic-info creation with tenant admin account provisioning.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/CreateTenantRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  createTenant(input: CreateTenantRequest): Promise<CreateTenantResponse>;

  // Contract method: updateTenant. SystemAdmin-only tenant metadata update.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/UpdateTenantRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  updateTenant(id: number, input: UpdateTenantRequest): Promise<UpdateTenantResponse>;

  // Contract method: hardDeleteTenant. SystemAdmin-only permanent tenant delete. Tenant must already be archived.
  hardDeleteTenant(id: number): Promise<void>;

  // Contract method: updateTenantLogo. SystemAdmin-only logo key update after uploading the logo file.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/UpdateTenantLogoRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  updateTenantLogo(id: number, input: UpdateTenantLogoRequest): Promise<UpdateTenantLogoResponse>;

  // Contract method: createTenantAdminAccount. SystemAdmin-only tenant admin login provisioning.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/CreateTenantAdminAccountRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  createTenantAdminAccount(
    id: number,
    input: CreateTenantAdminAccountRequest,
  ): Promise<CreateTenantAdminAccountResponse>;

  // Contract method: updateTenantAdminAccount. SystemAdmin-only tenant admin account patch.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/UpdateTenantAdminAccountRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantAdminUserResponse.cs
  updateTenantAdminAccount(
    id: number,
    input: UpdateTenantAdminAccountRequest,
  ): Promise<UpdateTenantAdminAccountResponse>;

  // Contract method: listTenantAdminUsers. SystemAdmin-only tenant admin identity users.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantAdminUserResponse.cs
  listTenantAdminUsers(id: number): Promise<ListTenantAdminUsersResponse>;

  // Contract method: resetTenantAdminPassword. SystemAdmin-only tenant admin password reset.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/ResetTenantAdminPasswordRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantAdminUserResponse.cs
  resetTenantAdminPassword(id: number, input: ResetTenantAdminPasswordRequest): Promise<TenantAdminUserResponse>;

  // Contract method: changeTenantAdminEmail. SystemAdmin-only tenant admin email change.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/ChangeTenantAdminEmailRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantAdminUserResponse.cs
  changeTenantAdminEmail(id: number, input: ChangeTenantAdminEmailRequest): Promise<TenantAdminUserResponse>;

  // Contract method: setTenantAdminEnabled. SystemAdmin-only tenant admin enable/disable.
  // Request: src/Modules/TenantManagement/DTOs/Tenants/SetTenantAdminEnabledRequest.cs
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantAdminUserResponse.cs
  setTenantAdminEnabled(id: number, input: SetTenantAdminEnabledRequest): Promise<TenantAdminUserResponse>;

  // Contract method: getTenantProvisioningStatus. SystemAdmin-only tenant setup and R2 status.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantProvisioningStatusResponse.cs
  getTenantProvisioningStatus(id: number): Promise<TenantProvisioningStatusResponse>;

  // Contract method: getCurrentTenant. Public display metadata resolved from request host.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/CurrentTenantResponse.cs
  getCurrentTenant(): Promise<CurrentTenantResponse>;

  // Contract method: activateTenant. SystemAdmin-only tenant activation.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  activateTenant(id: number): Promise<SetTenantActiveStateResponse>;

  // Contract method: deactivateTenant. SystemAdmin-only tenant deactivation.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  deactivateTenant(id: number): Promise<SetTenantActiveStateResponse>;

  // Contract method: archiveTenant. SystemAdmin-only tenant soft archive.
  // Response: src/Modules/TenantManagement/DTOs/Tenants/TenantResponse.cs
  archiveTenant(id: number): Promise<ArchiveTenantResponse>;
}
