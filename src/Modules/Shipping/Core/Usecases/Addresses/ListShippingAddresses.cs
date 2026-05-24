using SharedKernel.EnumsConstants;
using Shipping.DTOs.Addresses;

namespace Shipping.Core.Usecases.Addresses;

[UsecaseInject]
public class ListShippingAddresses
{
    public Task<ShippingCountriesResponse> ListCountriesAsync(CancellationToken ct)
        => Task.FromResult(new ShippingCountriesResponse
        {
            NextEndpoint = "/api/Shipping/addresses/administrative-areas?Country={country}",
            Countries = Enum.GetValues<CountryCode>()
                .Select(country => new ShippingCountryResponse
                {
                    Code = country,
                    Name = country.ToString(),
                    DisplayName = GetCountryDisplayName(country),
                    IsSupported = country == CountryCode.VN,
                    NextAdministrativeLevel = country == CountryCode.VN ? "AdministrativeArea" : null,
                    NextEndpoint = country == CountryCode.VN
                        ? $"/api/Shipping/addresses/administrative-areas?Country={country}"
                        : null
                })
                .ToList()
        });

    public Task<ShippingAdministrativeAreasResponse> ListAdministrativeAreasAsync(
        ListShippingAddressesRequest request,
        CancellationToken ct)
    {
        var areas = request.Country == CountryCode.VN
            ? VietnamAdministrativeAreas
            : [];

        return Task.FromResult(new ShippingAdministrativeAreasResponse
        {
            Country = request.Country,
            NextEndpointTemplate = request.Country == CountryCode.VN
                ? $"/api/Shipping/addresses/localities?Country={request.Country}&AdministrativeAreaCode={{code}}"
                : null,
            AdministrativeAreas = areas
        });
    }

    public async Task<ShippingAddressCatalogResponse> ExecuteAsync(
        ListShippingAddressesRequest request,
        CancellationToken ct)
    {
        var response = await ListAdministrativeAreasAsync(request, ct);
        return new ShippingAddressCatalogResponse
        {
            Country = response.Country,
            Provinces = response.AdministrativeAreas
                .Select(area => new ShippingProvinceResponse
                {
                    Code = area.Code,
                    Name = area.Name,
                    Type = area.Type,
                    Region = area.Region,
                    DisplayName = area.DisplayName
                })
                .ToList()
        };
    }

    public Task<ShippingLocalitiesResponse> ListLocalitiesAsync(
        ListShippingLocalitiesRequest request,
        CancellationToken ct)
    {
        var localities = request.Country == CountryCode.VN
            ? VietnamLocalitiesByAdministrativeArea.GetValueOrDefault(request.AdministrativeAreaCode.Trim(), [])
            : [];

        return Task.FromResult(new ShippingLocalitiesResponse
        {
            Country = request.Country,
            AdministrativeAreaCode = request.AdministrativeAreaCode,
            NextEndpointTemplate = request.Country == CountryCode.VN
                ? $"/api/Shipping/addresses/sublocalities?Country={request.Country}&AdministrativeAreaCode={Uri.EscapeDataString(request.AdministrativeAreaCode)}&LocalityCode={{code}}"
                : null,
            Localities = localities
        });
    }

    public Task<ShippingSubLocalitiesResponse> ListSubLocalitiesAsync(
        ListShippingSubLocalitiesRequest request,
        CancellationToken ct)
    {
        var key = $"{request.AdministrativeAreaCode.Trim()}:{request.LocalityCode.Trim()}";
        var subLocalities = request.Country == CountryCode.VN
            ? VietnamSubLocalitiesByLocality.GetValueOrDefault(key, [])
            : [];

        return Task.FromResult(new ShippingSubLocalitiesResponse
        {
            Country = request.Country,
            AdministrativeAreaCode = request.AdministrativeAreaCode,
            LocalityCode = request.LocalityCode,
            SubLocalities = subLocalities
        });
    }

    private static string GetCountryDisplayName(CountryCode country)
        => country switch
        {
            CountryCode.VN => "Việt Nam",
            CountryCode.US => "United States",
            _ => country.ToString()
        };

    private static readonly List<ShippingAdministrativeAreaResponse> VietnamAdministrativeAreas =
    [
        AdministrativeArea("01", "Hà Nội", "Thành phố", "North"),
        AdministrativeArea("04", "Cao Bằng", "Tỉnh", "North"),
        AdministrativeArea("08", "Tuyên Quang", "Tỉnh", "North"),
        AdministrativeArea("11", "Điện Biên", "Tỉnh", "North"),
        AdministrativeArea("12", "Lai Châu", "Tỉnh", "North"),
        AdministrativeArea("14", "Sơn La", "Tỉnh", "North"),
        AdministrativeArea("15", "Lào Cai", "Tỉnh", "North"),
        AdministrativeArea("19", "Thái Nguyên", "Tỉnh", "North"),
        AdministrativeArea("20", "Lạng Sơn", "Tỉnh", "North"),
        AdministrativeArea("22", "Quảng Ninh", "Tỉnh", "North"),
        AdministrativeArea("24", "Bắc Ninh", "Tỉnh", "North"),
        AdministrativeArea("25", "Phú Thọ", "Tỉnh", "North"),
        AdministrativeArea("31", "Hải Phòng", "Thành phố", "North"),
        AdministrativeArea("33", "Hưng Yên", "Tỉnh", "North"),
        AdministrativeArea("37", "Ninh Bình", "Tỉnh", "North"),
        AdministrativeArea("38", "Thanh Hóa", "Tỉnh", "Central"),
        AdministrativeArea("40", "Nghệ An", "Tỉnh", "Central"),
        AdministrativeArea("42", "Hà Tĩnh", "Tỉnh", "Central"),
        AdministrativeArea("44", "Quảng Trị", "Tỉnh", "Central"),
        AdministrativeArea("46", "Huế", "Thành phố", "Central"),
        AdministrativeArea("48", "Đà Nẵng", "Thành phố", "Central"),
        AdministrativeArea("51", "Quảng Ngãi", "Tỉnh", "Central"),
        AdministrativeArea("52", "Gia Lai", "Tỉnh", "Central Highlands"),
        AdministrativeArea("56", "Khánh Hòa", "Tỉnh", "South Central"),
        AdministrativeArea("66", "Đắk Lắk", "Tỉnh", "Central Highlands"),
        AdministrativeArea("68", "Lâm Đồng", "Tỉnh", "Central Highlands"),
        AdministrativeArea("75", "Đồng Nai", "Tỉnh", "South"),
        AdministrativeArea("79", "Hồ Chí Minh", "Thành phố", "South"),
        AdministrativeArea("80", "Tây Ninh", "Tỉnh", "South"),
        AdministrativeArea("82", "Đồng Tháp", "Tỉnh", "Mekong Delta"),
        AdministrativeArea("86", "Vĩnh Long", "Tỉnh", "Mekong Delta"),
        AdministrativeArea("91", "An Giang", "Tỉnh", "Mekong Delta"),
        AdministrativeArea("92", "Cần Thơ", "Thành phố", "Mekong Delta"),
        AdministrativeArea("96", "Cà Mau", "Tỉnh", "Mekong Delta")
    ];

    private static readonly Dictionary<string, List<ShippingLocalityResponse>> VietnamLocalitiesByAdministrativeArea = new()
    {
        ["01"] =
        [
            Locality("01", "001", "Ba Đình", "Quận"),
            Locality("01", "002", "Hoàn Kiếm", "Quận"),
            Locality("01", "003", "Tây Hồ", "Quận"),
            Locality("01", "004", "Long Biên", "Quận"),
            Locality("01", "005", "Cầu Giấy", "Quận"),
            Locality("01", "006", "Đống Đa", "Quận"),
            Locality("01", "007", "Hai Bà Trưng", "Quận"),
            Locality("01", "008", "Hoàng Mai", "Quận"),
            Locality("01", "009", "Thanh Xuân", "Quận"),
            Locality("01", "016", "Sóc Sơn", "Huyện")
        ],
        ["31"] =
        [
            Locality("31", "303", "Hồng Bàng", "Quận"),
            Locality("31", "304", "Ngô Quyền", "Quận"),
            Locality("31", "305", "Lê Chân", "Quận"),
            Locality("31", "306", "Hải An", "Quận"),
            Locality("31", "307", "Kiến An", "Quận"),
            Locality("31", "308", "Đồ Sơn", "Quận")
        ],
        ["46"] =
        [
            Locality("46", "474", "Thuận Hóa", "Quận"),
            Locality("46", "475", "Phú Xuân", "Quận"),
            Locality("46", "476", "Phong Điền", "Thị xã"),
            Locality("46", "477", "Quảng Điền", "Huyện")
        ],
        ["48"] =
        [
            Locality("48", "490", "Hải Châu", "Quận"),
            Locality("48", "491", "Thanh Khê", "Quận"),
            Locality("48", "492", "Sơn Trà", "Quận"),
            Locality("48", "493", "Ngũ Hành Sơn", "Quận"),
            Locality("48", "494", "Liên Chiểu", "Quận"),
            Locality("48", "495", "Cẩm Lệ", "Quận")
        ],
        ["79"] =
        [
            Locality("79", "760", "Quận 1", "Quận"),
            Locality("79", "761", "Quận 12", "Quận"),
            Locality("79", "764", "Gò Vấp", "Quận"),
            Locality("79", "765", "Bình Thạnh", "Quận"),
            Locality("79", "766", "Tân Bình", "Quận"),
            Locality("79", "767", "Tân Phú", "Quận"),
            Locality("79", "768", "Phú Nhuận", "Quận"),
            Locality("79", "769", "Thủ Đức", "Thành phố")
        ],
        ["92"] =
        [
            Locality("92", "916", "Ninh Kiều", "Quận"),
            Locality("92", "917", "Ô Môn", "Quận"),
            Locality("92", "918", "Bình Thủy", "Quận"),
            Locality("92", "919", "Cái Răng", "Quận"),
            Locality("92", "923", "Thốt Nốt", "Quận")
        ]
    };

    private static readonly Dictionary<string, List<ShippingSubLocalityResponse>> VietnamSubLocalitiesByLocality = new();

    private static ShippingAdministrativeAreaResponse AdministrativeArea(
        string code,
        string name,
        string type,
        string region)
        => new()
        {
            Code = code,
            Name = name,
            Type = type,
            Region = region,
            DisplayName = $"{type} {name}",
            NextAdministrativeLevel = "Locality",
            NextEndpoint = $"/api/Shipping/addresses/localities?Country=VN&AdministrativeAreaCode={Uri.EscapeDataString(code)}"
        };

    private static ShippingLocalityResponse Locality(
        string administrativeAreaCode,
        string code,
        string name,
        string type)
        => new()
        {
            Code = code,
            Name = name,
            Type = type,
            DisplayName = name.StartsWith(type, StringComparison.OrdinalIgnoreCase) ? name : $"{type} {name}",
            NextAdministrativeLevel = "SubLocality",
            NextEndpoint = $"/api/Shipping/addresses/sublocalities?Country=VN&AdministrativeAreaCode={Uri.EscapeDataString(administrativeAreaCode)}&LocalityCode={Uri.EscapeDataString(code)}"
        };
}
