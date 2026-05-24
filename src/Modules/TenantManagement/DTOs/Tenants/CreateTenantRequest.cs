using System.ComponentModel.DataAnnotations;
using SharedKernel.EnumsConstants;

namespace TenantManagement.DTOs.Tenants;

public class CreateTenantRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Signature { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Domain { get; set; }

    public CountryCode CountryCode { get; set; } = CountryCode.VN;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
