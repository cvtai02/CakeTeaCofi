# Backup Database To R2

1. System admin requests a database backup.
2. API verifies admin authorization.
3. API starts one PostgreSQL backup process.
4. API streams the backup output directly to R2.
5. API returns the backup object key, bucket, size, and duration.
