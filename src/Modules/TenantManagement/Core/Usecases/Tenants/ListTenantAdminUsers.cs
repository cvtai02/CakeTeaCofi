using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class ListTenantAdminUsers(TenantManagementDbContext db, ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<IReadOnlyList<TenantAdminUserResponse>?> ExecuteAsync(int tenantId, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        if (string.IsNullOrWhiteSpace(tenant.AdminIdentityUserId))
            return [];

        var users = await accountProvisioner.ListAsync([tenant.AdminIdentityUserId], ct);
        return users.Select(x => ToResponse(tenant.Id, tenant.Signature, x)).ToList();
    }

    internal static TenantAdminUserResponse ToResponse(
        int tenantId,
        string tenantSignature,
        TenantAdminAccountInfo account) => new()
    {
        TenantId = tenantId,
        TenantSignature = tenantSignature,
        IdentityUserId = account.IdentityUserId,
        Email = account.Email,
        UserName = account.UserName,
        DisplayName = account.DisplayName,
        EmailConfirmed = account.EmailConfirmed,
        Enabled = account.Enabled,
        LockoutEnd = account.LockoutEnd
    };
}
