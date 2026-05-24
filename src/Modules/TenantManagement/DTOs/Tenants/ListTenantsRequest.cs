using System.ComponentModel.DataAnnotations;

namespace TenantManagement.DTOs.Tenants;

public class ListTenantsRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 200)]
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }

    public bool? IsActive { get; set; }

    public bool IncludeArchived { get; set; }
}
