# Cancel Admin Order: Missing Request Body In OpenAPI

## Gap

The shared TS contract declares
`OrderClient.cancelAdminOrder(code, input?: CancelAdminOrderRequest)`, but
`CancelAdminOrderRequest` (generated in
`src/clients/shared/api/types/order.ts` via `JsonRequestBody<...>`)
resolves to `undefined`. TypeScript therefore rejects any object literal,
including the documented `{ reason?: string | null }`.

The backend DTO at
`src/Modules/Order/DTOs/Orders/CancelOrderRequest.cs` defines an optional
`Reason` field with `MaxLength(2000)`, but the OpenAPI document for
`POST /api/Order/orders/admin/{code}/cancel` does not currently expose a
request schema.

## Asks

1. Update the OpenAPI document for
   `POST /api/Order/orders/admin/{code}/cancel` so its request body schema
   matches `CancelOrderRequest.cs` (`{ reason?: string | null }`, optional
   body allowed).
2. Re-run the TS client codegen so
   `JsonRequestBody<CancelAdminOrderOperation>` resolves to that shape.

## Workaround (frontend)

`src/clients/admin/src/pages/orders/detail.tsx` invokes
`orderClient.cancelAdminOrder(orderCode)` without a body, and the cancel
dialog still renders the reason textarea but disabled with an inline hint
that points at this file. The mutation handler shape is ready to forward
`{ reason }` as soon as the request body type is generated — flipping a
single `cancelReasonSupported` constant re-enables it.
