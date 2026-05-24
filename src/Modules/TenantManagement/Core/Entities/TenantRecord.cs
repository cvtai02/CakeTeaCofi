using SharedKernel.EnumsConstants;

namespace TenantManagement.Core.Entities;

public class TenantRecord
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string CdnBaseUrl { get; set; } = string.Empty;
    public string? LogoKey { get; set; }
    public string? AdminEmail { get; set; }
    public string? AdminIdentityUserId { get; set; }
    public CountryCode CountryCode { get; set; } = CountryCode.VN;
    public bool IsActive { get; set; } = true;
    public bool IsArchived { get; set; }
    public DateTimeOffset Created { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastModified { get; set; } = DateTimeOffset.UtcNow;
}
