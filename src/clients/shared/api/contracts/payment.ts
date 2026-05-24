import type {
  CreatePaymentCheckoutRequest,
  CreatePaymentCheckoutResponse,
  GetAdminPaymentTransactionResponse,
  ListPaymentMethodsResponse,
  PaymentTransactionResponse,
  PaymentWebhookRequest,
  PaymentWebhookResponse,
} from "../types/payment";

export * from "../types/payment"

export interface IPaymentClient {
  // Item response: src/Modules/Payment/DTOs/PaymentMethodResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/payment.ts.
  listPaymentMethods(): Promise<ListPaymentMethodsResponse>;

  // Auth: public for guest checkout token flow; authenticated customer checkout is ownership-checked.
  // Request: src/Modules/Payment/DTOs/CreateCheckoutRequest.cs
  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  createCheckout(orderCode: string, input: CreatePaymentCheckoutRequest): Promise<CreatePaymentCheckoutResponse>;

  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  getTransactionById(id: number): Promise<PaymentTransactionResponse>;

  // Contract method: getAdminTransactionById. TenantAdminUp transaction detail in the current tenant.
  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  getAdminTransactionById(id: number): Promise<GetAdminPaymentTransactionResponse>;

  // Request: src/Modules/Payment/DTOs/PaymentWebhookRequest.cs
  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  handleWebhook(provider: string, input: PaymentWebhookRequest): Promise<PaymentWebhookResponse>;
}
