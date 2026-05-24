# Hard Delete Tenant

1. System admin archives a tenant first.
2. System admin requests hard delete for the archived tenant.
3. Backend rejects hard delete if the tenant is not archived.
4. Backend removes the tenant record from tenant management.
5. Backend does not delete other module data or object storage in this flow.
