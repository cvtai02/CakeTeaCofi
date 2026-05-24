using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class GetCurrentTenant(TenantManagementDbContext db, ITenant tenant)
{
    public async Task<CurrentTenantResponse> ExecuteAsync(CancellationToken ct)
    {
        var logoKey = await db.Tenants
            .AsNoTracking()
            .Where(x => x.Id == tenant.Id && x.IsActive)
            .Select(x => x.LogoKey)
            .FirstOrDefaultAsync(ct);

        return new CurrentTenantResponse
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Domain = tenant.Domain,
            CdnBaseUrl = tenant.CdnBaseUrl,
            LogoUrl = string.IsNullOrWhiteSpace(logoKey)
                ? null
                : $"{tenant.CdnBaseUrl.TrimEnd('/')}/{logoKey.TrimStart('/')}",
            CountryCode = tenant.CountryCode
        };
    }
}
