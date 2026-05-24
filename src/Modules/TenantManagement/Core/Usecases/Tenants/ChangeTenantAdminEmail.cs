using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class ChangeTenantAdminEmail(TenantManagementDbContext db, ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantAdminUserResponse?> ExecuteAsync(
        int tenantId,
        ChangeTenantAdminEmailRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            Throw(nameof(request.Email), "Email is required.");

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var identityUserId = RequireAdminIdentityUserId(tenant.AdminIdentityUserId);
        var email = request.Email.Trim();
        var result = await accountProvisioner.ChangeEmailAsync(identityUserId, email, ct);
        if (!result.Succeeded)
            Throw(nameof(request.Email), result.Errors.FirstOrDefault() ?? "Email could not be changed.");

        tenant.AdminEmail = email;
        tenant.LastModified = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

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
