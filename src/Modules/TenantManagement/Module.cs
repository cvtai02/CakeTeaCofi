using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TenantManagement.Core.Abstractions;
using TenantManagement.Infrastructure.R2Buckets;

namespace TenantManagement;

public class TenantManagementModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<TenantManagementDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<IR2BucketService, R2BucketService>();
        Services.AddScoped<IBucketProvisioner, R2BucketService>();
        Services.AddScoped<ITenantStorageStatusProvider, R2BucketService>();
    }
}

public static class ModuleConstants
{
    public const string Key = "TenantManagement";
}
