namespace TenantManagement.Core.Abstractions;

public interface ITenantStorageStatusProvider
{
    Task<TenantStorageStatus> GetStatusAsync(
        string bucketName,
        string? customDomain,
        CancellationToken cancellationToken);
}

public sealed record TenantStorageStatus(
    string BucketName,
    bool BucketExists,
    string? CustomDomain,
    bool CustomDomainAttached,
    bool? CustomDomainEnabled,
    string? CustomDomainStatus,
    DateTimeOffset CheckedAt);
