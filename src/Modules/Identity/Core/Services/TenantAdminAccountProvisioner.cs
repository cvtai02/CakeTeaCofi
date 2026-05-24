using Identity.Core.Entities;
using Intermediary.Tenants;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using SharedKernel.Authorization;

namespace Identity.Core.Services;

public class TenantAdminAccountProvisioner(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole> roleManager) : ITenantAdminAccountProvisioner
{
    public async Task<TenantAdminAccountProvisioningResult> CreateAsync(
        string email,
        string password,
        string displayName,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim();
        var user = new AppUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            EmailConfirmed = true,
            DisplayName = displayName.Trim()
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
            return TenantAdminAccountProvisioningResult.Failed(createResult.Errors.Select(x => x.Description));

        var roleResult = await EnsureTenantAdminRoleAsync();
        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return TenantAdminAccountProvisioningResult.Failed(roleResult.Errors.Select(x => x.Description));
        }

        var assignRoleResult = await userManager.AddToRoleAsync(user, Roles.TenantAdmin);
        if (!assignRoleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return TenantAdminAccountProvisioningResult.Failed(assignRoleResult.Errors.Select(x => x.Description));
        }

        return TenantAdminAccountProvisioningResult.Success(user.Id);
    }

    public async Task<TenantAdminAccountInfo?> GetAsync(
        string identityUserId,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(identityUserId);
        return user is null ? null : ToInfo(user);
    }

    public async Task<IReadOnlyList<TenantAdminAccountInfo>> ListAsync(
        IEnumerable<string> identityUserIds,
        CancellationToken cancellationToken)
    {
        var ids = identityUserIds
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (ids.Count == 0)
            return [];

        var users = await userManager.Users
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);

        return users.Select(ToInfo).ToList();
    }

    public async Task<TenantAdminAccountOperationResult> ResetPasswordAsync(
        string identityUserId,
        string newPassword,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(identityUserId);
        if (user is null)
            return TenantAdminAccountOperationResult.Failed(["Tenant admin user was not found."]);

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, token, newPassword);
        return ToOperationResult(result);
    }

    public async Task<TenantAdminAccountOperationResult> ChangeEmailAsync(
        string identityUserId,
        string email,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(identityUserId);
        if (user is null)
            return TenantAdminAccountOperationResult.Failed(["Tenant admin user was not found."]);

        var normalizedEmail = email.Trim();
        var emailResult = await userManager.SetEmailAsync(user, normalizedEmail);
        if (!emailResult.Succeeded)
            return ToOperationResult(emailResult);

        var userNameResult = await userManager.SetUserNameAsync(user, normalizedEmail);
        if (!userNameResult.Succeeded)
            return ToOperationResult(userNameResult);

        user.EmailConfirmed = true;
        var updateResult = await userManager.UpdateAsync(user);
        return ToOperationResult(updateResult);
    }

    public async Task<TenantAdminAccountOperationResult> SetEnabledAsync(
        string identityUserId,
        bool enabled,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(identityUserId);
        if (user is null)
            return TenantAdminAccountOperationResult.Failed(["Tenant admin user was not found."]);

        user.LockoutEnabled = true;
        user.LockoutEnd = enabled ? null : DateTimeOffset.MaxValue;
        var result = await userManager.UpdateAsync(user);
        return ToOperationResult(result);
    }

    public async Task<TenantAdminAccountOperationResult> UpdateDisplayNameAsync(
        string identityUserId,
        string displayName,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(identityUserId);
        if (user is null)
            return TenantAdminAccountOperationResult.Failed(["Tenant admin user was not found."]);

        user.DisplayName = displayName.Trim();
        var result = await userManager.UpdateAsync(user);
        return ToOperationResult(result);
    }

    private async Task<IdentityResult> EnsureTenantAdminRoleAsync()
    {
        if (await roleManager.RoleExistsAsync(Roles.TenantAdmin))
            return IdentityResult.Success;

        return await roleManager.CreateAsync(new IdentityRole(Roles.TenantAdmin));
    }

    private static TenantAdminAccountInfo ToInfo(AppUser user)
    {
        var now = DateTimeOffset.UtcNow;
        var enabled = user.LockoutEnd is null || user.LockoutEnd <= now;

        return new TenantAdminAccountInfo(
            user.Id,
            user.Email,
            user.UserName,
            user.DisplayName,
            user.EmailConfirmed,
            enabled,
            user.LockoutEnd);
    }

    private static TenantAdminAccountOperationResult ToOperationResult(IdentityResult result)
        => result.Succeeded
            ? TenantAdminAccountOperationResult.Success()
            : TenantAdminAccountOperationResult.Failed(result.Errors.Select(x => x.Description));
}
