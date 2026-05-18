using System.ComponentModel.DataAnnotations;

namespace Shipping.DTOs.ProductShipping;

public class UpsertProductShippingRequest
{
    public bool PhysicalProduct { get; set; } = true;

    [Range(0, double.MaxValue)]
    public float Weight { get; set; }

    [Range(0, double.MaxValue)]
    public float Width { get; set; }

    [Range(0, double.MaxValue)]
    public float Height { get; set; }

    [Range(0, double.MaxValue)]
    public float Length { get; set; }

    public List<VariantShippingRequest> Variants { get; set; } = [];
}

public class VariantShippingRequest
{
    [Required]
    public string VariantId { get; set; } = string.Empty;

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
}
