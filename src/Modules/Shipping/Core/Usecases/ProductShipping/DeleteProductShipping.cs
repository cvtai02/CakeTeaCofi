using Microsoft.EntityFrameworkCore;

namespace Shipping.Core.Usecases.ProductShippings;

[UsecaseInject]
public class DeleteProductShipping(ShippingDbContext db)
{
    public async Task ExecuteAsync(string productId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return;

        productId = productId.Trim();

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        await db.VariantShippings
            .Where(x => x.ProductId == productId)
            .ExecuteDeleteAsync(ct);

        await db.ProductShippings
            .Where(x => x.ProductId == productId)
            .ExecuteDeleteAsync(ct);

        await transaction.CommitAsync(ct);
    }
}
