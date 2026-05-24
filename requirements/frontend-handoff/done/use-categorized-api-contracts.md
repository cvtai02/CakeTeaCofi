# Use Categorized API Contracts

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Requirement

Update frontend API interface imports to use only the categorized contract folders:

- `src/clients/shared/api/contracts/admin/`
- `src/clients/shared/api/contracts/customer/`

Do not import API client interfaces from module-level contract files anymore, such as:

- `src/clients/shared/api/contracts/account.ts`
- `src/clients/shared/api/contracts/content.ts`
- `src/clients/shared/api/contracts/identity.ts`
- `src/clients/shared/api/contracts/order.ts`
- `src/clients/shared/api/contracts/payment.ts`
- `src/clients/shared/api/contracts/productcatalog.ts`
- `src/clients/shared/api/contracts/shipping.ts`
- `src/clients/shared/api/contracts/system.ts`
- `src/clients/shared/api/contracts/tenantmanagement.ts`
- `src/clients/shared/api/contracts/index.ts`

Those module-level contract files are backend-maintained building blocks only.

## Admin App

For system admin, tenant admin, and tenant moderator surfaces, import from:

```ts
import type { IAdminApiClient } from "@modular-monolith/clients-shared/api/contracts/admin";
```

Use `IAdminApiClient` as the API context/interface type. Access module clients through:

```ts
api.account
api.content
api.identity
api.inventory
api.order
api.payment
api.productCatalog
api.shipping
api.system
api.tenantManagement
```

## Customer App

For storefront/customer/public-safe surfaces, import from:

```ts
import type { ICustomerApiClient } from "@modular-monolith/clients-shared/api/contracts/customer";
```

Use `ICustomerApiClient` as the API context/interface type. Access allowed client groups through:

```ts
api.account
api.content
api.identity
api.order
api.payment
api.productCatalog
api.shipping
api.tenantManagement
```

The customer contract intentionally exposes only public/customer-safe methods.

## Type Imports

Generated request/response DTO types may still be imported from:

```ts
@modular-monolith/clients-shared/api/types/<module>
```

Only API client interface imports must move to `contracts/admin` or `contracts/customer`.

---

## Completion Summary (2026-05-19)

**Client interface imports → `contracts/admin` barrel:**

- `src/components/containers/api-client-provider.tsx` — `IAdminApiClient`
  moved from `@shared/api/admin-api` to `@shared/api/contracts/admin`. The
  value `AdminApiClient` (implementation) is still imported from
  `@shared/api/admin-api`, per "Only API client interface imports must move".
- `src/pages/products/components/ImportInventoryDialog.tsx` — replaced
  `IInventoryClient` from `@shared/api/contracts/inventory` with a local type
  alias `IAdminApiClient["inventory"]` (interface comes from the categorized
  barrel; no module-level contract import remains).

**DTO type imports → `types/<module>`:**

- `src/hooks/use-notification-hub.ts` — `NotificationResponse`
  (account).
- `src/pages/collections/components/CollectionFormLayout.tsx`,
  `ProductPickerModal.tsx`, `edit.tsx`, `index.tsx` —
  `ProductResponse` / `CollectionResponse` (productcatalog).
- `src/pages/content/blog-post-collections/components/BlogPostCollectionFormLayout.tsx`,
  `BlogPostPickerModal.tsx`,
  `src/pages/content/blog-post-collections/index.tsx`,
  `src/pages/content/blogs/index.tsx` — `BlogPostSummary` /
  `BlogPostCollectionSummaryResponse` /
  `AdminBlogPostCollectionGroupResponse` (content).
- `src/pages/orders/components/CustomerPickerModal.tsx`,
  `src/pages/orders/components/VariantPickerModal.tsx`,
  `src/pages/orders/create.tsx` — `AccountProfileResponse` /
  `ProductResponse` / `VariantResponse`.

**`contracts/common-types` left in place** (10 files):
`ApiError`, `ValidationError`, `currencies`, `CurrencyCode` are shared
classes / constants, not module client interfaces, so they don't fall under
the rule "Only API client interface imports must move to `contracts/admin`
or `contracts/customer`."

**Customer/storefront (nekomin)**: no `@shared/api` imports exist anywhere
under `src/clients/nekomin/app`, so nothing to migrate. Guidance recorded for
new storefront code: import `ICustomerApiClient` from
`@shared/api/contracts/customer`; DTO types may still come from
`@shared/api/types/<module>`.

**Verification**:

- Final `grep -r "@shared/api/contracts/" src/clients/admin/src` returns only
  `contracts/admin` (the categorized barrel) and `contracts/common-types`
  — zero module-level client-interface imports remain.
- `tsc -b` (admin): clean for the changed files (pre-existing project-wide
  TS errors in unrelated files are unchanged).
- `npm run lint` (admin): 0 errors; same 4 pre-existing warnings in
  untouched files.
