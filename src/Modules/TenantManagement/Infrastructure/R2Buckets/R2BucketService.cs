using System.Net;
using System.Text.RegularExpressions;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;
using TenantManagement.Core.Abstractions;

namespace TenantManagement.Infrastructure.R2Buckets;

public partial class R2BucketService(IConfiguration configuration, ITenant tenant)
    : IR2BucketService, IBucketProvisioner, ITenantStorageStatusProvider
{
    private readonly FileStorageSettings storageSettings = FileStorageSettings.From(configuration);

    public async Task EnsureBucketAsync(string bucketName, string? customDomain, CancellationToken cancellationToken)
    {
        await CreateBucketAsync(bucketName, cancellationToken);
    }

    public async Task<CreateR2BucketResult> CreateBucketAsync(
        string? bucketName,
        CancellationToken cancellationToken)
    {
        EnsureCloudflareR2();

        var normalizedBucketName = NormalizeBucketName(bucketName);
        ValidateBucketName(normalizedBucketName);

        using var client = CreateClient();
        var checkedAt = DateTimeOffset.UtcNow;

        if (await BucketExistsAsync(client, normalizedBucketName, cancellationToken))
        {
            return new CreateR2BucketResult
            {
                BucketName = normalizedBucketName,
                Created = false,
                CheckedAt = checkedAt
            };
        }

        try
        {
            await client.PutBucketAsync(new PutBucketRequest
            {
                BucketName = normalizedBucketName,
                UseClientRegion = true
            }, cancellationToken);
        }
        catch (AmazonS3Exception ex) when (IsAlreadyExists(ex))
        {
            return new CreateR2BucketResult
            {
                BucketName = normalizedBucketName,
                Created = false,
                CheckedAt = checkedAt
            };
        }
        catch (AmazonS3Exception ex)
        {
            throw new R2BucketException($"Cloudflare R2 failed to create bucket '{normalizedBucketName}'.", ex);
        }

        return new CreateR2BucketResult
        {
            BucketName = normalizedBucketName,
            Created = true,
            CheckedAt = checkedAt
        };
    }

    public async Task<R2BucketStatusResult> GetStatusAsync(
        string? bucketName,
        string? customDomain,
        CancellationToken cancellationToken)
    {
        EnsureCloudflareR2();

        var normalizedBucketName = NormalizeBucketName(bucketName);
        ValidateBucketName(normalizedBucketName);

        using var client = CreateClient();
        var exists = await BucketExistsAsync(client, normalizedBucketName, cancellationToken);

        return new R2BucketStatusResult
        {
            BucketName = normalizedBucketName,
            BucketExists = exists,
            CustomDomain = NormalizeCustomDomain(customDomain),
            CheckedAt = DateTimeOffset.UtcNow
        };
    }

    async Task<TenantStorageStatus> ITenantStorageStatusProvider.GetStatusAsync(
        string bucketName,
        string? customDomain,
        CancellationToken cancellationToken)
    {
        var status = await GetStatusAsync(bucketName, customDomain, cancellationToken);
        return new TenantStorageStatus(
            status.BucketName,
            status.BucketExists,
            status.CustomDomain,
            status.CustomDomainAttached,
            status.CustomDomainEnabled,
            status.CustomDomainStatus,
            status.CheckedAt);
    }

    public Task<R2BucketStatusResult> RetryAttachCustomDomainAsync(
        string bucketName,
        string customDomain,
        CancellationToken cancellationToken)
    {
        throw Validation("CustomDomain", "Custom domain is managed outside the app. Configure the R2 custom domain in Cloudflare, then use the status endpoint to confirm bucket existence.");
    }

    private string NormalizeBucketName(string? bucketName)
    {
        var value = string.IsNullOrWhiteSpace(bucketName)
            ? tenant.Signature
            : bucketName.Trim();

        return value.ToLowerInvariant();
    }

    private static string? NormalizeCustomDomain(string? customDomain)
        => string.IsNullOrWhiteSpace(customDomain)
            ? null
            : customDomain.Trim().TrimEnd('/').Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
                .ToLowerInvariant();

    private static async Task<bool> BucketExistsAsync(
        IAmazonS3 client,
        string bucketName,
        CancellationToken cancellationToken)
    {
        try
        {
            await client.ListObjectsV2Async(new ListObjectsV2Request
            {
                BucketName = bucketName,
                MaxKeys = 0
            }, cancellationToken);

            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode is HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    private AmazonS3Client CreateClient()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = storageSettings.ApiUrl,
            ForcePathStyle = true,
            AuthenticationRegion = "auto",
        };

        AWSCredentials credentials = new BasicAWSCredentials(
            storageSettings.AccessKeyId,
            storageSettings.SecretAccessKey);

        return new AmazonS3Client(credentials, config);
    }

    private void EnsureCloudflareR2()
    {
        if (!string.Equals(storageSettings.Provider, "CloudflareR2", StringComparison.OrdinalIgnoreCase))
            throw new R2BucketException("R2 bucket operations require FileStorage.Provider = CloudflareR2.");
    }

    private static void ValidateBucketName(string bucketName)
    {
        if (!BucketNameRegex().IsMatch(bucketName))
            throw Validation("BucketName", "Bucket name must be 3-63 characters, lowercase letters, numbers, and hyphens, and must start and end with a letter or number.");

        if (bucketName.Contains("--", StringComparison.Ordinal))
            throw Validation("BucketName", "Bucket name must not contain consecutive hyphens.");

        if (IPAddress.TryParse(bucketName, out _))
            throw Validation("BucketName", "Bucket name must not be formatted as an IP address.");
    }

    private static bool IsAlreadyExists(AmazonS3Exception ex)
        => string.Equals(ex.ErrorCode, "BucketAlreadyExists", StringComparison.OrdinalIgnoreCase) ||
           string.Equals(ex.ErrorCode, "BucketAlreadyOwnedByYou", StringComparison.OrdinalIgnoreCase) ||
           ex.StatusCode is HttpStatusCode.Conflict;

    private static ValidationException Validation(string field, string message)
        => new("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });

    [GeneratedRegex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$")]
    private static partial Regex BucketNameRegex();

    private sealed class FileStorageSettings
    {
        public string Provider { get; init; } = string.Empty;
        public string ApiUrl { get; init; } = string.Empty;
        public string AccessKeyId { get; init; } = string.Empty;
        public string SecretAccessKey { get; init; } = string.Empty;

        public static FileStorageSettings From(IConfiguration configuration)
        {
            var settings = configuration.GetSection("FileStorage").Get<FileStorageSettings>() ?? new FileStorageSettings();

            if (string.IsNullOrWhiteSpace(settings.ApiUrl))
                throw new R2BucketException("Missing FileStorage:ApiUrl.");
            if (string.IsNullOrWhiteSpace(settings.AccessKeyId))
                throw new R2BucketException("Missing FileStorage:AccessKeyId.");
            if (string.IsNullOrWhiteSpace(settings.SecretAccessKey))
                throw new R2BucketException("Missing FileStorage:SecretAccessKey.");

            return settings;
        }
    }
}
