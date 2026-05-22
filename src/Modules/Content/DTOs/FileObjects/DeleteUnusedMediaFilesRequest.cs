using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class DeleteUnusedMediaFilesRequest
{
    [Required]
    public List<string> Keys { get; set; } = [];
}

public class DeleteUnusedMediaFilesResponse
{
    public int DeletedCount { get; set; }
    public List<string> DeletedKeys { get; set; } = [];
}
