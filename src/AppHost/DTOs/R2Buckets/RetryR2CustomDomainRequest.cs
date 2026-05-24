using System.ComponentModel.DataAnnotations;

namespace AppHost.DTOs.R2Buckets;

public class RetryR2CustomDomainRequest
{
    [Required]
    public string CustomDomain { get; set; } = string.Empty;
}
