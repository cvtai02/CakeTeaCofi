using System.ComponentModel.DataAnnotations;

namespace Content.DTOs.FileObjects;

public class DeleteMediaFilesByKeysRequest
{
    [Required]
    public List<string> Keys { get; set; } = [];
}

public class DeleteMediaFilesByKeysResponse
{
    public int DeletedCount { get; set; }
    public List<string> DeletedKeys { get; set; } = [];
}
