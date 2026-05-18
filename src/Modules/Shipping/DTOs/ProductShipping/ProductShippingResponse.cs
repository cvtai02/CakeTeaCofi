using Shipping.Core.Services;

namespace Shipping.DTOs.ProductShipping;

public class ProductShippingResponse
{
    public string ProductId { get; set; } = string.Empty;
    public bool PhysicalProduct { get; set; }
    public float Weight { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public float Length { get; set; }
    public PackageLevel PackageLevel { get; set; }
    public List<VariantShippingResponse> Variants { get; set; } = [];
}

public class VariantShippingResponse
{
    public string VariantId { get; set; } = string.Empty;
    public bool UseProductShipping { get; set; }
    public bool PhysicalProduct { get; set; }
    public float Weight { get; set; }
    public float Width { get; set; }
    public float Height { get; set; }
    public float Length { get; set; }
    public PackageLevel PackageLevel { get; set; }
}
