import type { IAccountClient } from "../account";
import type { IContentClient } from "../content";
import type { IIdentityClient } from "../identity";
import type { IOrderClient } from "../order";
import type { IPaymentClient } from "../payment";
import type { IProductCatalogClient } from "../productcatalog";
import type { IShippingClient } from "../shipping";
import type { ITenantManagementClient } from "../tenantmanagement";

export type ICustomerAccountClient = Pick<
  IAccountClient,
  | "getMe"
  | "updateMe"
  | "listMyAddresses"
  | "createMyAddress"
  | "updateMyAddress"
  | "deleteMyAddress"
  | "listMyNotifications"
  | "markMyNotificationRead"
  | "markAllMyNotificationsRead"
>;

export type ICustomerContentClient = Pick<
  IContentClient,
  | "listPublishedBlogPosts"
  | "getPublishedBlogPostBySlug"
  | "getPublicBlogPostCollectionByKey"
  | "listPublicBlogPostCollections"
  | "getPublicGalleryByKey"
>;

export type ICustomerIdentityClient = IIdentityClient;

export type ICustomerOrderClient = Pick<
  IOrderClient,
  "createOrder" | "getOrderByCode" | "listOrders"
>;

export type ICustomerPaymentClient = Pick<
  IPaymentClient,
  "listPaymentMethods" | "createCheckout" | "getTransactionById"
>;

export type ICustomerProductCatalogClient = Pick<
  IProductCatalogClient,
  | "listCustomerCategory"
  | "getCustomerCategory"
  | "getCustomerCategoryBySlug"
  | "listCustomerCollection"
  | "getCustomerCollection"
  | "getCustomerCollectionBySlug"
  | "listCustomerProduct"
  | "getCustomerProduct"
  | "getCustomerProductBySlug"
>;

export type ICustomerShippingClient = Pick<
  IShippingClient,
  | "listShippingCountries"
  | "listShippingAdministrativeAreas"
  | "listShippingLocalities"
  | "listShippingSubLocalities"
  | "listShippingAddresses"
  | "createShippingQuote"
>;

export type ICustomerTenantManagementClient = Pick<
  ITenantManagementClient,
  "getCurrentTenant"
>;

export interface ICustomerApiClient {
  account: ICustomerAccountClient;
  content: ICustomerContentClient;
  identity: ICustomerIdentityClient;
  order: ICustomerOrderClient;
  payment: ICustomerPaymentClient;
  productCatalog: ICustomerProductCatalogClient;
  shipping: ICustomerShippingClient;
  tenantManagement: ICustomerTenantManagementClient;
}
