using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using Shipping.Core.Entities;
using Shipping.DTOs.ProductShipping;

namespace Shipping.Core.Usecases.ProductShippings;

[UsecaseInject]
public class UpsertProductShipping(ShippingDbContext db)
{
    public async Task<ProductShippingResponse> ExecuteAsync(
        string productId,
        UpsertProductShippingRequest request,
        CancellationToken ct)
    {
        productId = string.IsNullOrWhiteSpace(productId) ? string.Empty : productId.Trim();
        Validate(productId, request);

        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var productShipping = await db.ProductShippings
            .FirstOrDefaultAsync(x => x.ProductId == productId, ct);

        if (productShipping is null)
        {
            productShipping = new ProductShipping { ProductId = productId };
            db.ProductShippings.Add(productShipping);
        }

        productShipping.ApplyShipping(
            request.PhysicalProduct,
            request.Weight,
            request.Width,
            request.Height,
            request.Length);

        foreach (var variantRequest in request.Variants)
        {
            var variantId = variantRequest.VariantId.Trim();
            var variantShipping = await db.VariantShippings
                .FirstOrDefaultAsync(x => x.VariantId == variantId, ct);

            if (variantShipping is null)
            {
                variantShipping = new VariantShipping { ProductId = productId, VariantId = variantId };
                db.VariantShippings.Add(variantShipping);
            }
            else
            {
                variantShipping.ProductId = productId;
            }

            if (variantRequest.UseProductShipping)
            {
                variantShipping.ApplyProductShipping(productShipping);
                continue;
            }

            variantShipping.ApplyVariantShipping(
                variantRequest.PhysicalProduct ?? productShipping.Physical,
                variantRequest.Weight ?? variantShipping.Weight,
                variantRequest.Width ?? variantShipping.Width,
                variantRequest.Height ?? variantShipping.Height,
                variantRequest.Length ?? variantShipping.Length);
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return (await new GetProductShipping(db).ExecuteAsync(productId, ct))!;
    }

    private static void Validate(string productId, UpsertProductShippingRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(productId))
            errors["productId"] = ["Product id is required."];

        var invalidVariantIds = request.Variants
            .Where(x => string.IsNullOrWhiteSpace(x.VariantId))
            .ToList();

        var duplicateVariantIds = request.Variants
            .Where(x => !string.IsNullOrWhiteSpace(x.VariantId))
            .GroupBy(x => x.VariantId.Trim(), StringComparer.OrdinalIgnoreCase)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();

        if (invalidVariantIds.Count > 0 || duplicateVariantIds.Count > 0)
        {
            var messages = new List<string>();
            if (invalidVariantIds.Count > 0)
                messages.Add("Variant ids are required.");
            if (duplicateVariantIds.Count > 0)
                messages.Add("Variant shipping configs must be unique by variant id.");
            errors[nameof(request.Variants)] = messages.ToArray();
        }

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }
}
