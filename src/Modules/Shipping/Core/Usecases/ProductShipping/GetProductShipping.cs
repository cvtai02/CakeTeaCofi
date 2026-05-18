using Microsoft.EntityFrameworkCore;
using Shipping.DTOs.ProductShipping;

namespace Shipping.Core.Usecases.ProductShippings;

[UsecaseInject]
public class GetProductShipping(ShippingDbContext db)
{
    public async Task<ProductShippingResponse?> ExecuteAsync(string productId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return null;

        productId = productId.Trim();

        var productShipping = await db.ProductShippings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductId == productId, ct);

        if (productShipping is null)
            return null;

        var variants = await db.VariantShippings
            .AsNoTracking()
            .Where(x => x.ProductId == productId)
            .OrderBy(x => x.VariantId)
            .Select(x => new VariantShippingResponse
            {
                VariantId = x.VariantId,
                UseProductShipping = x.UseProductShipping,
                PhysicalProduct = x.Physical,
                Weight = x.Weight,
                Width = x.Width,
                Height = x.Height,
                Length = x.Length,
                PackageLevel = x.PackageLevel
            })
            .ToListAsync(ct);

        return new ProductShippingResponse
        {
            ProductId = productShipping.ProductId,
            PhysicalProduct = productShipping.Physical,
            Weight = productShipping.Weight,
            Width = productShipping.Width,
            Height = productShipping.Height,
            Length = productShipping.Length,
            PackageLevel = productShipping.PackageLevel,
            Variants = variants
        };
    }
}
