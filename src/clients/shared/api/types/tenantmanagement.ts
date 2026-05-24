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
type GetSystemAdminDashboardSummaryOperation =
    Operation<"/api/TenantManagement/tenants/summary", "get">;
type CreateTenantOperation =
    Operation<"/api/TenantManagement/tenants", "post">;
type GetTenantByIdOperation =
    Operation<"/api/TenantManagement/tenants/{id}", "get">;
type UpdateTenantOperation =
    Operation<"/api/TenantManagement/tenants/{id}", "put">;
type HardDeleteTenantOperation =
    Operation<"/api/TenantManagement/tenants/{id}", "delete">;
type UpdateTenantLogoOperation =
    Operation<"/api/TenantManagement/tenants/{id}/logo", "put">;
type CreateTenantAdminAccountOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-account", "post">;
type UpdateTenantAdminAccountOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-account", "put">;
type ListTenantAdminUsersOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-users", "get">;
type ResetTenantAdminPasswordOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-account/reset-password", "post">;
type ChangeTenantAdminEmailOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-account/email", "put">;
type SetTenantAdminEnabledOperation =
    Operation<"/api/TenantManagement/tenants/{id}/admin-account/enabled", "put">;
type GetTenantProvisioningStatusOperation =
    Operation<"/api/TenantManagement/tenants/{id}/provisioning-status", "get">;
type GetCurrentTenantOperation =
    Operation<"/api/TenantManagement/current", "get">;
type ActivateTenantOperation =
    Operation<"/api/TenantManagement/tenants/{id}/activate", "post">;
type DeactivateTenantOperation =
    Operation<"/api/TenantManagement/tenants/{id}/deactivate", "post">;
type ArchiveTenantOperation =
    Operation<"/api/TenantManagement/tenants/{id}/archive", "post">;

export type ListTenantsQuery =
    QueryParams<ListTenantsOperation>;
export type ListTenantsResponse =
    JsonResponse<ListTenantsOperation>;
export type SystemAdminDashboardSummaryResponse =
    JsonResponse<GetSystemAdminDashboardSummaryOperation>;

export type CreateTenantRequest =
    JsonRequestBody<CreateTenantOperation>;
export type CreateTenantResponse =
    JsonResponse<CreateTenantOperation>;

export type GetTenantByIdParams =
    PathParams<GetTenantByIdOperation>;
export type TenantResponse =
    JsonResponse<GetTenantByIdOperation>;

export type UpdateTenantParams =
    PathParams<UpdateTenantOperation>;
export type UpdateTenantRequest =
    JsonRequestBody<UpdateTenantOperation>;
export type UpdateTenantResponse =
    JsonResponse<UpdateTenantOperation>;

export type HardDeleteTenantParams =
    PathParams<HardDeleteTenantOperation>;

export type UpdateTenantLogoParams =
    PathParams<UpdateTenantLogoOperation>;
export type UpdateTenantLogoRequest =
    JsonRequestBody<UpdateTenantLogoOperation>;
export type UpdateTenantLogoResponse =
    JsonResponse<UpdateTenantLogoOperation>;

export type CreateTenantAdminAccountParams =
    PathParams<CreateTenantAdminAccountOperation>;
export type CreateTenantAdminAccountRequest =
    JsonRequestBody<CreateTenantAdminAccountOperation>;
export type CreateTenantAdminAccountResponse =
    JsonResponse<CreateTenantAdminAccountOperation>;

export type UpdateTenantAdminAccountParams =
    PathParams<UpdateTenantAdminAccountOperation>;
export type UpdateTenantAdminAccountRequest =
    JsonRequestBody<UpdateTenantAdminAccountOperation>;
export type UpdateTenantAdminAccountResponse =
    JsonResponse<UpdateTenantAdminAccountOperation>;

export type ListTenantAdminUsersParams =
    PathParams<ListTenantAdminUsersOperation>;
export type ListTenantAdminUsersResponse =
    JsonResponse<ListTenantAdminUsersOperation>;

export type ResetTenantAdminPasswordParams =
    PathParams<ResetTenantAdminPasswordOperation>;
export type ResetTenantAdminPasswordRequest =
    JsonRequestBody<ResetTenantAdminPasswordOperation>;
export type TenantAdminUserResponse =
    JsonResponse<ResetTenantAdminPasswordOperation>;

export type ChangeTenantAdminEmailParams =
    PathParams<ChangeTenantAdminEmailOperation>;
export type ChangeTenantAdminEmailRequest =
    JsonRequestBody<ChangeTenantAdminEmailOperation>;

export type SetTenantAdminEnabledParams =
    PathParams<SetTenantAdminEnabledOperation>;
export type SetTenantAdminEnabledRequest =
    JsonRequestBody<SetTenantAdminEnabledOperation>;

export type TenantProvisioningStatusResponse =
    JsonResponse<GetTenantProvisioningStatusOperation>;

export type CurrentTenantResponse =
    JsonResponse<GetCurrentTenantOperation>;
export type SetTenantActiveStateResponse =
    JsonResponse<ActivateTenantOperation> | JsonResponse<DeactivateTenantOperation>;
export type ArchiveTenantResponse =
    JsonResponse<ArchiveTenantOperation>;
