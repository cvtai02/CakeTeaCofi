using Intermediary.Events.ProductCatalog;
using Inventory.Core.Usecases.Inventory;
using Inventory.DTOs.Inventory;

namespace Inventory.Core.EventHandlers;

public class ProductCreatedHandler(InitializeProductInventory initializeProductInventory)
    : IIntegrationEventHandler<ProductCreated>
{
    public async Task Handle(ProductCreated @event, CancellationToken ct = default)
        => await initializeProductInventory.ExecuteAsync(
            @event.ProductId,
            ProductInventoryEventMapper.ToRequest(@event.Inventory),
            ct);
}

public class ProductUpdatedHandler(InitializeProductInventory initializeProductInventory)
    : IIntegrationEventHandler<ProductUpdated>
{
    public async Task Handle(ProductUpdated @event, CancellationToken ct = default)
        => await initializeProductInventory.ExecuteAsync(
            @event.ProductId,
            ProductInventoryEventMapper.ToRequest(@event.Inventory),
            ct);
}

public class ProductDeletedHandler(DeleteProductInventory deleteProductInventory)
    : IIntegrationEventHandler<ProductDeleted>
{
    public async Task Handle(ProductDeleted @event, CancellationToken ct = default)
        => await deleteProductInventory.ExecuteAsync(
            string.IsNullOrWhiteSpace(@event.Inventory.ProductId) ? @event.ProductId : @event.Inventory.ProductId,
            ct);
}

internal static class ProductInventoryEventMapper
{
    internal static InitializeProductInventoryRequest ToRequest(ProductInventorySyncInfo inventory)
        => new()
        {
            TrackInventory = inventory.TrackInventory,
            AllowBackorder = inventory.AllowBackorder,
            LowStockThreshold = inventory.LowStockThreshold,
            Variants = inventory.Variants
                .Select(x => new VariantInventoryConfig
                {
                    VariantId = x.VariantId,
                    UseProductInventory = x.UseProductInventory,
                    TrackInventory = x.TrackInventory,
                    AllowBackorder = x.AllowBackorder,
                    LowStockThreshold = x.LowStockThreshold,
                    Quantity = x.Quantity
                })
                .ToList()
        };
}
