using Content.DTOs.FileObjects;
using Intermediary.Media;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

[UsecaseInject]
public class DeleteMediaFilesByKeys(
    ContentDbContext db,
    IFileManager fileManager,
    IEnumerable<IMediaUsageChecker> usageCheckers)
{
    public async Task<DeleteMediaFilesByKeysResponse> ExecuteAsync(
        DeleteMediaFilesByKeysRequest request,
        CancellationToken cancellationToken)
    {
        var keys = NormalizeKeys(request.Keys);
        if (keys.Count == 0)
            throw Validation(nameof(request.Keys), "At least one file key is required.");

        var files = await db.Files
            .Where(x => keys.Contains(x.Key))
            .ToListAsync(cancellationToken);

        var foundKeys = files.Select(x => x.Key).ToHashSet(StringComparer.Ordinal);
        var missingKeys = keys.Where(x => !foundKeys.Contains(x)).ToList();
        if (missingKeys.Count > 0)
            throw new NotFoundException($"Media files were not found: {string.Join(", ", missingKeys)}.");

        var usedKeys = new HashSet<string>(StringComparer.Ordinal);
        foreach (var checker in usageCheckers)
        {
            var checkerUsedKeys = await checker.GetUsedKeysAsync(keys, cancellationToken);
            foreach (var key in checkerUsedKeys)
                usedKeys.Add(key);
        }

        if (usedKeys.Count > 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Keys)] = [$"Media files are still in use: {string.Join(", ", usedKeys)}."]
            });

        await fileManager.DeleteBulkAsync(keys, cancellationToken);

        db.Files.RemoveRange(files);
        await db.SaveChangesAsync(cancellationToken);

        return new DeleteMediaFilesByKeysResponse
        {
            DeletedCount = keys.Count,
            DeletedKeys = keys
        };
    }

    private static List<string> NormalizeKeys(IEnumerable<string>? keys)
        => (keys ?? [])
            .Select(x => x?.Trim().TrimStart('/'))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Cast<string>()
            .Distinct(StringComparer.Ordinal)
            .ToList();

    private static ValidationException Validation(string key, string message)
        => new("Validation failed", new Dictionary<string, string[]> { [key] = [message] });
}
