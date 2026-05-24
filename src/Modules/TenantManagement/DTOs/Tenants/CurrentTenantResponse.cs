using SharedKernel.EnumsConstants;

namespace TenantManagement.DTOs.Tenants;

public class CurrentTenantResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string CdnBaseUrl { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public CountryCode CountryCode { get; set; }
}
