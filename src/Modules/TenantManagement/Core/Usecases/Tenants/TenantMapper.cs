using TenantManagement.Core.Entities;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

internal static class TenantMapper
{
    public static TenantResponse ToResponse(TenantRecord tenant) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Signature = tenant.Signature,
        Domain = tenant.Domain,
        CdnBaseUrl = tenant.CdnBaseUrl,
        LogoKey = tenant.LogoKey,
        LogoUrl = BuildLogoUrl(tenant),
        AdminEmail = tenant.AdminEmail,
        CountryCode = tenant.CountryCode,
        IsActive = tenant.IsActive,
        IsArchived = tenant.IsArchived,
        Created = tenant.Created,
        LastModified = tenant.LastModified
    };

    private static string? BuildLogoUrl(TenantRecord tenant)
    {
        if (string.IsNullOrWhiteSpace(tenant.LogoKey))
            return null;

        return $"{tenant.CdnBaseUrl.TrimEnd('/')}/{tenant.LogoKey.TrimStart('/')}";
    }
}
