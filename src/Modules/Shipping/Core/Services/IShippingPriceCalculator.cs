namespace Shipping.Core.Services;

public interface IShippingPriceCalculator
{
    Task<decimal> CalculateAsync(
        PackageLevel packageLevel,
        ShippingAddress addressFrom,
        ShippingAddress addressTo,
        CancellationToken ct);
}
