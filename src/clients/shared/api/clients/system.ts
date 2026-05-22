import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  CreateDatabaseBackupResponse,
} from "../types/system";
import type { ISystemClient } from "../contracts/system";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class SystemClient implements ISystemClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async createDatabaseBackup(): Promise<CreateDatabaseBackupResponse> {
    const { data, error } = await this.client.POST("/api/internal/database-backups");
    if (error) throw error;
    return requireData(data, "Database backup response was empty.");
  }
}
