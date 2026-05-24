using Content.DTOs.FileObjects;
using Content.Core.Usecases.FileObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/file-objects")]
public class FileObjectController(
    ListMediaFiles listMediaFiles,
    ListUnusedMediaFiles listUnusedMediaFiles,
    GetPresignedUpload getPresignedUpload,
    ConfirmUpload confirmUpload,
    DeleteMediaFiles deleteMediaFiles,
    DeleteUnusedMediaFiles deleteUnusedMediaFiles,
    ImportUnusedMediaFiles importUnusedMediaFiles,
    DeleteMediaFilesByKeys deleteMediaFilesByKeys) : ControllerBase
{
    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet]
    public async Task<ActionResult<PaginatedList<MediaFileResponse>>> GetAll(
        [FromQuery] ListMediaFilesRequest request, CancellationToken cancellationToken)
        => Ok(await listMediaFiles.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("unused")]
    public async Task<ActionResult<PaginatedList<UnusedMediaFileResponse>>> GetUnused(
        [FromQuery] ListUnusedMediaFilesRequest request, CancellationToken cancellationToken)
        => Ok(await listUnusedMediaFiles.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("unused")]
    public async Task<ActionResult<DeleteUnusedMediaFilesResponse>> DeleteUnused(
        [FromBody] DeleteUnusedMediaFilesRequest request,
        CancellationToken cancellationToken)
        => Ok(await deleteUnusedMediaFiles.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("unused/import")]
    public async Task<ActionResult<ImportUnusedMediaFilesResponse>> ImportUnused(
        [FromBody] ImportUnusedMediaFilesRequest request,
        CancellationToken cancellationToken)
        => Ok(await importUnusedMediaFiles.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("by-keys")]
    public async Task<ActionResult<DeleteMediaFilesByKeysResponse>> DeleteByKeys(
        [FromBody] DeleteMediaFilesByKeysRequest request,
        CancellationToken cancellationToken)
        => Ok(await deleteMediaFilesByKeys.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("presigned-upload")]
    public async Task<ActionResult<PresignedUploadBulkUrlResponse>> GetPresignedUploadBulkUrl(
        [FromBody] GetPresignedUploadBulkUrlRequest request, CancellationToken cancellationToken)
        => Ok(await getPresignedUpload.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost("confirm-upload")]
    public async Task<ActionResult<ConfirmUploadResponse>> ConfirmUpload(
        [FromBody] ConfirmUploadRequest request, CancellationToken cancellationToken)
        => Ok(await confirmUpload.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete]
    public async Task<IActionResult> Delete(
        [FromBody] DeleteMediaFilesRequest request, CancellationToken cancellationToken)
    {
        await deleteMediaFiles.ExecuteAsync(request, cancellationToken);
        return NoContent();
    }
}
