using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class UpdateTenantAdminAccountRequest
{
    [EmailAddress]
    [MaxLength(256)]
    public string? Email { get; set; }

    public string? Password { get; set; }

    public bool? Enabled { get; set; }

    [MaxLength(200)]
    public string? DisplayName { get; set; }
}
