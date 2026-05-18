using System.ComponentModel.DataAnnotations;

namespace ProductCatalog.DTOs.Products;

public class CreateVariantRequest
{
    public string? Id { get; set; }
    public bool UseProductPricing { get; set; } = true;
    public decimal? Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public bool? ChargeTax { get; set; }
    public string? ImageKey { get; set; }
    public bool UseProductInventory { get; set; } = true;
    public int Quantity { get; set; }
    public bool? TrackInventory { get; set; }
    public bool? AllowBackorder { get; set; }
    public bool UseProductShipping { get; set; } = true;
    public bool? PhysicalProduct { get; set; }

    [Range(0, double.MaxValue)]
    public float? Weight { get; set; }

    [Range(0, double.MaxValue)]
    public float? Width { get; set; }

    [Range(0, double.MaxValue)]
    public float? Height { get; set; }

    [Range(0, double.MaxValue)]
    public float? Length { get; set; }
    public List<VariantOptionValueDto> OptionValues { get; set; } = [];
}

public class VariantOptionValueDto
{
    public int? OptionId { get; set; }
    public string OptionName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
