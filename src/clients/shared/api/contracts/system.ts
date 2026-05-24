import type {
  CreateDatabaseBackupResponse,
  CreateR2BucketRequest,
  CreateR2BucketResponse,
  GetR2BucketStatusQuery,
  R2BucketStatusResponse,
  RetryR2CustomDomainRequest,
  RetryR2CustomDomainResponse,
} from "../types/system";

export * from "../types/system";

export interface ISystemClient {
  // Contract method: createDatabaseBackup. SystemAdmin-only trigger that streams pg_dump directly to R2.
  // Response: src/AppHost/DTOs/DatabaseBackups/DatabaseBackupResponse.cs
  createDatabaseBackup(): Promise<CreateDatabaseBackupResponse>;

  // Contract method: createR2Bucket. SystemAdmin-only Cloudflare R2 bucket creation.
  // Request: src/AppHost/DTOs/R2Buckets/CreateR2BucketRequest.cs
  // Response: src/AppHost/DTOs/R2Buckets/R2BucketResponse.cs
  createR2Bucket(input?: CreateR2BucketRequest): Promise<CreateR2BucketResponse>;

  // Contract method: getR2BucketStatus. SystemAdmin-only bucket/custom-domain status read.
  // Query: src/AppHost/DTOs/R2Buckets/R2BucketStatusResponse.cs
  // Response: src/AppHost/DTOs/R2Buckets/R2BucketStatusResponse.cs
  getR2BucketStatus(bucketName: string, query?: GetR2BucketStatusQuery): Promise<R2BucketStatusResponse>;

  // Contract method: retryR2CustomDomain. SystemAdmin-only retry attaching a custom domain to a bucket.
  // Request: src/AppHost/DTOs/R2Buckets/RetryR2CustomDomainRequest.cs
  // Response: src/AppHost/DTOs/R2Buckets/R2BucketStatusResponse.cs
  retryR2CustomDomain(bucketName: string, input: RetryR2CustomDomainRequest): Promise<RetryR2CustomDomainResponse>;
}
