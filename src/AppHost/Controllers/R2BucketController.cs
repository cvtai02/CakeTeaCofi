using AppHost.DTOs.R2Buckets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using TenantManagement.Infrastructure.R2Buckets;

namespace AppHost.Controllers;

[ApiController]
[Route("api/internal/r2-buckets")]
[Authorize(Policy = Policies.AdminOnly)]
public class R2BucketController(IR2BucketService r2BucketService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<R2BucketResponse>> Create(
        [FromBody] CreateR2BucketRequest? request,
        CancellationToken cancellationToken)
    {
        var result = await r2BucketService.CreateBucketAsync(request?.BucketName, cancellationToken);
        return Ok(new R2BucketResponse
        {
            BucketName = result.BucketName,
            Created = result.Created,
            CheckedAt = result.CheckedAt
        });
    }

    [HttpGet("{bucketName}/status")]
    public async Task<ActionResult<R2BucketStatusResponse>> GetStatus(
        string bucketName,
        [FromQuery] string? customDomain,
        CancellationToken cancellationToken)
    {
        var result = await r2BucketService.GetStatusAsync(bucketName, customDomain, cancellationToken);
        return Ok(ToResponse(result));
    }

    [HttpPost("{bucketName}/custom-domain/retry")]
    public async Task<ActionResult<R2BucketStatusResponse>> RetryCustomDomain(
        string bucketName,
        [FromBody] RetryR2CustomDomainRequest request,
        CancellationToken cancellationToken)
    {
        var result = await r2BucketService.RetryAttachCustomDomainAsync(bucketName, request.CustomDomain, cancellationToken);
        return Ok(ToResponse(result));
    }

    private static R2BucketStatusResponse ToResponse(R2BucketStatusResult result)
        => new()
        {
            BucketName = result.BucketName,
            BucketExists = result.BucketExists,
            CustomDomain = result.CustomDomain,
            CustomDomainAttached = result.CustomDomainAttached,
            CustomDomainEnabled = result.CustomDomainEnabled,
            CustomDomainStatus = result.CustomDomainStatus,
            CheckedAt = result.CheckedAt
        };
}
