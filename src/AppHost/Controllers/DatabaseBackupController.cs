using AppHost.DTOs.DatabaseBackups;
using Infrastructure.DatabaseBackups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;

namespace AppHost.Controllers;

[ApiController]
[Route("api/internal/database-backups")]
[Authorize(Policy = Policies.AdminOnly)]
public class DatabaseBackupController(IDatabaseBackupService backupService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<DatabaseBackupResponse>> Create(CancellationToken cancellationToken)
    {
        var result = await backupService.BackupAsync(cancellationToken);
        return Ok(new DatabaseBackupResponse
        {
            BucketName = result.BucketName,
            ObjectKey = result.ObjectKey,
            Size = result.Size,
            StartedAt = result.StartedAt,
            CompletedAt = result.CompletedAt,
            DurationSeconds = result.Duration.TotalSeconds
        });
    }
}
