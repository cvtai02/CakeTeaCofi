import type {
  ProductShippingResponse,
} from "../types/shipping";

export * from "../types/shipping";

export interface IShippingClient {
  // Contract method: getProductShipping - read-only product shipping detail for edit prefill.
  // Auth: TenantModeratorUp.
  // Response: src/Modules/Shipping/DTOs/ProductShipping/ProductShippingResponse.cs
  getProductShipping(productId: string): Promise<ProductShippingResponse>;
}
