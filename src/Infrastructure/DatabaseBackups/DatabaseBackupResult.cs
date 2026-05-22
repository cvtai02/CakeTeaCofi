namespace Infrastructure.DatabaseBackups;

public class DatabaseBackupResult
{
    public string BucketName { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset CompletedAt { get; set; }
    public TimeSpan Duration => CompletedAt - StartedAt;
}
