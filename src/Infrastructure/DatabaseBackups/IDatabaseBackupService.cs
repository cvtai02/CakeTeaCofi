namespace Infrastructure.DatabaseBackups;

public interface IDatabaseBackupService
{
    Task<DatabaseBackupResult> BackupAsync(CancellationToken cancellationToken = default);
}
