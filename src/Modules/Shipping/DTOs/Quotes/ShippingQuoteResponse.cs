using Shipping.Core.Services;

namespace Shipping.DTOs.Quotes;

public class ShippingQuoteResponse
{
    public decimal TotalPrice { get; set; }
    public List<ShippingQuoteLineResponse> Lines { get; set; } = [];
}

public class ShippingQuoteLineResponse
{
    public string VariantId { get; set; } = string.Empty;
    public PackageLevel PackageLevel { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
