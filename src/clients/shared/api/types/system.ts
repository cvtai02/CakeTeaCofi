import type { paths } from "../lib/openapi-types";
import type { JsonResponse } from "./path-type-helpers";

type SystemPaths = paths;
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof SystemPaths
        ? TMethod extends keyof SystemPaths[TPath]
            ? SystemPaths[TPath][TMethod]
            : never
        : never;

type CreateDatabaseBackupOperation =
    Operation<"/api/internal/database-backups", "post">;

export type CreateDatabaseBackupResponse =
    JsonResponse<CreateDatabaseBackupOperation>;
