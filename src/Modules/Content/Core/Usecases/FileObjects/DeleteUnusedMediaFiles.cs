using Content.DTOs.FileObjects;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

[UsecaseInject]
public class DeleteUnusedMediaFiles(ContentDbContext db, IFileManager fileManager)
{
    public async Task<DeleteUnusedMediaFilesResponse> ExecuteAsync(
        DeleteUnusedMediaFilesRequest request,
        CancellationToken cancellationToken)
    {
        var keys = (request.Keys ?? [])
            .Select(x => x?.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Cast<string>()
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (keys.Count == 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Keys)] = ["At least one file key is required."]
            });

        var registeredKeys = await db.Files
            .AsNoTracking()
            .Where(x => keys.Contains(x.Key))
            .Select(x => x.Key)
            .ToListAsync(cancellationToken);

        if (registeredKeys.Count > 0)
            throw new ValidationException("Validation failed", new Dictionary<string, string[]>
            {
                [nameof(request.Keys)] = [$"Files are registered in the content database and cannot be deleted as unused: {string.Join(", ", registeredKeys.Distinct(StringComparer.Ordinal))}."]
            });

        await fileManager.DeleteBulkAsync(keys, cancellationToken);

        return new DeleteUnusedMediaFilesResponse
        {
            DeletedCount = keys.Count,
            DeletedKeys = keys
        };
    }
}
