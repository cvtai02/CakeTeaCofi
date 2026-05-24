using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Core.Usecases.Tenants;

[UsecaseInject]
public class UpdateTenantAdminAccount(TenantManagementDbContext db, ITenantAdminAccountProvisioner accountProvisioner)
{
    public async Task<TenantAdminUserResponse?> ExecuteAsync(
        int tenantId,
        UpdateTenantAdminAccountRequest request,
        CancellationToken ct)
    {
        Validate(request);

        var tenant = await db.Tenants.FirstOrDefaultAsync(x => x.Id == tenantId && !x.IsArchived, ct);
        if (tenant is null)
            return null;

        var identityUserId = RequireAdminIdentityUserId(tenant.AdminIdentityUserId);

        if (request.Email is not null)
        {
            var email = request.Email.Trim();
            var result = await accountProvisioner.ChangeEmailAsync(identityUserId, email, ct);
            if (!result.Succeeded)
                Throw(nameof(request.Email), result.Errors.FirstOrDefault() ?? "Email could not be changed.");

            tenant.AdminEmail = email;
            tenant.LastModified = DateTimeOffset.UtcNow;
        }

        if (request.Password is not null)
        {
            var result = await accountProvisioner.ResetPasswordAsync(identityUserId, request.Password, ct);
            if (!result.Succeeded)
                Throw(nameof(request.Password), result.Errors.FirstOrDefault() ?? "Password could not be reset.");
        }

        if (request.Enabled.HasValue)
        {
            var result = await accountProvisioner.SetEnabledAsync(identityUserId, request.Enabled.Value, ct);
            if (!result.Succeeded)
                Throw(nameof(request.Enabled), result.Errors.FirstOrDefault() ?? "Tenant admin account state could not be changed.");
        }

        if (request.DisplayName is not null)
        {
            var result = await accountProvisioner.UpdateDisplayNameAsync(identityUserId, request.DisplayName, ct);
            if (!result.Succeeded)
                Throw(nameof(request.DisplayName), result.Errors.FirstOrDefault() ?? "Display name could not be changed.");
        }

        if (db.ChangeTracker.HasChanges())
            await db.SaveChangesAsync(ct);

        var user = await accountProvisioner.GetAsync(identityUserId, ct);
        return user is null ? null : ListTenantAdminUsers.ToResponse(tenant.Id, tenant.Signature, user);
    }

    private static void Validate(UpdateTenantAdminAccountRequest request)
    {
        var hasChange =
            request.Email is not null ||
            request.Password is not null ||
            request.Enabled.HasValue ||
            request.DisplayName is not null;

        if (!hasChange)
            Throw("account", "At least one account field is required.");

        if (request.Email is not null && string.IsNullOrWhiteSpace(request.Email))
            Throw(nameof(request.Email), "Email cannot be empty.");

        if (request.Password is not null && string.IsNullOrWhiteSpace(request.Password))
            Throw(nameof(request.Password), "Password cannot be empty.");

        if (request.DisplayName is not null && string.IsNullOrWhiteSpace(request.DisplayName))
            Throw(nameof(request.DisplayName), "Display name cannot be empty.");
    }

    private static string RequireAdminIdentityUserId(string? identityUserId)
    {
        if (!string.IsNullOrWhiteSpace(identityUserId))
            return identityUserId;

        Throw("adminAccount", "Tenant admin account does not exist.");
        return string.Empty;
    }

    private static void Throw(string field, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]>
        {
            [field] = [message]
        });
}
