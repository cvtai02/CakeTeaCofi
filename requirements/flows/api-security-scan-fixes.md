# API Security Scan Fixes

1. Tenant admin opens media manager.
2. Backend requires TenantAdminUp for file listing, upload signing, upload confirmation, and file deletion.
3. Customer opens payment transaction detail.
4. Backend returns the transaction only when it belongs to the current user.
5. Tenant admin opens payment transaction detail.
6. Backend uses the admin transaction endpoint to read any transaction in the current tenant.
