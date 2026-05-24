using Microsoft.EntityFrameworkCore;
using Intermediary.Tenants;
using SharedKernel.EnumsConstants;
using SharedKernel.Exceptions;
using TenantManagement.Core.Abstractions;
using TenantManagement.Core.Entities;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class CreateTenant(
    TenantManagementDbContext db,
    IBucketProvisioner bucketProvisioner,
    ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantResponse> ExecuteAsync(CreateTenantRequest request, CancellationToken ct)
    {
        Validate(request);

        var signature = NormalizeSignature(request.Signature);
        var domain = NormalizeDomain(request.Domain);
        var signatureExists = await db.Tenants.AnyAsync(x => !x.IsArchived && x.Signature == signature, ct);
        var domainExists = domain is not null &&
            await db.Tenants.AnyAsync(x => !x.IsArchived && x.Domain != null && x.Domain.ToLower() == domain.ToLower(), ct);

        if (signatureExists || domainExists)
        {
            var errors = new Dictionary<string, string[]>();

            if (signatureExists)
                errors[nameof(request.Signature)] = ["Tenant signature already exists."];

            if (domainExists)
                errors[nameof(request.Domain)] = ["Tenant domain already exists."];

            throw new ValidationException("Validation failed", errors);
        }

        var cdnBaseUrl = BuildTenantCdnBaseUrl(signature);
        var cdnCustomDomain = new Uri(cdnBaseUrl).Host;

        try
        {
            await bucketProvisioner.EnsureBucketAsync(signature, cdnCustomDomain, ct);
        }
        catch (Exception ex)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Signature)] = [$"Tenant bucket could not be created for signature '{signature}': {ex.Message}"]
            });
        }

        var email = request.Email.Trim();
        var accountResult = await accountProvisioner.CreateAsync(email, request.Password, request.Name.Trim(), ct);
        if (!accountResult.Succeeded || string.IsNullOrWhiteSpace(accountResult.IdentityUserId))
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Email)] = [accountResult.Errors.FirstOrDefault() ?? "Tenant admin account could not be created."]
            });
        }

        var now = DateTimeOffset.UtcNow;
        var tenant = new TenantRecord
        {
            Name = request.Name.Trim(),
            Signature = signature,
            Domain = domain,
            CdnBaseUrl = cdnBaseUrl,
            AdminEmail = email,
            AdminIdentityUserId = accountResult.IdentityUserId,
            CountryCode = request.CountryCode,
            IsActive = true,
            Created = now,
            LastModified = now
        };

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync(ct);

        return TenantMapper.ToResponse(tenant);
    }

    private static void Validate(CreateTenantRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
            errors[nameof(request.Name)] = ["Tenant name is required."];
        if (string.IsNullOrWhiteSpace(request.Signature))
            errors[nameof(request.Signature)] = ["Tenant signature is required."];
        if (!Enum.IsDefined(request.CountryCode))
            errors[nameof(request.CountryCode)] = ["Country code is invalid."];
        if (string.IsNullOrWhiteSpace(request.Email))
            errors[nameof(request.Email)] = ["Tenant admin email is required."];
        if (string.IsNullOrWhiteSpace(request.Password))
            errors[nameof(request.Password)] = ["Tenant admin password is required."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static string NormalizeSignature(string value)
        => value.Trim().ToLowerInvariant();

    private static string? NormalizeDomain(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim().TrimEnd('/').Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .ToLowerInvariant();
    }

    private static string BuildTenantCdnBaseUrl(string signature)
        => $"https://cdn-{signature}.{AppDomainConstants.Nekomin}";
}
