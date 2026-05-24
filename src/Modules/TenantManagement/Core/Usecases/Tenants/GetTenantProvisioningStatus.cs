using Microsoft.EntityFrameworkCore;
using TenantManagement.Core.Abstractions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class GetTenantProvisioningStatus(
    TenantManagementDbContext db,
    ITenantStorageStatusProvider storageStatusProvider)
{
    public async Task<TenantProvisioningStatusResponse?> ExecuteAsync(int tenantId, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var bucketName = tenant.Signature;
        var customDomain = new Uri(tenant.CdnBaseUrl).Host;
        var storage = await storageStatusProvider.GetStatusAsync(bucketName, customDomain, ct);

        return new TenantProvisioningStatusResponse
        {
            TenantId = tenant.Id,
            Name = tenant.Name,
            Signature = tenant.Signature,
            Domain = tenant.Domain,
            CdnBaseUrl = tenant.CdnBaseUrl,
            BucketName = storage.BucketName,
            CustomDomain = storage.CustomDomain ?? customDomain,
            HasDomain = !string.IsNullOrWhiteSpace(tenant.Domain),
            HasLogo = !string.IsNullOrWhiteSpace(tenant.LogoKey),
            HasAdminAccount = !string.IsNullOrWhiteSpace(tenant.AdminIdentityUserId),
            BucketExists = storage.BucketExists,
            CustomDomainAttached = storage.CustomDomainAttached,
            CustomDomainStatus = storage.CustomDomainStatus,
            CheckedAt = storage.CheckedAt
        };
    }
}
