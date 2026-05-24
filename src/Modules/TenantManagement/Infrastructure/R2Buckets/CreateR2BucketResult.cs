namespace TenantManagement.Infrastructure.R2Buckets;

public class CreateR2BucketResult
{
    public string BucketName { get; set; } = string.Empty;
    public bool Created { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
}
