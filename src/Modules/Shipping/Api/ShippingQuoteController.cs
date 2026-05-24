using Microsoft.AspNetCore.Mvc;
using Shipping.Core.Usecases.Quotes;
using Shipping.DTOs.Quotes;

namespace Shipping.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/quotes")]
public class ShippingQuoteController(CreateShippingQuote createShippingQuote) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ShippingQuoteResponse>> Create(
        [FromBody] CreateShippingQuoteRequest request,
        CancellationToken cancellationToken)
        => Ok(await createShippingQuote.ExecuteAsync(request, cancellationToken));
}
