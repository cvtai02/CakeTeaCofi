using SharedKernel.Abstractions.Contracts;

namespace Intermediary.Events.ProductCatalog;

public class ProductDeleted : IntegrationEvent
{
    public string ProductId { get; set; } = string.Empty;
    public ProductInventoryDeleteInfo Inventory { get; set; } = new();
    public ProductShippingDeleteInfo Shipping { get; set; } = new();
}
