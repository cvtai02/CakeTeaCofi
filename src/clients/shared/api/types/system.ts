import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

type SystemPaths = paths;
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof SystemPaths
        ? TMethod extends keyof SystemPaths[TPath]
            ? SystemPaths[TPath][TMethod]
            : never
        : never;

type CreateDatabaseBackupOperation =
    Operation<"/api/internal/database-backups", "post">;
type CreateR2BucketOperation =
    Operation<"/api/internal/r2-buckets", "post">;
type GetR2BucketStatusOperation =
    Operation<"/api/internal/r2-buckets/{bucketName}/status", "get">;
type RetryR2CustomDomainOperation =
    Operation<"/api/internal/r2-buckets/{bucketName}/custom-domain/retry", "post">;

export type CreateDatabaseBackupResponse =
    JsonResponse<CreateDatabaseBackupOperation>;
export type CreateR2BucketRequest =
    JsonRequestBody<CreateR2BucketOperation>;
export type CreateR2BucketResponse =
    JsonResponse<CreateR2BucketOperation>;

export type GetR2BucketStatusParams =
    PathParams<GetR2BucketStatusOperation>;
export type GetR2BucketStatusQuery =
    QueryParams<GetR2BucketStatusOperation>;
export type R2BucketStatusResponse =
    JsonResponse<GetR2BucketStatusOperation>;

export type RetryR2CustomDomainParams =
    PathParams<RetryR2CustomDomainOperation>;
export type RetryR2CustomDomainRequest =
    JsonRequestBody<RetryR2CustomDomainOperation>;
export type RetryR2CustomDomainResponse =
    JsonResponse<RetryR2CustomDomainOperation>;
