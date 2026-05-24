import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  CreateDatabaseBackupResponse,
  CreateR2BucketRequest,
  CreateR2BucketResponse,
  GetR2BucketStatusQuery,
  R2BucketStatusResponse,
  RetryR2CustomDomainRequest,
  RetryR2CustomDomainResponse,
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

  async createR2Bucket(input?: CreateR2BucketRequest): Promise<CreateR2BucketResponse> {
    const { data, error } = await this.client.POST("/api/internal/r2-buckets", {
      body: input ?? null,
    });
    if (error) throw error;
    return requireData(data, "R2 bucket response was empty.");
  }

  async getR2BucketStatus(bucketName: string, query?: GetR2BucketStatusQuery): Promise<R2BucketStatusResponse> {
    const { data, error } = await this.client.GET("/api/internal/r2-buckets/{bucketName}/status", {
      params: { path: { bucketName }, query },
    });
    if (error) throw error;
    return requireData(data, "R2 bucket status response was empty.");
  }

  async retryR2CustomDomain(
    bucketName: string,
    input: RetryR2CustomDomainRequest,
  ): Promise<RetryR2CustomDomainResponse> {
    const { data, error } = await this.client.POST("/api/internal/r2-buckets/{bucketName}/custom-domain/retry", {
      params: { path: { bucketName } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Retry R2 custom domain response was empty.");
  }
}
