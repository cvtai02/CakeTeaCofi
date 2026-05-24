namespace TenantManagement.Infrastructure.R2Buckets;

public class R2BucketStatusResult
{
    public string BucketName { get; set; } = string.Empty;
    public bool BucketExists { get; set; }
    public string? CustomDomain { get; set; }
    public bool CustomDomainAttached { get; set; }
    public bool? CustomDomainEnabled { get; set; }
    public string? CustomDomainStatus { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
}
