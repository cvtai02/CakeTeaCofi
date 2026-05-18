using System.ComponentModel.DataAnnotations;
using Shipping.Core.Services;

namespace Shipping.Core.Entities;

public class ProductShipping : AuditableEntity
{
    [Key]
    public string ProductId { get; set; } = string.Empty;
    public float Weight { get; private set; }
    public float Width { get; private set; }
    public float Height { get; private set; }
    public float Length { get; private set; }
    public bool Physical { get; private set; } = true;
    public PackageLevel PackageLevel { get; private set; } = PackageLevel.Standard;

    public void ApplyShipping(
        bool physical,
        float weight,
        float width,
        float height,
        float length)
    {
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
        PackageLevel = ResolvePackageLevel(weight, width, height, length);
    }

    public static PackageLevel ResolvePackageLevel(float weight, float width, float height, float length)
    {
        var maxDimension = Math.Max(length, Math.Max(width, height));
        var volume = Math.Max(0, width) * Math.Max(0, height) * Math.Max(0, length);
        var volumetricWeight = volume / 6000f;
        var billableWeight = Math.Max(Math.Max(0, weight), volumetricWeight);

        if (billableWeight <= 0.5f && maxDimension <= 20)
            return PackageLevel.Lite;

        if (billableWeight > 20 || maxDimension > 120)
            return PackageLevel.Oversize;

        if (billableWeight > 10 || maxDimension > 80)
            return PackageLevel.Bulky;

        if (billableWeight > 2 || maxDimension > 40)
            return PackageLevel.Large;

        return PackageLevel.Standard;
    }
}
