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
    CreateTenant createTenant,
    UpdateTenant updateTenant,
    UpdateTenantLogo updateTenantLogo,
    CreateTenantAdminAccount createTenantAdminAccount,
    UpdateTenantAdminAccount updateTenantAdminAccount,
    ListTenantAdminUsers listTenantAdminUsers,
    ResetTenantAdminPassword resetTenantAdminPassword,
    ChangeTenantAdminEmail changeTenantAdminEmail,
    SetTenantAdminEnabled setTenantAdminEnabled,
    GetTenantProvisioningStatus getTenantProvisioningStatus,
    GetSystemAdminDashboardSummary getSystemAdminDashboardSummary,
    ArchiveTenant archiveTenant,
    HardDeleteTenant hardDeleteTenant,
    SetTenantActiveState setTenantActiveState) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<SystemAdminDashboardSummaryResponse>> GetSummary(CancellationToken cancellationToken)
        => Ok(await getSystemAdminDashboardSummary.ExecuteAsync(cancellationToken));

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

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TenantResponse>> Update(
        int id,
        [FromBody] UpdateTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateTenant.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}/logo")]
    public async Task<ActionResult<TenantResponse>> UpdateLogo(
        int id,
        [FromBody] UpdateTenantLogoRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateTenantLogo.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/admin-account")]
    public async Task<ActionResult<TenantResponse>> CreateAdminAccount(
        int id,
        [FromBody] CreateTenantAdminAccountRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createTenantAdminAccount.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}/admin-account")]
    public async Task<ActionResult<TenantAdminUserResponse>> UpdateAdminAccount(
        int id,
        [FromBody] UpdateTenantAdminAccountRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateTenantAdminAccount.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:int}/admin-users")]
    public async Task<ActionResult<IReadOnlyList<TenantAdminUserResponse>>> GetAdminUsers(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await listTenantAdminUsers.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/admin-account/reset-password")]
    public async Task<ActionResult<TenantAdminUserResponse>> ResetAdminPassword(
        int id,
        [FromBody] ResetTenantAdminPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await resetTenantAdminPassword.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}/admin-account/email")]
    public async Task<ActionResult<TenantAdminUserResponse>> ChangeAdminEmail(
        int id,
        [FromBody] ChangeTenantAdminEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await changeTenantAdminEmail.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}/admin-account/enabled")]
    public async Task<ActionResult<TenantAdminUserResponse>> SetAdminEnabled(
        int id,
        [FromBody] SetTenantAdminEnabledRequest request,
        CancellationToken cancellationToken)
    {
        var result = await setTenantAdminEnabled.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:int}/provisioning-status")]
    public async Task<ActionResult<TenantProvisioningStatusResponse>> GetProvisioningStatus(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getTenantProvisioningStatus.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/activate")]
    public async Task<ActionResult<TenantResponse>> Activate(int id, CancellationToken cancellationToken)
    {
        var result = await setTenantActiveState.ExecuteAsync(id, true, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/deactivate")]
    public async Task<ActionResult<TenantResponse>> Deactivate(int id, CancellationToken cancellationToken)
    {
        var result = await setTenantActiveState.ExecuteAsync(id, false, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/archive")]
    public async Task<ActionResult<TenantResponse>> Archive(int id, CancellationToken cancellationToken)
    {
        var result = await archiveTenant.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> HardDelete(int id, CancellationToken cancellationToken)
    {
        var deleted = await hardDeleteTenant.ExecuteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
