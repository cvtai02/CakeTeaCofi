using Content.Core.Entities;
using Content.DTOs.FileObjects;
using SharedKernel.Abstractions.Services;

namespace Content.Core.Usecases.FileObjects;

public static class FileObjectResponseMapper
{
    public static UploadResponse ToUploadResponse(FileObject fileObject, IFileManager fileManager) => new()
    {
        Id = fileObject.Id,
        Key = fileObject.Key,
        Category = fileObject.Category,
        Name = fileObject.Name,
        ContentType = fileObject.ContentType,
        Size = fileObject.Size,
        PublicUrl = fileManager.BuildPublicUrl(fileObject.Key) ?? string.Empty
    };
}
