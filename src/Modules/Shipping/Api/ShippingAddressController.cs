using Microsoft.AspNetCore.Mvc;
using Shipping.Core.Usecases.Addresses;
using Shipping.DTOs.Addresses;

namespace Shipping.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/addresses")]
public class ShippingAddressController(
    ListShippingAddresses listShippingAddresses) : ControllerBase
{
    [HttpGet("countries")]
    public async Task<ActionResult<ShippingCountriesResponse>> GetCountries(
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ListCountriesAsync(cancellationToken));

    [HttpGet("administrative-areas")]
    public async Task<ActionResult<ShippingAdministrativeAreasResponse>> GetAdministrativeAreas(
        [FromQuery] ListShippingAddressesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ListAdministrativeAreasAsync(request, cancellationToken));

    [HttpGet("localities")]
    public async Task<ActionResult<ShippingLocalitiesResponse>> GetLocalities(
        [FromQuery] ListShippingLocalitiesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ListLocalitiesAsync(request, cancellationToken));

    [HttpGet("sublocalities")]
    public async Task<ActionResult<ShippingSubLocalitiesResponse>> GetSubLocalities(
        [FromQuery] ListShippingSubLocalitiesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ListSubLocalitiesAsync(request, cancellationToken));

    [HttpGet]
    public async Task<ActionResult<ShippingAddressCatalogResponse>> GetAll(
        [FromQuery] ListShippingAddressesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ExecuteAsync(request, cancellationToken));
}
