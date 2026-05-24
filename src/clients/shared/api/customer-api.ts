export { CustomerApiClient } from "./clients/customer-api";
export type {
  ICustomerAccountClient,
  ICustomerApiClient,
  ICustomerContentClient,
  ICustomerIdentityClient,
  ICustomerOrderClient,
  ICustomerPaymentClient,
  ICustomerProductCatalogClient,
  ICustomerShippingClient,
  ICustomerTenantManagementClient,
} from "./contracts/customer-api";

export * from "./types/account";
export * from "./types/content";
export * from "./types/identity";
export * from "./types/order";
export * from "./types/payment";
export * from "./types/productcatalog";
export * from "./types/shipping";
export * from "./types/tenantmanagement";
export * from "./contracts/common-types";
