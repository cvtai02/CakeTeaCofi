using Content.Core.Entities;
using Content.DTOs.FileObjects;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.Exceptions;

namespace Content.Core.Usecases.FileObjects;

[UsecaseInject]
public class ImportUnusedMediaFiles(ContentDbContext db, IFileManager fileManager)
{
    public async Task<ImportUnusedMediaFilesResponse> ExecuteAsync(
        ImportUnusedMediaFilesRequest request,
        CancellationToken cancellationToken)
    {
        var keys = NormalizeKeys(request.Keys);
        if (keys.Count == 0)
            throw Validation(nameof(request.Keys), "At least one file key is required.");

        var existingFiles = await db.Files
            .Where(x => keys.Contains(x.Key))
            .ToListAsync(cancellationToken);

        var responses = existingFiles
            .Select(x => FileObjectResponseMapper.ToUploadResponse(x, fileManager))
            .ToList();

        var existingKeys = existingFiles.Select(x => x.Key).ToHashSet(StringComparer.Ordinal);
        foreach (var key in keys.Where(x => !existingKeys.Contains(x)))
        {
            var metadata = await fileManager.GetObjectMetadataAsync(key, cancellationToken);
            if (metadata is null)
                throw Validation(nameof(request.Keys), $"Object was not found in storage: {key}.");

            var fileObject = new FileObject
            {
                Key = key,
                Category = GetCategory(key),
                Name = GetName(key),
                ContentType = metadata.ContentType,
                Size = metadata.Size
            };

            db.Files.Add(fileObject);
            await db.SaveChangesAsync(cancellationToken);
            responses.Add(FileObjectResponseMapper.ToUploadResponse(fileObject, fileManager));
        }

        return new ImportUnusedMediaFilesResponse { Files = responses };
    }

    private static List<string> NormalizeKeys(IEnumerable<string>? keys)
        => (keys ?? [])
            .Select(x => x?.Trim().TrimStart('/'))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Cast<string>()
            .Distinct(StringComparer.Ordinal)
            .ToList();

    private static string GetCategory(string key)
    {
        var separatorIndex = key.IndexOf('/');
        return separatorIndex <= 0 ? string.Empty : key[..separatorIndex];
    }

    private static string GetName(string key)
    {
        var normalized = key.TrimEnd('/');
        var separatorIndex = normalized.LastIndexOf('/');
        return separatorIndex < 0 ? normalized : normalized[(separatorIndex + 1)..];
    }

    private static ValidationException Validation(string key, string message)
        => new("Validation failed", new Dictionary<string, string[]> { [key] = [message] });
}
