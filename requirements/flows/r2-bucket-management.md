# R2 Bucket Management

1. System admin opens storage operations.
2. System admin submits a bucket name, or leaves it empty to use the current tenant signature.
3. Backend validates the bucket name.
4. Backend checks Cloudflare R2 for an existing bucket.
5. If the bucket exists, backend returns the bucket metadata with `created = false`.
6. If the bucket does not exist, backend creates it and returns `created = true`.
