using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;
using TenantManagement.Core.Usecases.Tenants;
using TenantManagement.DTOs.Tenants;

namespace TenantManagement.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/tenants")]
[Authorize(Policy = Policies.AdminOnly)]
public class TenantController(
    ListTenants listTenants,
    GetTenantById getTenantById,
    CreateTenant createTenant) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<TenantResponse>>> GetAll(
        [FromQuery] ListTenantsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listTenants.ExecuteAsync(request, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TenantResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await getTenantById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TenantResponse>> Create(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createTenant.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
