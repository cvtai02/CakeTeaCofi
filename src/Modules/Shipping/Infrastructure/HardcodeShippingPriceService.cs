using Shipping.Core.Services;

namespace Shipping.Infrastructure;

public class HardcodeShippingPriceService : IShippingPriceCalculator
{
    public Task<decimal> CalculateAsync(
        PackageLevel packageLevel,
        ShippingAddress addressFrom,
        ShippingAddress addressTo,
        CancellationToken ct)
    {
        var sameProvince = string.Equals(
            addressFrom.Province?.Trim(),
            addressTo.Province?.Trim(),
            StringComparison.OrdinalIgnoreCase);

        var basePrice = packageLevel switch
        {
            PackageLevel.Lite => 20_000m,
            PackageLevel.Standard => 30_000m,
            PackageLevel.Large => 45_000m,
            PackageLevel.Bulky => 60_000m,
            PackageLevel.Oversize => 90_000m,
            _ => 30_000m
        };

        return Task.FromResult(sameProvince ? basePrice : basePrice + 20_000m);
    }
}
