# Payment API

Base route: `/api/Payment`

## Endpoints

Client contract: [PaymentClient](../../../clients/shared/api/clients/payment.ts), [IPaymentClient](../../../clients/shared/api/contracts/payment.ts)

- `GET /api/Payment/methods`
  - Authorization: public.
  - Lists supported payment methods.

- `POST /api/Payment/orders/{orderCode}/checkout`
  - Authorization: public for guest checkout token flow; authenticated customer checkout remains ownership-checked.
  - `orderCode` is the order code string.
  - Creates or returns an active checkout transaction for a pending-payment order owned by the current user, or an anonymous order with a valid guest checkout token.

- `GET /api/Payment/transactions/{id}`
  - Authorization: authenticated user.
  - Returns a non-deleted payment transaction owned by the current user.

- `GET /api/Payment/admin/transactions/{id}`
  - Authorization: TenantAdminUp.
  - Returns a non-deleted tenant payment transaction for admin workflows.

- `POST /api/Payment/webhooks/{provider}`
  - Authorization: public provider callback.
  - Applies provider payment status updates.

## DTO References

- Payments: [CreateCheckoutRequest](../DTOs/CreateCheckoutRequest.cs), [PaymentMethodResponse](../DTOs/PaymentMethodResponse.cs), [PaymentTransactionResponse](../DTOs/PaymentTransactionResponse.cs), [PaymentWebhookRequest](../DTOs/PaymentWebhookRequest.cs)
