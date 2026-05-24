using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class ResetTenantAdminPasswordRequest
{
    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
