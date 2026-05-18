using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.ProductCatalog;

public class ProductUpdated : IntegrationEvent
{
    public string ProductId { get; set; } = string.Empty;
    public ProductInventorySyncInfo Inventory { get; set; } = new();
    public ProductShippingSyncInfo Shipping { get; set; } = new();
}
