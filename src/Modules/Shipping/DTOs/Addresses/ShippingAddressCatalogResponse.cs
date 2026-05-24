using SharedKernel.EnumsConstants;

namespace Shipping.DTOs.Addresses;

public class ShippingAddressCatalogResponse
{
    public CountryCode Country { get; set; }
    public List<ShippingProvinceResponse> Provinces { get; set; } = [];
}

public class ShippingCountriesResponse
{
    public string CurrentAdministrativeLevel { get; set; } = "Country";
    public string? NextAdministrativeLevel { get; set; } = "AdministrativeArea";
    public string? NextEndpoint { get; set; }
    public List<ShippingCountryResponse> Countries { get; set; } = [];
}

public class ShippingCountryResponse
{
    public CountryCode Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsSupported { get; set; }
    public string? NextAdministrativeLevel { get; set; }
    public string? NextEndpoint { get; set; }
}

public class ShippingAdministrativeAreasResponse
{
    public CountryCode Country { get; set; }
    public string CurrentAdministrativeLevel { get; set; } = "AdministrativeArea";
    public string? NextAdministrativeLevel { get; set; } = "Locality";
    public string? NextEndpointTemplate { get; set; }
    public List<ShippingAdministrativeAreaResponse> AdministrativeAreas { get; set; } = [];
}

public class ShippingAdministrativeAreaResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? NextAdministrativeLevel { get; set; }
    public string? NextEndpoint { get; set; }
}

public class ShippingLocalitiesResponse
{
    public CountryCode Country { get; set; }
    public string AdministrativeAreaCode { get; set; } = string.Empty;
    public string CurrentAdministrativeLevel { get; set; } = "Locality";
    public string? NextAdministrativeLevel { get; set; } = "SubLocality";
    public string? NextEndpointTemplate { get; set; }
    public List<ShippingLocalityResponse> Localities { get; set; } = [];
}

public class ShippingLocalityResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? NextAdministrativeLevel { get; set; }
    public string? NextEndpoint { get; set; }
}

public class ShippingSubLocalitiesResponse
{
    public CountryCode Country { get; set; }
    public string AdministrativeAreaCode { get; set; } = string.Empty;
    public string LocalityCode { get; set; } = string.Empty;
    public string CurrentAdministrativeLevel { get; set; } = "SubLocality";
    public List<ShippingSubLocalityResponse> SubLocalities { get; set; } = [];
}

public class ShippingSubLocalityResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class ShippingProvinceResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}
