using System.ComponentModel.DataAnnotations;
using Shipping.Core.Services;

namespace Shipping.Core.Entities;

public class VariantShipping : AuditableEntity
{
    [Key]
    public string VariantId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public float Weight { get; private set; }
    public float Width { get; private set; }
    public float Height { get; private set; }
    public float Length { get; private set; }
    public bool Physical { get; private set; } = true;
    public bool UseProductShipping { get; private set; } = true;
    public PackageLevel PackageLevel { get; private set; } = PackageLevel.Standard;

    public void ApplyProductShipping(ProductShipping p)
    {
        UseProductShipping = true;
        Weight = p.Weight;
        Width = p.Width;
        Height = p.Height;
        Length = p.Length;
        Physical = p.Physical;
        PackageLevel = p.PackageLevel;
    }

    public void ApplyVariantShipping(
        bool physical,
        float weight,
        float width,
        float height,
        float length)
    {
        UseProductShipping = false;
        Physical = physical;

        if (!physical)
        {
            Weight = 0;
            Width = 0;
            Height = 0;
            Length = 0;
            PackageLevel = PackageLevel.Standard;
            return;
        }

        Weight = weight;
        Width = width;
        Height = height;
        Length = length;
        PackageLevel = ProductShipping.ResolvePackageLevel(weight, width, height, length);
    }
}
