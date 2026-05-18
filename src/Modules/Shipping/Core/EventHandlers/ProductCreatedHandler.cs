using Intermediary.Events.ProductCatalog;
using Shipping.Core.Usecases.ProductShippings;
using Shipping.DTOs.ProductShipping;

namespace Shipping.Core.EventHandlers;

public class ProductCreatedHandler(UpsertProductShipping upsertProductShipping)
    : IIntegrationEventHandler<ProductCreated>
{
    public async Task Handle(ProductCreated @event, CancellationToken ct = default)
        => await upsertProductShipping.ExecuteAsync(
            @event.ProductId,
            ProductShippingEventMapper.ToRequest(@event.Shipping),
            ct);
}

public class ProductUpdatedHandler(UpsertProductShipping upsertProductShipping)
    : IIntegrationEventHandler<ProductUpdated>
{
    public async Task Handle(ProductUpdated @event, CancellationToken ct = default)
        => await upsertProductShipping.ExecuteAsync(
            @event.ProductId,
            ProductShippingEventMapper.ToRequest(@event.Shipping),
            ct);
}

public class ProductDeletedHandler(DeleteProductShipping deleteProductShipping)
    : IIntegrationEventHandler<ProductDeleted>
{
    public async Task Handle(ProductDeleted @event, CancellationToken ct = default)
        => await deleteProductShipping.ExecuteAsync(
            string.IsNullOrWhiteSpace(@event.Shipping.ProductId) ? @event.ProductId : @event.Shipping.ProductId,
            ct);
}

internal static class ProductShippingEventMapper
{
    internal static UpsertProductShippingRequest ToRequest(ProductShippingSyncInfo shipping)
        => new()
        {
            PhysicalProduct = shipping.PhysicalProduct,
            Weight = shipping.Weight,
            Width = shipping.Width,
            Height = shipping.Height,
            Length = shipping.Length,
            Variants = shipping.Variants
                .Select(x => new VariantShippingRequest
                {
                    VariantId = x.VariantId,
                    UseProductShipping = x.UseProductShipping,
                    PhysicalProduct = x.PhysicalProduct,
                    Weight = x.Weight,
                    Width = x.Width,
                    Height = x.Height,
                    Length = x.Length
                })
                .ToList()
        };
}
