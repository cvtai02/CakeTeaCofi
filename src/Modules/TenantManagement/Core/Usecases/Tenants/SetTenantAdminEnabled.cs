using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class SetTenantAdminEnabled(TenantManagementDbContext db, ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantAdminUserResponse?> ExecuteAsync(
        int tenantId,
        SetTenantAdminEnabledRequest request,
        CancellationToken ct)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var identityUserId = RequireAdminIdentityUserId(tenant.AdminIdentityUserId);
        var result = await accountProvisioner.SetEnabledAsync(identityUserId, request.Enabled, ct);
        if (!result.Succeeded)
            Throw("enabled", result.Errors.FirstOrDefault() ?? "Tenant admin account state could not be changed.");

        var user = await accountProvisioner.GetAsync(identityUserId, ct);
        return user is null ? null : ListTenantAdminUsers.ToResponse(tenant.Id, tenant.Signature, user);
    }

    private static string RequireAdminIdentityUserId(string? identityUserId)
    {
        if (!string.IsNullOrWhiteSpace(identityUserId))
            return identityUserId;

        Throw("adminAccount", "Tenant admin account does not exist.");
        return string.Empty;
    }

    private static void Throw(string field, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });
}
