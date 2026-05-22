using Microsoft.AspNetCore.Http;
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
    public ActionResult GetSubLocalities(
        [FromQuery] ListShippingSubLocalitiesRequest request)
        => Problem(
            title: "Shipping sublocality lookup is not implemented.",
            detail: "Only country, administrative area, and locality lookup are currently available.",
            statusCode: StatusCodes.Status501NotImplemented);

    [HttpGet]
    public async Task<ActionResult<ShippingAddressCatalogResponse>> GetAll(
        [FromQuery] ListShippingAddressesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listShippingAddresses.ExecuteAsync(request, cancellationToken));
}
