using Microsoft.EntityFrameworkCore;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class GetSystemAdminDashboardSummary(TenantManagementDbContext db)
{
    public async Task<SystemAdminDashboardSummaryResponse> ExecuteAsync(CancellationToken ct)
    {
        var tenants = await db.Tenants.AsNoTracking().ToListAsync(ct);
        var activeTenants = tenants.Where(x => !x.IsArchived).ToList();

        return new SystemAdminDashboardSummaryResponse
        {
            TotalTenants = activeTenants.Count,
            ActiveTenants = activeTenants.Count(x => x.IsActive),
            InactiveTenants = activeTenants.Count(x => !x.IsActive),
            ArchivedTenants = tenants.Count(x => x.IsArchived),
            TenantsMissingLogo = activeTenants.Count(x => string.IsNullOrWhiteSpace(x.LogoKey)),
            TenantsMissingDomain = activeTenants.Count(x => string.IsNullOrWhiteSpace(x.Domain)),
            TenantsMissingAdminAccount = activeTenants.Count(x => string.IsNullOrWhiteSpace(x.AdminIdentityUserId)),
            RecentTenants = activeTenants
                .OrderByDescending(x => x.Created)
                .ThenByDescending(x => x.Id)
                .Take(5)
                .Select(TenantMapper.ToResponse)
                .ToList()
        };
    }
}
