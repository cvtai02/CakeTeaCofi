using Microsoft.EntityFrameworkCore;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class SetTenantActiveState(TenantManagementDbContext db)
{
    public async Task<TenantResponse?> ExecuteAsync(int id, bool isActive, CancellationToken ct)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == id && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        tenant.IsActive = isActive;
        tenant.LastModified = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return TenantMapper.ToResponse(tenant);
    }
}
