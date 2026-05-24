namespace Intermediary.Tenants;

public interface ITenantAdminAccountProvisioner
{
    Task<TenantAdminAccountProvisioningResult> CreateAsync(
        string email,
        string password,
        string displayName,
        CancellationToken cancellationToken);

    Task<TenantAdminAccountInfo?> GetAsync(
        string identityUserId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<TenantAdminAccountInfo>> ListAsync(
        IEnumerable<string> identityUserIds,
        CancellationToken cancellationToken);

    Task<TenantAdminAccountOperationResult> ResetPasswordAsync(
        string identityUserId,
        string newPassword,
        CancellationToken cancellationToken);

    Task<TenantAdminAccountOperationResult> ChangeEmailAsync(
        string identityUserId,
        string email,
        CancellationToken cancellationToken);

    Task<TenantAdminAccountOperationResult> SetEnabledAsync(
        string identityUserId,
        bool enabled,
        CancellationToken cancellationToken);

    Task<TenantAdminAccountOperationResult> UpdateDisplayNameAsync(
        string identityUserId,
        string displayName,
        CancellationToken cancellationToken);
}

public sealed record TenantAdminAccountInfo(
    string IdentityUserId,
    string? Email,
    string? UserName,
    string? DisplayName,
    bool EmailConfirmed,
    bool Enabled,
    DateTimeOffset? LockoutEnd);

public sealed record TenantAdminAccountOperationResult(bool Succeeded, IReadOnlyList<string> Errors)
{
    public static TenantAdminAccountOperationResult Success()
        => new(true, []);

    public static TenantAdminAccountOperationResult Failed(IEnumerable<string> errors)
        => new(false, errors.ToList());
}

public sealed record TenantAdminAccountProvisioningResult(
    bool Succeeded,
    string? IdentityUserId,
    IReadOnlyList<string> Errors)
{
    public static TenantAdminAccountProvisioningResult Success(string identityUserId)
        => new(true, identityUserId, []);

    public static TenantAdminAccountProvisioningResult Failed(IEnumerable<string> errors)
        => new(false, null, errors.ToList());
}
