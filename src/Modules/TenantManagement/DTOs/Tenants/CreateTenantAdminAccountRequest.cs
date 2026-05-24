using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class CreateTenantAdminAccountRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
