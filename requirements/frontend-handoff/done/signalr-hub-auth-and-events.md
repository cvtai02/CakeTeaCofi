# SignalR Hub Auth And Events Handoff

Backend changed SignalR hub behavior for order and admin notifications.

## Order Hub

- Hub URL remains `/hubs/orders`.
- The hub connection itself can now be anonymous so guest orders can join with a scoped method.
- Authenticated customers/admins should call:
  - `JoinOrder(orderCode)`
  - `LeaveOrder(orderCode)`
- Guest/anonymous order tracking should call:
  - `JoinGuestOrder(orderCode, email)`
  - `LeaveOrder(orderCode)`
- Customer order list pages should still call:
  - `JoinMyOrders()`
  - `LeaveMyOrders()`
- Listen to `OrderNotification` as the canonical event for:
  - `OrderPlaced`
  - `OrderPaid`
  - `OrderRejected`
- Stop relying on the separate `OrderPlaced` SignalR event; backend no longer emits it to avoid duplicate updates.

## Notification Hub

- Hub URL remains `/hubs/notifications`.
- Admin notification payload event remains:
  - `NotificationReceived`
- Backend now sends admin notifications to a scoped admin group instead of `Clients.All`.
- No frontend payload shape change is expected.

---

## Completion Summary (2026-05-18)

Implemented in the nekomin client:

- `app/hooks/use-order-detail-hub.ts`: connection now starts anonymously when no
  auth token is available. Added optional `guestEmail` parameter — authenticated
  users invoke `JoinOrder(orderCode)`, guests invoke
  `JoinGuestOrder(orderCode, guestEmail)`. Cleanup still calls
  `LeaveOrder(orderCode)`. Removed the obsolete `OrderPlaced` SignalR listener;
  only `OrderNotification` is consumed.
- `app/hooks/use-my-orders-hub.ts`: removed the obsolete `OrderPlaced` SignalR
  listener; `JoinMyOrders`/`LeaveMyOrders` and the `OrderNotification` listener
  are unchanged.

No change needed for the admin notification hub
(`admin/src/hooks/use-notification-hub.ts`): it already authenticates via the
access token so the backend can scope it to the admin group, still listens to
`NotificationReceived`, and the payload shape is unchanged.

`npm run lint` for nekomin: 0 errors (only pre-existing unrelated `<img>` warnings).
