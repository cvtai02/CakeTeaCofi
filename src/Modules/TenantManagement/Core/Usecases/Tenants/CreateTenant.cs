using Microsoft.EntityFrameworkCore;
using SharedKernel.EnumsConstants;
using SharedKernel.Exceptions;
using TenantManagement.Core.Entities;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class CreateTenant(TenantManagementDbContext db)
{
    public async Task<TenantResponse> ExecuteAsync(CreateTenantRequest request, CancellationToken ct)
    {
        Validate(request);

        var signature = NormalizeSignature(request.Signature);
        var domain = NormalizeDomain(request.Domain);
        var exists = await db.Tenants.AnyAsync(x =>
            x.Signature == signature ||
            x.Domain.ToLower() == domain.ToLower(), ct);

        if (exists)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Signature)] = ["Tenant signature or domain already exists."]
            });
        }

        var now = DateTimeOffset.UtcNow;
        var tenant = new TenantRecord
        {
            Name = request.Name.Trim(),
            Signature = signature,
            Domain = domain,
            CdnBaseUrl = NormalizeUrl(request.CdnBaseUrl) ?? $"https://cdn.{domain}",
            LogoKey = NormalizeOptional(request.LogoKey),
            AdminDashboardUrl = NormalizeUrl(request.AdminDashboardUrl) ?? $"https://{domain}/admin",
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
        if (string.IsNullOrWhiteSpace(request.Domain))
            errors[nameof(request.Domain)] = ["Tenant domain is required."];
        if (!Enum.IsDefined(request.CountryCode))
            errors[nameof(request.CountryCode)] = ["Country code is invalid."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static string NormalizeSignature(string value)
        => value.Trim().ToLowerInvariant();

    private static string NormalizeDomain(string value)
        => value.Trim().TrimEnd('/').Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .ToLowerInvariant();

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeUrl(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim().TrimEnd('/');
}
