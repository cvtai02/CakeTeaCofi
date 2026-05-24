import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
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
  TenantResponse,
  SetTenantAdminEnabledRequest,
  SetTenantActiveStateResponse,
  SystemAdminDashboardSummaryResponse,
  TenantAdminUserResponse,
  TenantProvisioningStatusResponse,
  UpdateTenantAdminAccountRequest,
  UpdateTenantAdminAccountResponse,
  UpdateTenantLogoRequest,
  UpdateTenantLogoResponse,
  UpdateTenantRequest,
  UpdateTenantResponse,
} from "../types/tenantmanagement";
import type { ITenantManagementClient } from "../contracts/tenantmanagement";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class TenantManagementClient implements ITenantManagementClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async listTenants(query?: ListTenantsQuery): Promise<ListTenantsResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/tenants", { params: { query } });
    if (error) throw error;
    return requireData(data, "Tenants response was empty.");
  }

  async getSystemAdminDashboardSummary(): Promise<SystemAdminDashboardSummaryResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/tenants/summary");
    if (error) throw error;
    return requireData(data, "Tenant summary response was empty.");
  }

  async getTenantById(id: number): Promise<TenantResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/tenants/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Tenant response was empty.");
  }

  async createTenant(input: CreateTenantRequest): Promise<CreateTenantResponse> {
    const { data, error } = await this.client.POST("/api/TenantManagement/tenants", { body: input });
    if (error) throw error;
    return requireData(data, "Create tenant response was empty.");
  }

  async updateTenant(id: number, input: UpdateTenantRequest): Promise<UpdateTenantResponse> {
    const { data, error } = await this.client.PUT("/api/TenantManagement/tenants/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update tenant response was empty.");
  }

  async hardDeleteTenant(id: number): Promise<void> {
    const { error } = await this.client.DELETE("/api/TenantManagement/tenants/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
  }

  async updateTenantLogo(id: number, input: UpdateTenantLogoRequest): Promise<UpdateTenantLogoResponse> {
    const { data, error } = await this.client.PUT("/api/TenantManagement/tenants/{id}/logo", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update tenant logo response was empty.");
  }

  async createTenantAdminAccount(
    id: number,
    input: CreateTenantAdminAccountRequest,
  ): Promise<CreateTenantAdminAccountResponse> {
    const { data, error } = await this.client.POST("/api/TenantManagement/tenants/{id}/admin-account", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Create tenant admin account response was empty.");
  }

  async updateTenantAdminAccount(
    id: number,
    input: UpdateTenantAdminAccountRequest,
  ): Promise<UpdateTenantAdminAccountResponse> {
    const { data, error } = await this.client.PUT("/api/TenantManagement/tenants/{id}/admin-account", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update tenant admin account response was empty.");
  }

  async listTenantAdminUsers(id: number): Promise<ListTenantAdminUsersResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/tenants/{id}/admin-users", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Tenant admin users response was empty.");
  }

  async resetTenantAdminPassword(
    id: number,
    input: ResetTenantAdminPasswordRequest,
  ): Promise<TenantAdminUserResponse> {
    const { data, error } = await this.client.POST(
      "/api/TenantManagement/tenants/{id}/admin-account/reset-password",
      {
        params: { path: { id } },
        body: input,
      },
    );
    if (error) throw error;
    return requireData(data, "Reset tenant admin password response was empty.");
  }

  async changeTenantAdminEmail(id: number, input: ChangeTenantAdminEmailRequest): Promise<TenantAdminUserResponse> {
    const { data, error } = await this.client.PUT("/api/TenantManagement/tenants/{id}/admin-account/email", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Change tenant admin email response was empty.");
  }

  async setTenantAdminEnabled(id: number, input: SetTenantAdminEnabledRequest): Promise<TenantAdminUserResponse> {
    const { data, error } = await this.client.PUT("/api/TenantManagement/tenants/{id}/admin-account/enabled", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Set tenant admin enabled response was empty.");
  }

  async getTenantProvisioningStatus(id: number): Promise<TenantProvisioningStatusResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/tenants/{id}/provisioning-status", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Tenant provisioning status response was empty.");
  }

  async getCurrentTenant(): Promise<CurrentTenantResponse> {
    const { data, error } = await this.client.GET("/api/TenantManagement/current");
    if (error) throw error;
    return requireData(data, "Current tenant response was empty.");
  }

  async activateTenant(id: number): Promise<SetTenantActiveStateResponse> {
    const { data, error } = await this.client.POST("/api/TenantManagement/tenants/{id}/activate", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Activate tenant response was empty.");
  }

  async deactivateTenant(id: number): Promise<SetTenantActiveStateResponse> {
    const { data, error } = await this.client.POST("/api/TenantManagement/tenants/{id}/deactivate", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Deactivate tenant response was empty.");
  }

  async archiveTenant(id: number): Promise<ArchiveTenantResponse> {
    const { data, error } = await this.client.POST("/api/TenantManagement/tenants/{id}/archive", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Archive tenant response was empty.");
  }
}
