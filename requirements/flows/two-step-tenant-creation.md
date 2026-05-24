# Two-Step Tenant Creation

1. System admin creates a tenant with basic information: name, signature, optional domain, country, tenant admin email, and tenant admin password.
2. Backend validates signature uniqueness and domain uniqueness when a domain is provided.
3. Backend creates or confirms the R2 bucket named by the signature and attaches `cdn-<signature>.nekomin.com`.
4. Backend creates the tenant admin account and returns the tenant.
5. System admin uploads the logo file through content file APIs.
6. System admin updates the tenant logo key through the tenant logo endpoint.
7. System admin can update the tenant domain later through the tenant update endpoint.
