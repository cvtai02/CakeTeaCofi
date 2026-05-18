using Intermediary.Events.ProductCatalog;
using ProductCatalog.Core.Entities;
using ProductCatalog.DTOs.Products;

namespace ProductCatalog.Core.Usecases.Products;

internal static class ProductSyncEventFactory
{
    internal static ProductCreated Created(
        Product product,
        CreateProductRequest request,
        IReadOnlyCollection<Variant> variants)
        => new()
        {
            ProductId = product.Id,
            Inventory = BuildInventory(request, variants),
            Shipping = BuildShipping(request, variants)
        };

    internal static ProductUpdated Updated(
        Product product,
        CreateProductRequest request)
        => new()
        {
            ProductId = product.Id,
            Inventory = BuildInventory(request, product.Variants),
            Shipping = BuildShipping(request, product.Variants)
        };

    internal static ProductDeleted Deleted(Product product)
    {
        var variantIds = product.Variants
            .Select(x => x.Id)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new ProductDeleted
        {
            ProductId = product.Id,
            Inventory = new ProductInventoryDeleteInfo
            {
                ProductId = product.Id,
                VariantIds = variantIds
            },
            Shipping = new ProductShippingDeleteInfo
            {
                ProductId = product.Id,
                VariantIds = variantIds
            }
        };
    }

    private static ProductInventorySyncInfo BuildInventory(
        CreateProductRequest request,
        IEnumerable<Variant> variants)
        => new()
        {
            TrackInventory = request.TrackInventory,
            AllowBackorder = request.AllowBackorder,
            LowStockThreshold = request.LowStockThreshold,
            Variants = variants
                .OrderBy(x => x.Id)
                .Select(variant =>
                {
                    var input = FindVariantRequest(request, variant);
                    return new VariantInventorySyncInfo
                    {
                        VariantId = variant.Id,
                        UseProductInventory = input?.UseProductInventory ?? true,
                        TrackInventory = input?.TrackInventory ?? request.TrackInventory,
                        AllowBackorder = input?.AllowBackorder ?? request.AllowBackorder,
                        LowStockThreshold = request.LowStockThreshold,
                        Quantity = input?.Quantity ?? variant.Metric?.Stock ?? request.Stock
                    };
                })
                .ToList()
        };

    private static ProductShippingSyncInfo BuildShipping(
        CreateProductRequest request,
        IEnumerable<Variant> variants)
        => new()
        {
            PhysicalProduct = request.PhysicalProduct,
            Weight = request.Weight,
            Width = request.Width,
            Height = request.Height,
            Length = request.Length,
            Variants = variants
                .OrderBy(x => x.Id)
                .Select(variant =>
                {
                    var input = FindVariantRequest(request, variant);
                    return new VariantShippingSyncInfo
                    {
                        VariantId = variant.Id,
                        UseProductShipping = input?.UseProductShipping ?? true,
                        PhysicalProduct = input?.PhysicalProduct,
                        Weight = input?.Weight,
                        Width = input?.Width,
                        Height = input?.Height,
                        Length = input?.Length
                    };
                })
                .ToList()
        };

    private static CreateVariantRequest? FindVariantRequest(CreateProductRequest request, Variant variant)
    {
        if (request.Variants.Count == 0)
            return null;

        var byId = request.Variants.FirstOrDefault(x =>
            string.Equals(NormalizeId(x.Id), variant.Id, StringComparison.OrdinalIgnoreCase));
        if (byId is not null)
            return byId;

        var variantKey = VariantKey(variant);
        return request.Variants.FirstOrDefault(x =>
            string.Equals(VariantKey(x), variantKey, StringComparison.OrdinalIgnoreCase));
    }

    private static string VariantKey(CreateVariantRequest request)
        => request.OptionValues.Count == 0
            ? "variant"
            : string.Join("|", request.OptionValues
                .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                .Select(x => $"{x.OptionName.Trim()}:{x.Value.Trim()}"));

    private static string VariantKey(Variant variant)
        => variant.OptionValues.Count == 0
            ? "variant"
            : string.Join("|", variant.OptionValues
                .OrderBy(x => x.OptionName, StringComparer.OrdinalIgnoreCase)
                .Select(x => $"{x.OptionName.Trim()}:{x.Value.Trim()}"));

    private static string? NormalizeId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var normalized = value.Trim().ToLowerInvariant();
        normalized = string.Concat(normalized.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-'));
        while (normalized.Contains("--", StringComparison.Ordinal))
            normalized = normalized.Replace("--", "-", StringComparison.Ordinal);
        normalized = normalized.Trim('-');
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
