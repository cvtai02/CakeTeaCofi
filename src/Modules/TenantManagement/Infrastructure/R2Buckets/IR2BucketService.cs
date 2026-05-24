namespace TenantManagement.Infrastructure.R2Buckets;

public interface IR2BucketService
{
    Task<CreateR2BucketResult> CreateBucketAsync(string? bucketName, CancellationToken cancellationToken);
    Task<R2BucketStatusResult> GetStatusAsync(string? bucketName, string? customDomain, CancellationToken cancellationToken);
    Task<R2BucketStatusResult> RetryAttachCustomDomainAsync(string bucketName, string customDomain, CancellationToken cancellationToken);
}
