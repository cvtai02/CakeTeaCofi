import type {
  AdminCreateOrderRequest,
  AdminCreateOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetAdminOrderByCodeResponse,
  ShipAdminOrderResponse,
  CancelAdminOrderRequest,
  CancelAdminOrderResponse,
  ListAdminOrdersQuery,
  ListAdminOrdersResponse,
  ListOrdersQuery,
  ListOrdersResponse,
  OrderResponse,
} from "../types/order";

export * from "../types/order"

export interface IOrderClient {
  // Request: src/Modules/Order/DTOs/Orders/CreateOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs. Guest response includes checkout token once.
  createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse>;

  // Auth: AuthenticatedUserUp. Returns only the current user's order.
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  getOrderByCode(code: string): Promise<OrderResponse>;

  // Auth: AuthenticatedUserUp. Returns only the current user's orders.
  // Query: src/Modules/Order/DTOs/Orders/ListOrdersRequest.cs
  // Item response: src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/order.ts.
  listOrders(query?: ListOrdersQuery): Promise<ListOrdersResponse>;

  // Contract method: adminCreateOrder. Tenant admin places an order for a selected customer profile.
  // Request: src/Modules/Order/DTOs/Orders/AdminCreateOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  adminCreateOrder(input: AdminCreateOrderRequest): Promise<AdminCreateOrderResponse>;

  // Contract method: listAdminOrders. Tenant admin order listing.
  // Query: src/Modules/Order/DTOs/Orders/ListOrdersRequest.cs
  // Item response: src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs
  listAdminOrders(query?: ListAdminOrdersQuery): Promise<ListAdminOrdersResponse>;

  // Contract method: getAdminOrderByCode. Tenant admin order detail.
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  getAdminOrderByCode(code: string): Promise<GetAdminOrderByCodeResponse>;

  // Contract method: shipAdminOrder. Tenant admin marks a paid order shipped.
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  shipAdminOrder(code: string): Promise<ShipAdminOrderResponse>;

  // Contract method: cancelAdminOrder. Tenant admin cancels an order with optional reason.
  // Request: src/Modules/Order/DTOs/Orders/CancelOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  cancelAdminOrder(code: string, input?: CancelAdminOrderRequest): Promise<CancelAdminOrderResponse>;
}
