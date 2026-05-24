namespace AppHost.DTOs.R2Buckets;

public class R2BucketResponse
{
    public string BucketName { get; set; } = string.Empty;
    public bool Created { get; set; }
    public DateTimeOffset CheckedAt { get; set; }
}
