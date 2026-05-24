namespace TenantManagement.DTOs.Tenants;

public class TenantAdminUserResponse
{
    public int TenantId { get; set; }
    public string TenantSignature { get; set; } = string.Empty;
    public string IdentityUserId { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public string? DisplayName { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool Enabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
}
