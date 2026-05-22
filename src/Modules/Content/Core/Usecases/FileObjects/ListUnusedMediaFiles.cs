using Content.DTOs.FileObjects;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;
using SharedKernel.DTOs;

namespace Content.Core.Usecases.FileObjects;

[UsecaseInject]
public class ListUnusedMediaFiles(ContentDbContext db, IFileManager fileManager)
{
    public async Task<PaginatedList<UnusedMediaFileResponse>> ExecuteAsync(
        ListUnusedMediaFilesRequest request,
        CancellationToken cancellationToken)
    {
        var prefix = string.IsNullOrWhiteSpace(request.Prefix) ? null : request.Prefix.Trim();
        var existingKeys = await db.Files
            .AsNoTracking()
            .Select(x => x.Key)
            .ToListAsync(cancellationToken);
        var existingKeySet = existingKeys.ToHashSet(StringComparer.Ordinal);

        var storageObjects = await fileManager.ListObjectsAsync(prefix, cancellationToken);
        var query = storageObjects
            .Where(x => !string.IsNullOrWhiteSpace(x.Key))
            .Where(x => !existingKeySet.Contains(x.Key));

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Key.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        query = ApplySorting(query, request);

        var totalCount = query.Count();
        var items = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(ToResponse)
            .ToList();

        return new PaginatedList<UnusedMediaFileResponse>(items, totalCount, request.PageNumber, request.PageSize);
    }

    private static IEnumerable<FileObjectMetadata> ApplySorting(
        IEnumerable<FileObjectMetadata> query,
        ListUnusedMediaFilesRequest request)
    {
        var direction = request.SortDirection?.Trim().ToLowerInvariant();
        var descending = direction == "desc" || direction == "descending";

        return request.SortBy?.Trim().ToLowerInvariant() switch
        {
            "key" => descending ? query.OrderByDescending(x => x.Key) : query.OrderBy(x => x.Key),
            "category" => descending ? query.OrderByDescending(x => GetCategory(x.Key)) : query.OrderBy(x => GetCategory(x.Key)),
            "size" => descending ? query.OrderByDescending(x => x.Size) : query.OrderBy(x => x.Size),
            "lastmodified" or "last-modified" => descending ? query.OrderByDescending(x => x.LastModified) : query.OrderBy(x => x.LastModified),
            _ => query.OrderByDescending(x => x.LastModified).ThenBy(x => x.Key)
        };
    }

    private UnusedMediaFileResponse ToResponse(FileObjectMetadata file) => new()
    {
        Key = file.Key,
        Url = fileManager.BuildPublicUrl(file.Key) ?? string.Empty,
        Category = GetCategory(file.Key),
        ContentType = file.ContentType,
        Size = file.Size,
        LastModified = file.LastModified
    };

    private static string GetCategory(string key)
    {
        var separatorIndex = key.IndexOf('/');
        return separatorIndex <= 0 ? string.Empty : key[..separatorIndex];
    }
}
