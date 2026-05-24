namespace TenantManagement.DTOs.Tenants;

public class SystemAdminDashboardSummaryResponse
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int InactiveTenants { get; set; }
    public int ArchivedTenants { get; set; }
    public int TenantsMissingLogo { get; set; }
    public int TenantsMissingDomain { get; set; }
    public int TenantsMissingAdminAccount { get; set; }
    public IReadOnlyList<TenantResponse> RecentTenants { get; set; } = [];
}
