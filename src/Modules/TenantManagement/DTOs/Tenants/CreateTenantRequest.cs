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

    [Required]
    [MaxLength(255)]
    public string Domain { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? CdnBaseUrl { get; set; }

    [MaxLength(1000)]
    public string? LogoKey { get; set; }

    [MaxLength(1000)]
    public string? AdminDashboardUrl { get; set; }

    public CountryCode CountryCode { get; set; } = CountryCode.VN;
}
