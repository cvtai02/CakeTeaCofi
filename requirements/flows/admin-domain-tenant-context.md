# Admin Domain Tenant Context

1. System admin opens `https://admin.nekomin.com`.
2. System admin can call system-admin APIs without a tenant signature.
3. System admin selects a tenant and frontend routes to `https://admin.nekomin.com/<signature>`.
4. Frontend sends `X-Tenant-Signature: <signature>` on tenant-scoped API requests.
5. Frontend sends `tenantSignature=<signature>` on tenant-scoped hub requests when custom headers are not available.
6. Backend resolves active tenant context from `X-Tenant-Signature` or `tenantSignature` before host-domain resolution.
7. If no tenant signature is provided on the admin domain, backend uses the default tenant only as a compatibility context for system-admin surfaces.
