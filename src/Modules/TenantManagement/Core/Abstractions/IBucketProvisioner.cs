namespace TenantManagement.Core.Abstractions;

public interface IBucketProvisioner
{
    Task EnsureBucketAsync(string bucketName, string? customDomain, CancellationToken cancellationToken);
}
