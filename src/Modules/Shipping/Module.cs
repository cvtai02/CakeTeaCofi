using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shipping.Core.Services;
using Shipping.Infrastructure;

namespace Shipping;

public class ShippingModule(IHostApplicationBuilder b) : Module(b)
{
    public override string Key => ModuleConstants.Key;

    protected override void RegisterDbContext()
    {
        CommonRegisterDbContext<ShippingDbContext>();
    }

    protected override void RegisterUsecases()
    {
        Services.AddScoped<IShippingPriceCalculator, HardcodeShippingPriceService>();
    }

    public override void Run(WebApplication app)
    {
    }
}

public static class ModuleConstants
{
    public const string Key = "Shipping";
}
