# List Unused Content Files

1. Admin opens media cleanup.
2. API lists object keys from object storage for the tenant bucket.
3. API loads stored content file keys from database.
4. API returns storage objects whose keys are not present in database.
5. Admin reviews unused files before deciding whether to delete or re-upload metadata later.
