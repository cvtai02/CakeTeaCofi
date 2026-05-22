import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  CreateTenantRequest,
  CreateTenantResponse,
  ListTenantsQuery,
  ListTenantsResponse,
  TenantResponse,
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
}
