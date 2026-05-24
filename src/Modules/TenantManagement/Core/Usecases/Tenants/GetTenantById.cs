using Microsoft.EntityFrameworkCore;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class GetTenantById(TenantManagementDbContext db)
{
    public async Task<TenantResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsArchived, ct);

        return tenant is null ? null : TenantMapper.ToResponse(tenant);
    }
}
