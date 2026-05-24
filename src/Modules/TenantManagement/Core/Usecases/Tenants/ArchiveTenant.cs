using Microsoft.EntityFrameworkCore;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class ArchiveTenant(TenantManagementDbContext db)
{
    public async Task<TenantResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (tenant is null)
            return null;

        tenant.IsArchived = true;
        tenant.IsActive = false;
        tenant.LastModified = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return TenantMapper.ToResponse(tenant);
    }
}
