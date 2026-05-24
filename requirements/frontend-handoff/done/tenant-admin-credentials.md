# Tenant Admin Credentials

Use the shared contracts:

- Tenant management: `src/clients/shared/api/contracts/tenantmanagement.ts`
- Identity login: `src/clients/shared/api/contracts/identity.ts`

## Provision Tenant Admin

System admin only:

- Method: `POST`
- Route: `/api/TenantManagement/tenants/{id}/admin-account`
- Shared client method: `tenantManagementClient.createTenantAdminAccount(id, input)`

Request body:

```ts
{
  email: string;
  password: string;
}
```

The password is the initial ASP.NET Identity password and must satisfy backend password rules. Backend creates the user with the `TenantAdmin` role. Password is not returned or stored on the tenant record.

Response is the updated tenant:

```ts
{
  id: number;
  name: string;
  signature: string;
  domain: string;
  cdnBaseUrl: string;
  logoKey?: string | null;
  logoUrl?: string | null;
  adminDashboardUrl: string;
  adminEmail?: string | null;
  countryCode: "VN" | "US";
  isActive: boolean;
  created: string;
  lastModified: string;
}
```

The same `adminEmail` property is returned by tenant list/detail/create/update responses.

Behavior:

- `404 Not Found` when tenant id does not exist.
- Validation error when email/password is missing, Identity rejects the email/password, or the tenant already has an admin account.
- Current backend provisions one admin login account per tenant through this endpoint.

## Login

Tenant admin signs in through the existing identity client:

```ts
identityClient.login({ email, password })
```

This calls `POST /login` and returns access and refresh tokens.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

---

## Completion Summary (2026-05-19)

Implemented in the admin client (`src/pages/tenants/index.tsx`):

- Added a "Provision admin" action that opens a `ProvisionAdminDialog` with
  `email` + initial-password fields and calls
  `tenantManagementClient.createTenantAdminAccount(tenant.id, { email, password })`.
  The list query is invalidated on success.
- The action is hidden once a tenant already has an `adminEmail`, matching
  the backend's "one admin login per tenant" behavior.
- Tenant cards now surface `tenant.adminEmail` (the same property returned on
  list / detail / create / update responses) under the tenant name when
  present.
- 400 `ValidationError` responses are mapped onto the relevant form fields
  case-insensitively (so backend rules from ASP.NET Identity surface inline).
  A descriptive helper text reminds the operator the password must satisfy
  backend password rules and is not stored.

Login itself is left as-is — the existing identity sign-in flow already
exposes `identityClient.login({ email, password })`, so the provisioned
operator can log in through the standard login screen with no additional UI
changes required.

`npm run lint` (admin): 0 errors; `tsc -b` clean for changed files.
