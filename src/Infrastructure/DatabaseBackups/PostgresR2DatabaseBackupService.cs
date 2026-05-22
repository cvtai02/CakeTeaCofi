using System.Diagnostics;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Npgsql;
using SharedKernel.Abstractions.Services;

namespace Infrastructure.DatabaseBackups;

public class PostgresR2DatabaseBackupService(
    SettingsProvider settingsProvider,
    ITenant tenant,
    TimeProvider timeProvider) : IDatabaseBackupService
{
    private static readonly SemaphoreSlim BackupLock = new(1, 1);

    public async Task<DatabaseBackupResult> BackupAsync(CancellationToken cancellationToken = default)
    {
        if (!await BackupLock.WaitAsync(0, cancellationToken))
            throw new DatabaseBackupException("A database backup is already running.");

        try
        {
            var settings = settingsProvider.GetCommonSettings();
            var databaseSettings = settings.Database
                ?? throw new DatabaseBackupException("Database settings are missing.");
            var storageSettings = settings.FileStorage
                ?? throw new DatabaseBackupException("File storage settings are missing.");
            var backupSettings = settings.DatabaseBackup ?? new DatabaseBackupSettings();

            if (!backupSettings.Enabled)
                throw new DatabaseBackupException("Database backup is disabled.");
            if (databaseSettings.Provider != DatabaseProvider.PostgreSQL)
                throw new DatabaseBackupException("Database backup currently supports PostgreSQL only.");
            if (storageSettings.Provider != ObjectStorageProvider.CloudflareR2)
                throw new DatabaseBackupException("Database backup currently supports Cloudflare R2 only.");

            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromMinutes(Math.Max(1, backupSettings.TimeoutMinutes)));

            var startedAt = timeProvider.GetUtcNow();
            var objectKey = BuildObjectKey(backupSettings, startedAt);
            var bucketName = string.IsNullOrWhiteSpace(backupSettings.BucketName)
                ? tenant.Signature
                : backupSettings.BucketName.Trim();

            await using var dumpStream = await StartPgDumpAsync(
                databaseSettings.ConnectionString,
                backupSettings.PgDumpPath,
                timeoutCts.Token);
            await using var countingStream = new CountingReadStream(dumpStream.Stream);

            using var s3Client = CreateClient(storageSettings);
            var uploaded = false;
            try
            {
                await s3Client.PutObjectAsync(new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = objectKey,
                    InputStream = countingStream,
                    ContentType = "application/vnd.postgresql.dump"
                }, timeoutCts.Token);
                uploaded = true;

                await dumpStream.EnsureSucceededAsync(timeoutCts.Token);
            }
            catch
            {
                if (uploaded)
                {
                    await s3Client.DeleteObjectAsync(bucketName, objectKey, CancellationToken.None);
                }

                throw;
            }

            var completedAt = timeProvider.GetUtcNow();
            return new DatabaseBackupResult
            {
                BucketName = bucketName,
                ObjectKey = objectKey,
                Size = countingStream.BytesRead,
                StartedAt = startedAt,
                CompletedAt = completedAt
            };
        }
        finally
        {
            BackupLock.Release();
        }
    }

    private static async Task<PgDumpProcessStream> StartPgDumpAsync(
        string connectionString,
        string pgDumpPath,
        CancellationToken cancellationToken)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = string.IsNullOrWhiteSpace(pgDumpPath) ? "pg_dump" : pgDumpPath,
                Arguments = "--format=custom --no-owner --no-acl",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            },
            EnableRaisingEvents = true
        };

        SetEnvironment(process.StartInfo, "PGHOST", builder.Host);
        SetEnvironment(process.StartInfo, "PGPORT", builder.Port == 0 ? null : builder.Port.ToString());
        SetEnvironment(process.StartInfo, "PGDATABASE", builder.Database);
        SetEnvironment(process.StartInfo, "PGUSER", builder.Username);
        SetEnvironment(process.StartInfo, "PGPASSWORD", builder.Password);
        if (builder.SslMode != SslMode.Disable)
            SetEnvironment(process.StartInfo, "PGSSLMODE", builder.SslMode.ToString().ToLowerInvariant());

        try
        {
            process.Start();
        }
        catch (Exception ex)
        {
            process.Dispose();
            throw new DatabaseBackupException($"Could not start pg_dump: {ex.Message}");
        }

        var stderrTask = process.StandardError.ReadToEndAsync(cancellationToken);
        return new PgDumpProcessStream(process, process.StandardOutput.BaseStream, stderrTask);
    }

    private static void SetEnvironment(ProcessStartInfo startInfo, string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            startInfo.Environment[key] = value;
    }

    private static string BuildObjectKey(DatabaseBackupSettings settings, DateTimeOffset startedAt)
    {
        var prefix = string.IsNullOrWhiteSpace(settings.KeyPrefix)
            ? "backups/database"
            : settings.KeyPrefix.Trim().Trim('/');
        return $"{prefix}/app_{startedAt:yyyyMMdd_HHmmss}.dump";
    }

    private static AmazonS3Client CreateClient(ObjectStorageSettings settings)
    {
        var config = new AmazonS3Config
        {
            ServiceURL = settings.ApiUrl,
            ForcePathStyle = true,
            AuthenticationRegion = "auto",
        };
        AWSCredentials credentials = new BasicAWSCredentials(settings.AccessKeyId, settings.SecretAccessKey);
        return new AmazonS3Client(credentials, config);
    }

    private sealed class PgDumpProcessStream(
        Process process,
        Stream stream,
        Task<string> stderrTask) : IAsyncDisposable
    {
        public Stream Stream { get; } = stream;

        public async Task EnsureSucceededAsync(CancellationToken cancellationToken)
        {
            await process.WaitForExitAsync(cancellationToken);
            if (process.ExitCode == 0)
                return;

            var stderr = await stderrTask;
            throw new DatabaseBackupException(
                string.IsNullOrWhiteSpace(stderr)
                    ? $"pg_dump failed with exit code {process.ExitCode}."
                    : $"pg_dump failed with exit code {process.ExitCode}: {stderr.Trim()}");
        }

        public async ValueTask DisposeAsync()
        {
            await Stream.DisposeAsync();
            process.Dispose();
        }
    }

    private sealed class CountingReadStream(Stream inner) : Stream
    {
        public long BytesRead { get; private set; }
        public override bool CanRead => inner.CanRead;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
        public override void Flush() => throw new NotSupportedException();
        public override int Read(byte[] buffer, int offset, int count)
        {
            var read = inner.Read(buffer, offset, count);
            BytesRead += read;
            return read;
        }

        public override async ValueTask<int> ReadAsync(
            Memory<byte> buffer,
            CancellationToken cancellationToken = default)
        {
            var read = await inner.ReadAsync(buffer, cancellationToken);
            BytesRead += read;
            return read;
        }

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                inner.Dispose();
            base.Dispose(disposing);
        }

        public override async ValueTask DisposeAsync()
        {
            await inner.DisposeAsync();
            await base.DisposeAsync();
        }
    }
}
