# Tenant Create Bucket Provisioning

1. System admin creates a tenant with a signature.
2. Backend validates tenant input.
3. Backend checks whether the tenant signature already exists.
4. If the signature exists, backend returns validation error.
5. If the signature does not exist, backend creates or confirms the R2 bucket named by that signature.
6. Backend sets tenant CDN base URL to `https://cdn-<signature>.<app-domain>`.
7. Backend saves the tenant.
