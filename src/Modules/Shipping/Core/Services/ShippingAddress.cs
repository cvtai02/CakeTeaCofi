namespace Shipping.Core.Services;

public class ShippingAddress
{
    public string Country { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}
