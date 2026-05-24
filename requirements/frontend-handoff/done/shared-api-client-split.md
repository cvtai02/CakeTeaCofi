# Shared API Client Split

Shared clients now expose two audience-level entry points:

- `@modular-monolith/clients-shared/api/admin-api`
- `@modular-monolith/clients-shared/api/customer-api`

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Admin API

Use this import for system admin, tenant admin, and tenant moderator screens:

```ts
import { AdminApiClient } from "@modular-monolith/clients-shared/api/admin-api";
import type { IAdminApiClient } from "@modular-monolith/clients-shared/api/admin-api";
```

`AdminApiClient` exposes full module clients:

- `account`
- `content`
- `identity`
- `inventory`
- `order`
- `payment`
- `productCatalog`
- `shipping`
- `system`
- `tenantManagement`

This client includes system-admin, tenant-admin, and tenant-moderator API methods.

## Customer API

Use this import for storefront/customer screens:

```ts
import { CustomerApiClient } from "@modular-monolith/clients-shared/api/customer-api";
import type { ICustomerApiClient } from "@modular-monolith/clients-shared/api/customer-api";
```

`CustomerApiClient` exposes only customer/public-safe method groups:

- `account`: current profile, addresses, current-user notifications.
- `content`: published blog posts, public blog collections, public galleries.
- `identity`: login/register/current auth info.
- `order`: create order and current-user order reads.
- `payment`: payment methods, checkout creation, transaction read.
- `productCatalog`: customer product/category/collection list/detail APIs.
- `shipping`: address catalog and quote APIs.
- `tenantManagement`: current tenant metadata only.

Do not import admin module clients from storefront code once this split is adopted.

---

## Completion Summary (2026-05-19)

**Admin client** (`src/components/containers/api-client-provider.tsx`):

- Replaced the manual composition of nine module clients with a single
  `AdminApiClient` from `@shared/api/admin-api` (the in-repo equivalent of
  `@modular-monolith/clients-shared/api/admin-api`). The context now exposes an
  `IAdminApiClient` value.
- All existing module hooks (`useAccountClient`, `useContentClient`, …) keep
  the same external shape; they now resolve through `IAdminApiClient` instead
  of a custom object literal. Added `useShippingClient` (now reachable through
  the audience client) and `useAdminApi()` for consumers that want the whole
  client.

**Backend gap** logged to
`requirements/backend-handoff/admin-api-client-identity-url.md`:

- `AdminApiClient` / `CustomerApiClient` take a single `apiBaseUrl`, but both
  admin and nekomin apps split `API_BASE_URL` from `API_IDENTITY_URL`. Until
  the shared client accepts a separate identity URL, the admin provider keeps
  composing `IdentityClient(appFetch, API_IDENTITY_URL)` separately and
  patches it onto the `AdminApiClient` instance before exposing it through
  context. This preserves dual-URL behavior with zero impact on consumers.

**Customer/storefront (nekomin)**: storefront code does not currently consume
any shared API clients (`grep "@shared/api"` returns no matches under
`src/clients/nekomin/app`). The handoff instruction is recorded as guidance:
when storefront code is added, it should import `CustomerApiClient` from
`@shared/api/customer-api` rather than reaching into per-module clients or
`AdminApiClient`. Same dual-URL caveat applies once a nekomin API provider is
introduced.

`npm run lint` (admin): 0 errors; `tsc -b` clean for changed files.
