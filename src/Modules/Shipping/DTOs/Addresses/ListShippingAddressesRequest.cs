using SharedKernel.EnumsConstants;

namespace Shipping.DTOs.Addresses;

public class ListShippingAddressesRequest
{
    public CountryCode Country { get; set; } = CountryCode.VN;
}

public class ListShippingLocalitiesRequest
{
    public CountryCode Country { get; set; } = CountryCode.VN;
    public string AdministrativeAreaCode { get; set; } = string.Empty;
}

public class ListShippingSubLocalitiesRequest
{
    public CountryCode Country { get; set; } = CountryCode.VN;
    public string AdministrativeAreaCode { get; set; } = string.Empty;
    public string LocalityCode { get; set; } = string.Empty;
}
