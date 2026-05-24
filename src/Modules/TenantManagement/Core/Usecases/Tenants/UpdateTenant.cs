using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class UpdateTenant(TenantManagementDbContext db)
{
    public async Task<TenantResponse?> ExecuteAsync(int id, UpdateTenantRequest request, CancellationToken ct)
    {
        Validate(request);

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == id && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var signature = NormalizeSignature(request.Signature);
        var requestedDomain = NormalizeDomain(request.Domain);
        var domain = requestedDomain ?? tenant.Domain;
        var exists = await db.Tenants.AnyAsync(x =>
            x.Id != tenant.Id &&
            !x.IsArchived &&
            (x.Signature == signature ||
             (requestedDomain != null && x.Domain != null && x.Domain.ToLower() == requestedDomain.ToLower())), ct);

        if (exists)
        {
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Signature)] = ["Tenant signature or domain already exists."]
            });
        }

        tenant.Name = request.Name.Trim();
        tenant.Signature = signature;
        tenant.Domain = domain;
        tenant.CdnBaseUrl = NormalizeUrl(request.CdnBaseUrl) ?? tenant.CdnBaseUrl;
        tenant.LogoKey = NormalizeOptional(request.LogoKey);
        tenant.CountryCode = request.CountryCode;
        tenant.LastModified = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return TenantMapper.ToResponse(tenant);
    }

    private static void Validate(UpdateTenantRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
            errors[nameof(request.Name)] = ["Tenant name is required."];
        if (string.IsNullOrWhiteSpace(request.Signature))
            errors[nameof(request.Signature)] = ["Tenant signature is required."];
        if (!Enum.IsDefined(request.CountryCode))
            errors[nameof(request.CountryCode)] = ["Country code is invalid."];

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

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeUrl(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim().TrimEnd('/');
}
