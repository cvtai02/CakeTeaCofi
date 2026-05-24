using System.ComponentModel.DataAnnotations;

namespace Shipping.DTOs.Quotes;

public class CreateShippingQuoteRequest
{
    [Required]
    public ShippingQuoteAddressRequest AddressFrom { get; set; } = new();

    [Required]
    public ShippingQuoteAddressRequest AddressTo { get; set; } = new();

    public List<ShippingQuoteItemRequest> Items { get; set; } = [];
}

public class ShippingQuoteItemRequest
{
    [Required]
    public string VariantId { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;
}

public class ShippingQuoteAddressRequest
{
    public string Country { get; set; } = string.Empty;
    public string AdministrativeArea { get; set; } = string.Empty;
    public string Locality { get; set; } = string.Empty;
    public string SubLocality { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}
