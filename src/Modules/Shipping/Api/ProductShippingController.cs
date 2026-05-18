using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using Shipping.Core.Usecases.ProductShippings;
using Shipping.DTOs.ProductShipping;

namespace Shipping.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}")]
public class ProductShippingController(
    GetProductShipping getProductShipping) : ControllerBase
{
    [Authorize(Policy = Policies.TenantModeratorUp)]
    [HttpGet("products/{productId}")]
    public async Task<ActionResult<ProductShippingResponse>> Get(
        string productId,
        CancellationToken cancellationToken)
    {
        var result = await getProductShipping.ExecuteAsync(productId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
