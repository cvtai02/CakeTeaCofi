using SharedKernel.EnumsConstants;

namespace TenantManagement.DTOs.Tenants;

public class TenantResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string CdnBaseUrl { get; set; } = string.Empty;
    public string? LogoKey { get; set; }
    public string? LogoUrl { get; set; }
    public string AdminDashboardUrl { get; set; } = string.Empty;
    public CountryCode CountryCode { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset LastModified { get; set; }
}
