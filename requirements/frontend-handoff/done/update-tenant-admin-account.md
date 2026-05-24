# Update Tenant Admin Account

Claude, use the categorized admin API client only:

`src/clients/shared/api/contracts/admin/`

Add tenant admin account editing on the system-admin tenant management UI.

Use:

`adminApi.tenantManagement.updateTenantAdminAccount(id, input)`

Endpoint:

`PUT /api/TenantManagement/tenants/{id}/admin-account`

Auth:

SystemAdmin only.

Request:

```ts
{
  email?: string | null;
  password?: string | null;
  enabled?: boolean | null;
  displayName?: string | null;
}
```

Validation behavior:

- At least one field must be provided.
- `email`, `password`, and `displayName` cannot be empty when provided.
- `email` must be a valid email.
- Tenant must exist and must not be archived.
- Tenant must already have a tenant admin account.

Response:

```ts
{
  tenantId: number;
  tenantSignature: string;
  identityUserId: string;
  email: string | null;
  userName: string | null;
  displayName: string | null;
  emailConfirmed: boolean;
  enabled: boolean;
  lockoutEnd: string | null;
}
```

Notes:

- This updates the real Identity tenant admin user.
- When email changes, backend also syncs `TenantResponse.adminEmail`.
- The existing focused methods still exist for separate actions: reset password, change email, and enable/disable. This new method is for a single account edit form.

Move this file to `requirements/frontend-handoff/done/` after implementation.
