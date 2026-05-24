using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class ChangeTenantAdminEmailRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;
}
