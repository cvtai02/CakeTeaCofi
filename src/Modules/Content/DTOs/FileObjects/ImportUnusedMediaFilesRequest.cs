using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class ImportUnusedMediaFilesRequest
{
    [Required]
    public List<string> Keys { get; set; } = [];
}

public class ImportUnusedMediaFilesResponse
{
    public List<UploadResponse> Files { get; set; } = [];
}
