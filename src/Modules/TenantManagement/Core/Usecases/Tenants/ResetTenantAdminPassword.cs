using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class ResetTenantAdminPassword(TenantManagementDbContext db, ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantAdminUserResponse?> ExecuteAsync(
        int tenantId,
        ResetTenantAdminPasswordRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
            Throw(nameof(request.NewPassword), "New password is required.");

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var identityUserId = RequireAdminIdentityUserId(tenant.AdminIdentityUserId);
        var result = await accountProvisioner.ResetPasswordAsync(identityUserId, request.NewPassword, ct);
        if (!result.Succeeded)
            Throw(nameof(request.NewPassword), result.Errors.FirstOrDefault() ?? "Password could not be reset.");

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
