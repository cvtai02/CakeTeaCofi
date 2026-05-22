using Microsoft.Extensions.Hosting;

namespace TenantManagement;

public class TenantManagementModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<TenantManagementDbContext>();
    }
}

public static class ModuleConstants
{
    public const string Key = "TenantManagement";
}
