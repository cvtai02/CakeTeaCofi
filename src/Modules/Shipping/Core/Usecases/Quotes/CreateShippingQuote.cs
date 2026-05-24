using Microsoft.EntityFrameworkCore;
using SharedKernel.Exceptions;
using Shipping.Core.Services;
using Shipping.DTOs.Quotes;

namespace Shipping.Core.Usecases.Quotes;

[UsecaseInject]
public class CreateShippingQuote(ShippingDbContext db, IShippingPriceCalculator calculator)
{
    public async Task<ShippingQuoteResponse> ExecuteAsync(CreateShippingQuoteRequest request, CancellationToken ct)
    {
        request ??= new CreateShippingQuoteRequest();
        request.Items ??= [];
        Validate(request);

        var requestedItems = request.Items
            .GroupBy(x => x.VariantId.Trim())
            .Select(x => new { VariantId = x.Key, Quantity = x.Sum(item => item.Quantity) })
            .ToList();
        var variantIds = requestedItems.Select(x => x.VariantId).ToList();
        var variants = await db.VariantShippings
            .AsNoTracking()
            .Where(x => variantIds.Contains(x.VariantId))
            .Select(x => new { x.VariantId, x.Physical, x.PackageLevel })
            .ToListAsync(ct);

        var missingVariantIds = variantIds.Except(variants.Select(x => x.VariantId)).ToList();
        if (missingVariantIds.Count > 0)
            Throw(nameof(request.Items), $"Shipping data does not exist for variants: {string.Join(", ", missingVariantIds)}.");

        var from = ToAddress(request.AddressFrom);
        var to = ToAddress(request.AddressTo);
        var lines = new List<ShippingQuoteLineResponse>();
        foreach (var item in requestedItems)
        {
            var variant = variants.Single(x => x.VariantId == item.VariantId);
            if (!variant.Physical)
                continue;

            var unitPrice = await calculator.CalculateAsync(variant.PackageLevel, from, to, ct);
            lines.Add(new ShippingQuoteLineResponse
            {
                VariantId = item.VariantId,
                PackageLevel = variant.PackageLevel,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                Subtotal = unitPrice * item.Quantity
            });
        }

        return new ShippingQuoteResponse
        {
            Lines = lines,
            TotalPrice = lines.Sum(x => x.Subtotal)
        };
    }

    private static ShippingAddress ToAddress(ShippingQuoteAddressRequest address) => new()
    {
        Country = address.Country.Trim(),
        Province = address.AdministrativeArea.Trim(),
        District = address.Locality.Trim(),
        Ward = address.SubLocality.Trim(),
        Line1 = address.Line1.Trim(),
        PostalCode = address.PostalCode.Trim()
    };

    private static void Validate(CreateShippingQuoteRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (request.Items.Count == 0)
            errors[nameof(request.Items)] = ["At least one shipping item is required."];
        if (request.Items.Any(x => string.IsNullOrWhiteSpace(x.VariantId) || x.Quantity <= 0))
            errors[nameof(request.Items)] = ["Variant id is required and quantity must be greater than zero."];
        if (string.IsNullOrWhiteSpace(request.AddressFrom.AdministrativeArea))
            errors[$"{nameof(request.AddressFrom)}.{nameof(ShippingQuoteAddressRequest.AdministrativeArea)}"] = ["Origin administrative area is required."];
        if (string.IsNullOrWhiteSpace(request.AddressTo.AdministrativeArea))
            errors[$"{nameof(request.AddressTo)}.{nameof(ShippingQuoteAddressRequest.AdministrativeArea)}"] = ["Destination administrative area is required."];

        if (errors.Count > 0)
            throw new ValidationException("Validation failed", errors);
    }

    private static void Throw(string field, string message)
        => throw new ValidationException("Validation failed", new Dictionary<string, string[]> { [field] = [message] });
}
