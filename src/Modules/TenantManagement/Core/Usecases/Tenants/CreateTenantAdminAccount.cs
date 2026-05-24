using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class CreateTenantAdminAccount(
    TenantManagementDbContext db,
    ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantResponse?> ExecuteAsync(
        int tenantId,
        CreateTenantAdminAccountRequest request,
        CancellationToken ct)
    {
        Validate(request);

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == tenantId, ct);
        if (tenant is null)
            return null;

        if (!string.IsNullOrWhiteSpace(tenant.AdminIdentityUserId))
            Throw(nameof(tenant.AdminEmail), "Tenant admin account already exists.");

        var email = request.Email.Trim();
        var result = await accountProvisioner.CreateAsync(email, request.Password, tenant.Name, ct);
        if (!result.Succeeded || string.IsNullOrWhiteSpace(result.IdentityUserId))
            Throw(nameof(request.Email), result.Errors.FirstOrDefault() ?? "Tenant admin account could not be created.");

        tenant.AdminEmail = email;
        tenant.AdminIdentityUserId = result.IdentityUserId;
        tenant.LastModified = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return TenantMapper.ToResponse(tenant);
    }

    private static void Validate(CreateTenantAdminAccountRequest request)
    {
        if (request is null)
            Throw("request", "Request body is required.");
        if (string.IsNullOrWhiteSpace(request.Email))
            Throw(nameof(request.Email), "Tenant admin email is required.");
        if (string.IsNullOrWhiteSpace(request.Password))
            Throw(nameof(request.Password), "Tenant admin password is required.");
    }

    [DoesNotReturn]
    private static void Throw(string field, string message)
    {
        throw new ValidationException("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });
    }
}
