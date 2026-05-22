import type {
  CreateDatabaseBackupResponse,
} from "../types/system";

export * from "../types/system";

export interface ISystemClient {
  // Contract method: createDatabaseBackup. SystemAdmin-only trigger that streams pg_dump directly to R2.
  // Response: src/AppHost/DTOs/DatabaseBackups/DatabaseBackupResponse.cs
  createDatabaseBackup(): Promise<CreateDatabaseBackupResponse>;
}
