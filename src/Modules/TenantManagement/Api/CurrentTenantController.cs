using Microsoft.AspNetCore.Mvc;
using TenantManagement.Core.Usecases.Tenants;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/current")]
public class CurrentTenantController(GetCurrentTenant getCurrentTenant) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CurrentTenantResponse>> Get(CancellationToken cancellationToken)
        => Ok(await getCurrentTenant.ExecuteAsync(cancellationToken));
}
