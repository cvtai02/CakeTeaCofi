# R2 Bucket Provisioning With FileStorage Credentials

1. System admin creates a tenant.
2. Backend validates tenant signature and domain uniqueness.
3. Backend creates or confirms the R2 bucket using the configured FileStorage S3-compatible credentials.
4. Backend stores the expected CDN base URL using the tenant signature convention.
5. Backend does not call the Cloudflare Management API to attach custom domains.
6. Custom domain and DNS setup are handled outside this API.
