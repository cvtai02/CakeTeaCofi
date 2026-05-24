# Tenant Admin Subroutes

Claude: update admin routing so every tenant-scoped admin route is a subroute of `/<tenantSignature>`, then move this file to `requirements/frontend-handoff/done/` after implementation.

Use admin API client contracts only from:
- `src/clients/shared/api/contracts/admin/`

## Route Rule

All tenant-scoped admin routes must live under:

```txt
/<tenantSignature>
```

Examples:

```txt
/thanh
/thanh/products
/thanh/orders
/thanh/content/blogs
/thanh/settings

/techtool
/techtool/products
/techtool/orders
```

System-admin routes stay root-level:

```txt
/
/tenants
/system
```

## Tenant Signature

Derive the current tenant signature from the first path segment:

```ts
const tenantSignature = location.pathname.split("/").filter(Boolean)[0] ?? null;
```

If `tenantSignature` is null, treat the current route as a system-admin route.

## API Tenant Context

For every tenant-scoped REST API call under `/<tenantSignature>`, attach:

```txt
X-Tenant-Signature: <tenantSignature>
```

For SignalR hubs opened from tenant-scoped routes, send:

```txt
?tenantSignature=<tenantSignature>
```

## Tenant Dashboard URL

Do not read `adminDashboardUrl` from the API. That field was removed.

Build tenant dashboard URLs like this:

```ts
const url = `https://admin.nekomin.com/${tenant.signature}`;
```

## Navigation Expectations

When system admin clicks a tenant card/list item:

```ts
navigate(`/${tenant.signature}`);
```

Tenant-sidebar links must preserve the current signature:

```ts
`/${tenantSignature}/products`
`/${tenantSignature}/orders`
`/${tenantSignature}/content/blogs`
```

Avoid absolute tenant routes like `/products` or `/orders`; those now belong under the tenant signature.
