using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class UpdateTenantLogoRequest
{
    [Required]
    [MaxLength(1000)]
    public string LogoKey { get; set; } = string.Empty;
}
