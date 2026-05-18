namespace Intermediary.Events.ProductCatalog;

public class ProductInventorySyncInfo
{
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public List<VariantInventorySyncInfo> Variants { get; set; } = [];
}

public class VariantInventorySyncInfo
{
    public string VariantId { get; set; } = string.Empty;
    public bool UseProductInventory { get; set; } = true;
    public bool TrackInventory { get; set; } = true;
    public bool AllowBackorder { get; set; }
    public int LowStockThreshold { get; set; }
    public int Quantity { get; set; }
}

public class ProductShippingSyncInfo
{
    public bool PhysicalProduct { get; set; } = true;
    public float Weight { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public float Length { get; set; }
    public List<VariantShippingSyncInfo> Variants { get; set; } = [];
}

public class VariantShippingSyncInfo
{
    public string VariantId { get; set; } = string.Empty;
    public bool UseProductShipping { get; set; } = true;
    public bool? PhysicalProduct { get; set; }
    public float? Weight { get; set; }
    public float? Width { get; set; }
    public float? Height { get; set; }
    public float? Length { get; set; }
}

public class ProductInventoryDeleteInfo
{
    public string ProductId { get; set; } = string.Empty;
    public List<string> VariantIds { get; set; } = [];
}

public class ProductShippingDeleteInfo
{
    public string ProductId { get; set; } = string.Empty;
    public List<string> VariantIds { get; set; } = [];
}
