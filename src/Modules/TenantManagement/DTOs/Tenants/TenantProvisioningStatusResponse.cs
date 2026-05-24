namespace TenantManagement.DTOs.Tenants;

public class TenantProvisioningStatusResponse
{
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string CdnBaseUrl { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string CustomDomain { get; set; } = string.Empty;
    public bool HasDomain { get; set; }
    public bool HasLogo { get; set; }
    public bool HasAdminAccount { get; set; }
    public bool BucketExists { get; set; }
    public bool CustomDomainAttached { get; set; }
    public string? CustomDomainStatus { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
}
