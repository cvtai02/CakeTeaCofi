import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

type TenantManagementPaths = paths;
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof TenantManagementPaths
        ? TMethod extends keyof TenantManagementPaths[TPath]
            ? TenantManagementPaths[TPath][TMethod]
            : never
        : never;

type ListTenantsOperation =
    Operation<"/api/TenantManagement/tenants", "get">;
type CreateTenantOperation =
    Operation<"/api/TenantManagement/tenants", "post">;
type GetTenantByIdOperation =
    Operation<"/api/TenantManagement/tenants/{id}", "get">;

export type ListTenantsQuery =
    QueryParams<ListTenantsOperation>;
export type ListTenantsResponse =
    JsonResponse<ListTenantsOperation>;

export type CreateTenantRequest =
    JsonRequestBody<CreateTenantOperation>;
export type CreateTenantResponse =
    JsonResponse<CreateTenantOperation>;

export type GetTenantByIdParams =
    PathParams<GetTenantByIdOperation>;
export type TenantResponse =
    JsonResponse<GetTenantByIdOperation>;
