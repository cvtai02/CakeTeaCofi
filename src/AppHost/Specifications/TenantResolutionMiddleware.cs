using Microsoft.EntityFrameworkCore;
using TenantManagement;

namespace AppHost.Specifications;

public class TenantResolutionMiddleware(RequestDelegate next)
{
    private const string TenantSignatureHeader = "X-Tenant-Signature";
    private const string AdminHost = "admin.nekomin.com";

    public async Task InvokeAsync(
        HttpContext context,
        Tenant tenant,
        TenantManagementDbContext db,
        IHostEnvironment environment)
    {
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await next(context);
            return;
        }

        var host = NormalizeHost(context.Request.Host.Host);
        var requestedSignature = ResolveRequestedSignature(context);
        var tenantRecord = string.IsNullOrWhiteSpace(requestedSignature)
            ? await ResolveByHostAsync(db, host, context.RequestAborted)
            : await ResolveBySignatureAsync(db, requestedSignature, context.RequestAborted);

        if (tenantRecord is null && IsAdminHost(host) && string.IsNullOrWhiteSpace(requestedSignature))
            tenantRecord = await ResolveDefaultAsync(db, context.RequestAborted);

        if (tenantRecord is null && environment.IsDevelopment() && IsLocalHost(host))
        {
            tenantRecord = string.IsNullOrWhiteSpace(requestedSignature)
                ? await ResolveDefaultAsync(db, context.RequestAborted)
                : await ResolveBySignatureAsync(db, requestedSignature, context.RequestAborted);
        }

        if (tenantRecord is null && !string.IsNullOrWhiteSpace(requestedSignature))
        {
            await Results.Problem(
                title: "Tenant not found.",
                detail: $"No active tenant is configured for signature '{requestedSignature}'.",
                statusCode: StatusCodes.Status404NotFound)
                .ExecuteAsync(context);
            return;
        }

        if (tenantRecord is null)
        {
            await Results.Problem(
                title: "Tenant not found.",
                detail: $"No active tenant is configured for host '{host}'.",
                statusCode: StatusCodes.Status404NotFound)
                .ExecuteAsync(context);
            return;
        }

        tenant.Set(
            tenantRecord.Id,
            tenantRecord.Name,
            tenantRecord.Signature,
            tenantRecord.Domain,
            tenantRecord.CdnBaseUrl,
            tenantRecord.CountryCode);

        await next(context);
    }

    private static string NormalizeHost(string host)
        => host.Trim().TrimEnd('.').ToLowerInvariant();

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToLowerInvariant();

    private static string? ResolveRequestedSignature(HttpContext context)
        => NormalizeOptional(context.Request.Headers[TenantSignatureHeader].FirstOrDefault())
            ?? NormalizeOptional(context.Request.Query["tenantSignature"].FirstOrDefault());

    private static bool IsLocalHost(string host)
        => host is "localhost" or "127.0.0.1" or "::1";

    private static bool IsAdminHost(string host)
        => host == AdminHost;

    private static Task<TenantRecordProjection?> ResolveByHostAsync(
        TenantManagementDbContext db,
        string host,
        CancellationToken ct)
        => ProjectActiveTenants(db)
            .FirstOrDefaultAsync(x => x.Domain == host, ct);

    private static Task<TenantRecordProjection?> ResolveBySignatureAsync(
        TenantManagementDbContext db,
        string signature,
        CancellationToken ct)
        => ProjectActiveTenants(db)
            .FirstOrDefaultAsync(x => x.Signature == signature, ct);

    private static Task<TenantRecordProjection?> ResolveDefaultAsync(
        TenantManagementDbContext db,
        CancellationToken ct)
        => ProjectActiveTenants(db)
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync(ct);

    private static IQueryable<TenantRecordProjection> ProjectActiveTenants(TenantManagementDbContext db)
        => db.Tenants
            .AsNoTracking()
            .Where(x => x.IsActive && !x.IsArchived)
            .Select(x => new TenantRecordProjection
            {
                Id = x.Id,
                Name = x.Name,
                Signature = x.Signature,
                Domain = x.Domain ?? string.Empty,
                CdnBaseUrl = x.CdnBaseUrl,
                CountryCode = x.CountryCode
            });

    private sealed class TenantRecordProjection
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Signature { get; init; } = string.Empty;
        public string Domain { get; init; } = string.Empty;
        public string CdnBaseUrl { get; init; } = string.Empty;
        public SharedKernel.EnumsConstants.CountryCode CountryCode { get; init; }
    }
}
