# Payment Admin Transaction Read

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Backend Changes

- `GET /api/Payment/transactions/{id}`
  - Auth: `AuthenticatedUserUp`.
  - Now returns a transaction only when `CustomerId` matches the current user.
  - Returns `404` when the transaction does not exist or belongs to another user.

- `GET /api/Payment/admin/transactions/{id}`
  - Auth: `TenantAdminUp`.
  - Returns a non-deleted payment transaction in the current tenant.
  - Response DTO: `src/Modules/Payment/DTOs/PaymentTransactionResponse.cs`.

## Shared Client

Use `PaymentClient.getAdminTransactionById(id)` from:

- `src/clients/shared/api/clients/payment.ts`
- `src/clients/shared/api/contracts/payment.ts`

Admin apps can also access it through `AdminApiClient.payment.getAdminTransactionById(id)`.

Storefront/customer apps should keep using `CustomerApiClient.payment.getTransactionById(id)`.

---

## Completion Summary (2026-05-19)

**Admin client**:

- New route `/payments/transactions/:id` in `src/routes.tsx`, with a matching
  helper `ROUTES.paymentTransactionDetail(id)` in `src/configs/routes.ts`.
- New page `src/pages/payments/transaction-detail.tsx` calling
  `paymentClient.getAdminTransactionById(parsedId)` (resolved through the
  refactored `AdminApiClient` provider). It validates the URL id is a positive
  integer before issuing the query, shows skeletons while loading, an
  `AdminErrorState` on failure (covers both 404-not-in-tenant and forbidden
  cases), and a structured detail grid for the success path: order code
  (linking to the existing admin order detail route), customer id (or "Guest"
  when null), amount (formatted with `Intl.NumberFormat`), provider,
  provider payment id, checkout URL, paid/cancelled timestamps, created /
  last-modified, optional failure reason, and a status badge variant derived
  from the response status string.

**Customer/storefront**: no consumer of `getTransactionById` exists in nekomin
today; the handoff's storefront direction (use
`CustomerApiClient.payment.getTransactionById`) is recorded as guidance and
will be applied when the storefront introduces a transaction view.

`npm run lint` (admin): 0 errors; `tsc -b` clean for changed files.
