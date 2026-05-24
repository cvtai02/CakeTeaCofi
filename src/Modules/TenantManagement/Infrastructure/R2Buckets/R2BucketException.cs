namespace TenantManagement.Infrastructure.R2Buckets;

public class R2BucketException(string message, Exception? innerException = null)
    : Exception(message, innerException);
