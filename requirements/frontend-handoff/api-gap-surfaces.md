# API Gap Surfaces Frontend Handoff

Claude: wire the newly added backend API surfaces below, then move this file to `requirements/frontend-handoff/done/`.

Use shared client contracts under `src/clients/shared/api/contracts/`.

## Guest Checkout

- `POST /api/Order/orders` still supports public order creation.
- When the returned order has no `customerId`, persist `guestCheckoutToken` only long enough to call payment checkout.
- `POST /api/Payment/orders/{orderCode}/checkout` accepts `guestCheckoutToken` on `CreateCheckoutRequest`.
- Authenticated order checkout still works without a token and remains ownership-checked.

## Admin Order Fulfillment

- Use Order client admin methods for:
  - ship: `POST /api/Order/orders/admin/{code}/ship`
  - cancel: `POST /api/Order/orders/admin/{code}/cancel`
- Ship supports placed COD orders and paid online-payment orders.
- Cancel request body has optional `reason`.
- Invalid order state transitions are rejected by backend.

## Shipping

- Use Shipping client quote method for public shipping quote calculation.
- `POST /api/Shipping/quotes` request has:
  - `addressFrom`
  - `addressTo`
  - `items[]` with `variantId` and `quantity`
- Quote response includes `totalPrice` and per-variant package-level line totals.
- Sublocality lookup now returns `200` with `subLocalities`; it can be empty until the hardcoded VN catalog has ward rows for that locality.

## Tenant

- Storefront can call `GET /api/TenantManagement/current` for current tenant display metadata from the request host.
- System admin can activate/deactivate tenant rows through TenantManagement client methods.

## Notifications

- Current customer notification history is available through Account client methods:
  - list current user notifications
  - mark one read
  - mark all read
- Customer copies are persisted for placed order notifications when the order belongs to an authenticated customer.

---

## Triage / Partial Progress (2026-05-19)

This handoff bundles five independent surfaces. One was wired this cycle; the
rest are still pending and warrant their own focused handoffs/PRs. **Do not
move this file to `done/`** until the pending items below are addressed.

### Done

- **Tenant — activate / deactivate** (admin, 2026-05-19):
  `src/pages/tenants/index.tsx` exposes per-tenant Activate / Deactivate
  buttons with a confirmation dialog, calling
  `tenantManagementClient.activateTenant(id)` and
  `tenantManagementClient.deactivateTenant(id)`. The list query is
  invalidated on success.
- **Admin Order Fulfillment** (admin, 2026-05-19):
  `src/pages/orders/detail.tsx` adds "Ship" and "Cancel" header buttons
  gated by order status:
  - Ship visible for `Placed` / `Paid` (covers placed COD orders and paid
    online-payment orders); confirmation via `AlertDialog`; calls
    `orderClient.shipAdminOrder(code)`.
  - Cancel visible for `Draft` / `PendingInventory` / `Placed` / `Paid`;
    Dialog with a reason `Textarea`; calls `orderClient.cancelAdminOrder`.
  - Backend rejections (invalid state transitions etc.) surface via
    `toast.error(describeApiError(err, ...))` which prefers
    `ApiError.message`.
  - Successful actions invalidate the `["admin-order", orderCode]` query
    so the status badge and inline rejection-reason banner refresh.
  - Drive-by fix: the shipping-address grid's pre-existing TS2339s
    (`state` / `city`) were corrected to `administrativeArea` /
    `locality` / `subLocality` per the current shipping schema.

  **Backend gap logged**:
  `requirements/backend-handoff/cancel-admin-order-request-schema.md` —
  `CancelAdminOrderRequest` resolves to `undefined` because the OpenAPI
  document doesn't expose the `{ reason?: string | null }` body. Until
  fixed, `cancelAdminOrder(code)` is called without a body and the reason
  `Textarea` renders disabled with an inline hint. A single
  `cancelReasonSupported` constant flips behavior once the type lands.

### Pending

- **Guest Checkout** (nekomin): persist `guestCheckoutToken` from
  `POST /api/Order/orders` only long enough to call
  `POST /api/Payment/orders/{orderCode}/checkout` with it in
  `CreateCheckoutRequest`. Nekomin currently has no checkout-to-payment flow
  using the shared payment client; needs a dedicated implementation.
- **Shipping quote** (nekomin): wire `shippingClient.quoteShipping(...)` into
  the checkout shipping step. Handle empty `subLocalities` gracefully.
- **Tenant — `getCurrentTenant`** (nekomin): fetch and surface current-tenant
  display metadata (logo, name, etc.) in the storefront shell.
- **Customer notifications** (nekomin): list / mark-one-read / mark-all-read
  via the account client, replacing the current notification-center stub that
  only listens to SignalR.
